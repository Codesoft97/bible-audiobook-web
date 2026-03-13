"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  BookOpenText,
  CheckCircle2,
  Clock3,
  NotebookIcon,
  PersonSimpleHike,
  Sparkles,
  LoaderCircle,
  RefreshCw,
  Trash2,
} from "@/components/icons";

import type { ApiEnvelope } from "@/lib/auth/types";
import type { Audiobook } from "@/lib/audiobooks";
import { formatBookLabel } from "@/lib/audiobooks";
import type { CharacterJourney } from "@/lib/character-journeys";
import type {
  HistoryContentType,
  ListeningHistoryEntry,
  ListeningHistoryListPayload,
} from "@/lib/history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PAGE_LIMIT = 20;

function formatSeconds(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "00:00";
  }

  const total = Math.floor(value);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatLastListenedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

interface HistoryPanelProps {
  initialAudiobooks: Audiobook[];
  initialCharacterJourneys: CharacterJourney[];
  initialParables: CharacterJourney[];
  initialTeachings: CharacterJourney[];
  onOpenContent?: (contentType: HistoryContentType) => void;
}

export function HistoryPanel({
  initialAudiobooks,
  initialCharacterJourneys,
  initialParables,
  initialTeachings,
  onOpenContent,
}: HistoryPanelProps) {
  const [items, setItems] = useState<ListeningHistoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");

  const audiobookById = useMemo(
    () => new Map(initialAudiobooks.map((item) => [item.id, item])),
    [initialAudiobooks],
  );

  const journeyById = useMemo(
    () => new Map(initialCharacterJourneys.map((item) => [item.id, item])),
    [initialCharacterJourneys],
  );

  const parableById = useMemo(
    () => new Map(initialParables.map((item) => [item.id, item])),
    [initialParables],
  );

  const teachingById = useMemo(
    () => new Map(initialTeachings.map((item) => [item.id, item])),
    [initialTeachings],
  );

  const loadHistory = useCallback(async (offset: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError("");
    }

    try {
      const response = await fetch(`/api/history?limit=${PAGE_LIMIT}&offset=${offset}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiEnvelope<ListeningHistoryListPayload>;

      if (!response.ok || payload.status !== "success" || !payload.data) {
        setError(payload.message ?? "Nao foi possivel carregar o histórico.");
        return;
      }

      setItems((current) =>
        append ? [...current, ...payload.data!.items] : payload.data!.items,
      );
      setTotal(payload.data.total);
      setError("");
    } catch {
      setError("Nao foi possivel carregar o histórico.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory(0, false);
  }, [loadHistory]);

  async function handleDelete(entryId: string) {
    setRemovingId(entryId);

    try {
      const response = await fetch(`/api/history/${encodeURIComponent(entryId)}`, {
        method: "DELETE",
      });

      if (response.status !== 204) {
        const payload = (await response.json().catch(() => null)) as ApiEnvelope<null> | null;
        setError(payload?.message ?? "Nao foi possivel remover o item do histórico.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== entryId));
      setTotal((currentTotal) => Math.max(0, currentTotal - 1));
    } catch {
      setError("Nao foi possivel remover o item do histórico.");
    } finally {
      setRemovingId("");
    }
  }

  const canLoadMore = items.length < total;

  function readContentMetadata(item: ListeningHistoryEntry) {
    if (item.contentType === "bible") {
      const audiobook = audiobookById.get(item.contentId);
      const title = audiobook
        ? `${formatBookLabel(audiobook.book)} - Capitulo ${audiobook.chapter}`
        : "Audiobook biblico";

      return {
        title,
        subtitle: "Audiobook biblico",
        coverImageUrl: audiobook?.coverImageUrl ?? "",
      };
    }

    if (item.contentType === "parable") {
      const parable = parableById.get(item.contentId);

      return {
        title: parable?.titulo ?? "Parabola",
        subtitle: parable?.categoria ?? "Parabola",
        coverImageUrl: parable?.coverImageUrl ?? "",
      };
    }

    if (item.contentType === "teaching") {
      const teaching = teachingById.get(item.contentId);

      return {
        title: teaching?.titulo ?? "Ensinamento",
        subtitle: teaching?.categoria ?? "Ensinamento",
        coverImageUrl: teaching?.coverImageUrl ?? "",
      };
    }

    const journey = journeyById.get(item.contentId);

    return {
      title: journey?.titulo ?? "Jornada de personagem",
      subtitle: journey?.categoria ?? "Jornada de personagem",
      coverImageUrl: journey?.coverImageUrl ?? "",
    };
  }

  return (
    <div className="space-y-5">
      <div className="surface rounded-[24px] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Clock3 className="size-3.5 text-highlight" />
              Histórico individual
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-foreground md:text-[2.15rem]">
              Continue de onde parou
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Cada perfil possui seu próprio histórico de conteúdos reproduzidos.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge className="bg-highlight/15 text-highlight">{total} itens</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void loadHistory(0, false)}
              disabled={loading}
            >
              <RefreshCw className="size-4" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <Card className="rounded-[24px] border-border/70 bg-background/70 p-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <LoaderCircle className="size-4 animate-spin" />
            Carregando histórico...
          </div>
        </Card>
      ) : null}

      {!loading && items.length === 0 ? (
        <Card className="rounded-[24px] border-border/70 bg-background/70 p-6">
          <p className="text-lg font-semibold text-foreground">Nenhum item no histórico</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Comece a ouvir um audiobook ou jornada para registrar progresso aqui.
          </p>
        </Card>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => {
            const progress =
              item.totalDurationSeconds > 0
                ? Math.min(100, (item.currentPositionSeconds / item.totalDurationSeconds) * 100)
                : 0;
            const metadata = readContentMetadata(item);

            return (
              <Card key={item.id} className="rounded-[20px] border-border/70 bg-background/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="relative mt-0.5 size-14 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-accent/45">
                      {metadata.coverImageUrl ? (
                        <Image
                          src={metadata.coverImageUrl}
                          alt={metadata.title}
                          fill
                          unoptimized
                          sizes="56px"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-highlight">
                          {item.contentType === "bible" ? (
                            <BookOpenText className="size-5" />
                          ) : item.contentType === "character-journey" ? (
                            <PersonSimpleHike className="size-5" />
                          ) : item.contentType === "teaching" ? (
                            <NotebookIcon className="size-5" />
                          ) : (
                            <Sparkles className="size-5" />
                          )}
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-1.5">
                        <div className="ml-auto flex size-5 items-center justify-center rounded-full bg-background/85 text-highlight shadow-sm">
                          {item.contentType === "bible" ? (
                            <BookOpenText className="size-3" />
                          ) : item.contentType === "character-journey" ? (
                            <PersonSimpleHike className="size-3" />
                          ) : item.contentType === "teaching" ? (
                            <NotebookIcon className="size-3" />
                          ) : (
                            <Sparkles className="size-3" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-foreground">{metadata.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{metadata.subtitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Última reprodução: {formatLastListenedAt(item.lastListenedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                    {item.completed ? (
                      <Badge className="border-success/30 bg-success/10 text-success">
                        <CheckCircle2 className="mr-1 size-3.5" />
                        Concluido
                      </Badge>
                    ) : (
                      <Badge>{Math.round(progress)}%</Badge>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onOpenContent?.(item.contentType)}
                      disabled={!onOpenContent}
                    >
                      Abrir
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-full"
                      onClick={() => void handleDelete(item.id)}
                      disabled={removingId === item.id}
                      aria-label="Remover do histórico"
                    >
                      {removingId === item.id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="h-2 overflow-hidden rounded-full bg-highlight/12">
                    <div
                      className="h-full rounded-full bg-highlight transition-[width] duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatSeconds(item.currentPositionSeconds)}</span>
                    <span>{formatSeconds(item.totalDurationSeconds)}</span>
                  </div>
                </div>
              </Card>
            );
          })}

          <div className="flex justify-center pt-2">
            <Button
              variant="secondary"
              onClick={() => void loadHistory(items.length, true)}
              disabled={!canLoadMore || loadingMore}
            >
              {loadingMore ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Carregando...
                </>
              ) : canLoadMore ? (
                "Carregar mais"
              ) : (
                "Fim do histórico"
              )}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <Card className="rounded-[20px] border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </Card>
      ) : null}
    </div>
  );
}
