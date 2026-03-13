"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  BookOpenText,
  CheckCircle2,
  HandsPraying,
  LoaderCircle,
  MessageCircle,
} from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiEnvelope } from "@/lib/auth/types";
import type {
  WhatsAppAudiobookSubscription,
  WhatsAppBibleBook,
  WhatsAppCancelResponse,
  WhatsAppPromiseSubscription,
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { ChatCircleIcon } from "@phosphor-icons/react";

type SubscriptionMode = "audiobooks" | "promises";

function normalizeWhatsappNumber(value: string) {
  return value.replace(/\D/g, "");
}

function formatWhatsappNumber(value: string) {
  const digits = normalizeWhatsappNumber(value).slice(0, 11);
  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);

  if (!ddd) {
    return "";
  }

  if (number.length === 0) {
    return `(${ddd}`;
  }

  if (number.length <= 4) {
    return `(${ddd}) ${number}`;
  }

  if (number.length <= 8) {
    return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
  }

  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5, 9)}`;
}

function formatDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

function formatDateTimeLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

const PROMISE_MIN_DATE = formatDateInputValue(new Date());
const PROMISE_MAX_DATE = (() => {
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  return formatDateInputValue(nextYear);
})();

export function WhatsAppSubscriptionPanel() {
  const [mode, setMode] = useState<SubscriptionMode>("audiobooks");
  const [books, setBooks] = useState<WhatsAppBibleBook[]>([]);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState("");
  const [selectedBookAbbrev, setSelectedBookAbbrev] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [promiseEndDate, setPromiseEndDate] = useState("");
  const [activeAudiobookSubscriptions, setActiveAudiobookSubscriptions] = useState<
    WhatsAppAudiobookSubscription[]
  >([]);
  const [activePromiseSubscriptions, setActivePromiseSubscriptions] = useState<
    WhatsAppPromiseSubscription[]
  >([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [activeError, setActiveError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancellingMode, setCancellingMode] = useState<SubscriptionMode | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const hasActiveAudiobooks = activeAudiobookSubscriptions.length > 0;
  const hasActivePromises = activePromiseSubscriptions.length > 0;
  const exclusiveActiveMode: SubscriptionMode | null =
    hasActiveAudiobooks && !hasActivePromises
      ? "audiobooks"
      : hasActivePromises && !hasActiveAudiobooks
        ? "promises"
        : null;
  const isAudiobooksBlocked = exclusiveActiveMode === "promises";
  const isPromisesBlocked = exclusiveActiveMode === "audiobooks";
  const isCurrentModeBlocked = mode === "audiobooks" ? isAudiobooksBlocked : isPromisesBlocked;
  const hasActiveForMode = mode === "audiobooks" ? hasActiveAudiobooks : hasActivePromises;

  const loadActiveSubscriptions = useCallback(async () => {
    setActiveLoading(true);
    setActiveError("");

    try {
      const [audiobooksResponse, promisesResponse] = await Promise.all([
        fetch("/api/whatsapp/audiobooks", { cache: "no-store" }),
        fetch("/api/whatsapp/promises", { cache: "no-store" }),
      ]);

      const [audiobooksPayload, promisesPayload] = await Promise.all([
        audiobooksResponse.json() as Promise<ApiEnvelope<WhatsAppAudiobookSubscription[]>>,
        promisesResponse.json() as Promise<ApiEnvelope<WhatsAppPromiseSubscription[]>>,
      ]);

      const errors: string[] = [];

      if (
        !audiobooksResponse.ok ||
        audiobooksPayload.status !== "success" ||
        !Array.isArray(audiobooksPayload.data)
      ) {
        setActiveAudiobookSubscriptions([]);
        errors.push(audiobooksPayload.message ?? "Nao foi possivel carregar envios ativos de livros.");
      } else {
        setActiveAudiobookSubscriptions(audiobooksPayload.data);
      }

      if (
        !promisesResponse.ok ||
        promisesPayload.status !== "success" ||
        !Array.isArray(promisesPayload.data)
      ) {
        setActivePromiseSubscriptions([]);
        errors.push(promisesPayload.message ?? "Nao foi possivel carregar envios ativos de promessas.");
      } else {
        setActivePromiseSubscriptions(promisesPayload.data);
      }

      if (errors.length > 0) {
        setActiveError(errors.join(" "));
      }
    } catch {
      setActiveError("Nao foi possivel carregar os envios ativos no momento.");
    } finally {
      setActiveLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActiveSubscriptions();
  }, [loadActiveSubscriptions]);

  useEffect(() => {
    if (mode !== "audiobooks" || booksLoaded) {
      return;
    }

    let mounted = true;

    async function loadBooks() {
      setBooksLoading(true);
      setBooksError("");

      try {
        const response = await fetch("/api/whatsapp/bible-books", { cache: "no-store" });
        const payload = (await response.json()) as ApiEnvelope<WhatsAppBibleBook[]>;

        if (!response.ok || payload.status !== "success" || !payload.data) {
          if (!mounted) {
            return;
          }
          setBooksError(payload.message ?? "Nao foi possivel carregar os livros da Biblia.");
          return;
        }

        if (!mounted) {
          return;
        }

        const sortedBooks = [...payload.data].sort((first, second) =>
          first.name.localeCompare(second.name, "pt-BR"),
        );

        setBooks(sortedBooks);
        setSelectedBookAbbrev((current) => current || sortedBooks[0]?.abbrev || "");
      } catch {
        if (mounted) {
          setBooksError("Nao foi possivel conectar ao servidor.");
        }
      } finally {
        if (mounted) {
          setBooksLoading(false);
          setBooksLoaded(true);
        }
      }
    }

    void loadBooks();

    return () => {
      mounted = false;
    };
  }, [booksLoaded, mode]);

  useEffect(() => {
    if (!exclusiveActiveMode || mode === exclusiveActiveMode) {
      return;
    }

    setMode(exclusiveActiveMode);
  }, [exclusiveActiveMode, mode]);

  function handleModeChange(nextMode: SubscriptionMode) {
    if ((nextMode === "audiobooks" && isAudiobooksBlocked) || (nextMode === "promises" && isPromisesBlocked)) {
      return;
    }

    setMode(nextMode);
    setSubmitError("");
    setSuccessMessage("");
  }

  function handleRetryBooks() {
    setBooksLoaded(false);
    setBooksError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || activeLoading || hasActiveForMode) {
      return;
    }

    if (isCurrentModeBlocked) {
      setSubmitError(
        mode === "audiobooks"
          ? "Cancele o envio de promessas para ativar livros."
          : "Cancele o envio de livros para ativar promessas.",
      );
      return;
    }

    setSubmitError("");
    setSuccessMessage("");

    const normalizedWhatsapp = normalizeWhatsappNumber(whatsappNumber);

    if (normalizedWhatsapp.length < 10) {
      setSubmitError("Informe um numero de WhatsApp valido com DDI e DDD.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "audiobooks") {
        const selectedBook = books.find((book) => book.abbrev === selectedBookAbbrev);

        if (!selectedBook) {
          setSubmitError("Selecione um livro da Biblia para continuar.");
          return;
        }

        const currentChapter = 0;
        const nextChapter = 1;

        const response = await fetch("/api/whatsapp/audiobooks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            book: selectedBook.name,
            abbrev: selectedBook.abbrev,
            whatsappNumber: normalizedWhatsapp,
            totalChapters: selectedBook.totalChapters,
            currentChapter,
            nextChapter,
          }),
        });
        const payload = (await response.json()) as ApiEnvelope<WhatsAppAudiobookSubscription>;

        if (!response.ok || payload.status !== "success" || !payload.data) {
          setSubmitError(payload.message ?? "Nao foi possivel criar a assinatura do audiobook.");
          return;
        }

        setActiveAudiobookSubscriptions([payload.data]);
        setSuccessMessage(
          `Assinatura criada com sucesso. Voce recebera 1 capitulo por dia de ${selectedBook.name}.`,
        );
        return;
      }

      if (!promiseEndDate) {
        setSubmitError("Informe ate quando deseja receber as promessas.");
        return;
      }

      if (promiseEndDate < PROMISE_MIN_DATE || promiseEndDate > PROMISE_MAX_DATE) {
        setSubmitError("A data final das promessas deve estar entre hoje e no maximo 1 ano.");
        return;
      }

      const endDate = `${promiseEndDate}T23:59:59.999Z`;
      const response = await fetch("/api/whatsapp/promises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          whatsappNumber: normalizedWhatsapp,
          endDate,
        }),
      });
      const payload = (await response.json()) as ApiEnvelope<WhatsAppPromiseSubscription>;

      if (!response.ok || payload.status !== "success" || !payload.data) {
        setSubmitError(payload.message ?? "Nao foi possivel criar a assinatura de promessas.");
        return;
      }

      setActivePromiseSubscriptions([payload.data]);
      setSuccessMessage(
        `Assinatura de promessas ativa ate ${formatDateLabel(payload.data.endDate)}. Verifique seu WhatsApp diariamente.`,
      );
    } catch {
      setSubmitError("Nao foi possivel conectar ao servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelActiveSubscription() {
    if (submitting || activeLoading || cancellingMode || !hasActiveForMode) {
      return;
    }

    setSubmitError("");
    setSuccessMessage("");
    setCancellingMode(mode);

    try {
      const endpoint =
        mode === "audiobooks"
          ? "/api/whatsapp/audiobooks/cancel"
          : "/api/whatsapp/promises/cancel";

      const response = await fetch(endpoint, {
        method: "PATCH",
      });
      const payload = (await response.json()) as ApiEnvelope<WhatsAppCancelResponse>;

      if (!response.ok || payload.status !== "success") {
        setSubmitError(
          payload.message ??
            (mode === "audiobooks"
              ? "Nao foi possivel cancelar o envio de livros."
              : "Nao foi possivel cancelar o envio de promessas."),
        );
        return;
      }

      if (mode === "audiobooks") {
        setActiveAudiobookSubscriptions([]);
        setBooksLoaded(false);
      } else {
        setActivePromiseSubscriptions([]);
      }

      setSuccessMessage(
        payload.data?.message ??
          (mode === "audiobooks"
            ? "Envio de livros cancelado com sucesso."
            : "Envio de promessas cancelado com sucesso."),
      );
    } catch {
      setSubmitError("Nao foi possivel conectar ao servidor.");
    } finally {
      setCancellingMode(null);
    }
  }

  return (
    <div className="rounded-[24px] border border-border/60 bg-card/82">
      <div className="border-b border-border/60 px-4 py-5 md:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-highlight">
          <ChatCircleIcon className="size-3.5" />
          Envios no WhatsApp
        </div>
        <h3 className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">
          Escolha o que deseja receber
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Um capitulo por dia até terminar o livro escolhido ou promessas diarias até a data que escolher.
        </p>
        {exclusiveActiveMode ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Enquanto o envio de{" "}
            {exclusiveActiveMode === "audiobooks" ? "livros da Biblia" : "promessas"} estiver ativo, a outra opção
            fica bloqueada.
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => handleModeChange("audiobooks")}
            aria-pressed={mode === "audiobooks"}
            disabled={isAudiobooksBlocked}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/35",
              isAudiobooksBlocked
                ? "cursor-not-allowed border-border/50 bg-background/40 opacity-65"
                : mode === "audiobooks"
                  ? "border-highlight/55 bg-highlight/12"
                  : "border-border/60 bg-background/60 hover:border-highlight/30",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <BookOpenText className="size-4 text-highlight" />
                Livros da Biblia
              </p>
              <div className="flex items-center gap-1.5">
                {isAudiobooksBlocked ? (
                  <span className="rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Bloqueado
                  </span>
                ) : null}
                {mode === "audiobooks" ? (
                  <span className="rounded-full border border-highlight/45 bg-highlight/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-highlight">
                    Selecionado
                  </span>
                ) : null}
                {hasActiveAudiobooks ? (
                  <span className="rounded-full border border-success/35 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    Ativo
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Receba 1 capitulo por dia no WhatsApp do livro que escolher.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("promises")}
            aria-pressed={mode === "promises"}
            disabled={isPromisesBlocked}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/35",
              isPromisesBlocked
                ? "cursor-not-allowed border-border/50 bg-background/40 opacity-65"
                : mode === "promises"
                  ? "border-highlight/55 bg-highlight/12"
                  : "border-border/60 bg-background/60 hover:border-highlight/30",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <HandsPraying className="size-4 text-highlight" />
                Promessas
              </p>
              <div className="flex items-center gap-1.5">
                {isPromisesBlocked ? (
                  <span className="rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Bloqueado
                  </span>
                ) : null}
                {mode === "promises" ? (
                  <span className="rounded-full border border-highlight/45 bg-highlight/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-highlight">
                    Selecionado
                  </span>
                ) : null}
                {hasActivePromises ? (
                  <span className="rounded-full border border-success/35 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    Ativo
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Receba uma mensagem diaria com promessas biblicas.
            </p>
          </button>
        </div>
      </div>

      <div className="px-4 py-5 md:px-6">
        {activeLoading ? (
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/65 px-4 py-3 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Carregando envios ativos...
          </div>
        ) : hasActiveForMode ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="size-4" />
                {mode === "audiobooks" ? "Envio de livros ativo" : "Envio de promessas ativo"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "audiobooks"
                  ? "Ja existe envio de livro ativo para este perfil."
                  : "Ja existe envio de promessas ativo para este perfil."}
              </p>
            </div>

            {mode === "audiobooks"
              ? activeAudiobookSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="rounded-xl border border-border/60 bg-background/65 px-4 py-3">
                    <p className="text-base font-semibold text-foreground">{subscription.book}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      WhatsApp: {subscription.whatsappNumber}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ativado em: {formatDateTimeLabel(subscription.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Proximo capitulo: {subscription.nextChapter}
                    </p>
                  </div>
                ))
              : activePromiseSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="rounded-xl border border-border/60 bg-background/65 px-4 py-3">
                    <p className="text-base font-semibold text-foreground">Promessas biblicas</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      WhatsApp: {subscription.whatsappNumber}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ativado em: {formatDateTimeLabel(subscription.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ativo ate: {formatDateLabel(subscription.endDate)}
                    </p>
                  </div>
                ))}

            <Button
              type="button"
              variant="danger"
              className="h-11 rounded-full px-6"
              onClick={handleCancelActiveSubscription}
              disabled={cancellingMode === mode}
            >
              {cancellingMode === mode ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Cancelando envio...
                </>
              ) : mode === "audiobooks" ? (
                "Cancelar envio de livros"
              ) : (
                "Cancelar envio de promessas"
              )}
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "audiobooks" ? (
              <div className="space-y-2">
                <label htmlFor="whatsapp-book" className="text-sm font-medium text-foreground">
                  Livro da Biblia
                </label>

                {booksLoading ? (
                  <div className="flex h-12 items-center gap-2 rounded-xl border border-border/60 bg-background/65 px-4 text-sm text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin" />
                    Carregando livros...
                  </div>
                ) : books.length > 0 ? (
                  <select
                    id="whatsapp-book"
                    value={selectedBookAbbrev}
                    onChange={(event) => setSelectedBookAbbrev(event.target.value)}
                    className="flex h-12 w-full rounded-xl border border-border/60 bg-background/75 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  >
                    <option value="" disabled>
                      Selecione um livro
                    </option>
                    {books.map((book) => (
                      <option key={book.abbrev} value={book.abbrev}>
                        {book.name} ({book.totalChapters} capitulos)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-3 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
                    <p>{booksError || "Nenhum livro disponivel para assinatura."}</p>
                    <Button type="button" variant="secondary" size="sm" onClick={handleRetryBooks}>
                      Tentar novamente
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="promise-end-date" className="text-sm font-medium text-foreground">
                  Receber promessas ate
                </label>
                <Input
                  id="promise-end-date"
                  type="date"
                  min={PROMISE_MIN_DATE}
                  max={PROMISE_MAX_DATE}
                  value={promiseEndDate}
                  onChange={(event) => setPromiseEndDate(event.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Escolha uma data entre hoje e no maximo 1 ano.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="whatsapp-number" className="text-sm font-medium text-foreground">
                Numero do WhatsApp
              </label>
              <Input
                id="whatsapp-number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(51) 99999-9999"
                value={whatsappNumber}
                onChange={(event) => setWhatsappNumber(formatWhatsappNumber(event.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Informe no formato (51) 99999-9999.
              </p>
            </div>

            <Button
              type="submit"
              className="h-12 rounded-full px-6"
              disabled={
                submitting || activeLoading || isCurrentModeBlocked || (mode === "promises" && !promiseEndDate)
              }
            >
              {submitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="size-4" />
                  {mode === "audiobooks"
                    ? "Ativar livro no WhatsApp"
                    : "Ativar promessas no WhatsApp"}
                </>
              )}
            </Button>
          </form>
        )}

        {activeError ? (
          <div className="mt-4 rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
            {activeError}
          </div>
        ) : null}

        {submitError ? (
          <div className="mt-4 rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
            {submitError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
            <p className="inline-flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4" />
              Operacao concluida
            </p>
            <p className="mt-1">{successMessage}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
