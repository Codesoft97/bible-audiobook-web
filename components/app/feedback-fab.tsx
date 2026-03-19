"use client";

import { useEffect, useState, type FormEvent } from "react";

import {
  CheckCircle2,
  LoaderCircle,
  MessageCircle,
  X,
} from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ApiEnvelope } from "@/lib/auth/types";
import type { Feedback, FeedbackCategory } from "@/lib/feedbacks";
import { FEEDBACK_CATEGORIES } from "@/lib/feedbacks";
import { cn } from "@/lib/utils";
import { feedbackCreateSchema } from "@/lib/validation";

const DEFAULT_CATEGORY: FeedbackCategory = "comentario geral";

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "Bug",
  melhoria: "Melhoria",
  "funcionalidade nova": "Funcionalidade nova",
  "comentario geral": "Comentario geral",
};

export function FeedbackFab() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>(DEFAULT_CATEGORY);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    if (open) {
      return;
    }

    setCategory(DEFAULT_CATEGORY);
    setDescription("");
    setError("");
    setSubmitting(false);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSuccessMessage("");

    const validation = feedbackCreateSchema.safeParse({
      category,
      description,
    });

    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ?? "Revise os dados antes de enviar.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });
      const payload = (await response.json()) as ApiEnvelope<Feedback>;

      if (!response.ok || payload.status !== "success" || !payload.data) {
        setError(payload.message ?? "Nao foi possivel enviar seu feedback.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage("Feedback enviado com sucesso.");
      setOpen(false);
      setSubmitting(false);
    } catch {
      setError("Nao foi possivel conectar ao servidor.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="feedback-floating-ui fixed right-4 z-[55] flex flex-col items-end">
        {successMessage ? (
          <div className="mb-3 flex max-w-xs items-center gap-2 rounded-2xl border border-success/30 bg-card/95 px-4 py-3 text-sm text-foreground shadow-[0_20px_45px_-24px_rgba(7,18,33,0.7)]">
            <CheckCircle2 className="size-4 shrink-0 text-success" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccessMessage("");
            setOpen(true);
          }}
          className="inline-flex h-14 items-center gap-3 rounded-full border border-highlight/45 bg-highlight px-5 text-sm font-semibold text-highlight-foreground shadow-[0_22px_48px_-20px_rgba(40,28,8,0.72)] transition hover:scale-[1.02] hover:bg-highlight/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/50"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Abrir feedback"
        >
          <MessageCircle className="size-5" />
          <span className="hidden sm:inline">Feedback</span>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="surface w-full max-w-2xl rounded-[28px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                  Feedback
                </p>
                <h3 className="text-2xl font-semibold text-foreground">
                  Conte o que podemos melhorar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Seu comentario nos ajuda a evoluir o app.
                </p>
              </div>

              <button
                type="button"
                onClick={() => !submitting && setOpen(false)}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-muted-foreground transition hover:bg-background hover:text-foreground"
                aria-label="Fechar feedback"
              >
                <X className="size-4" />
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Categoria
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {FEEDBACK_CATEGORIES.map((item) => {
                    const selected = category === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/35",
                          selected
                            ? "border-highlight/55 bg-highlight/12 text-foreground"
                            : "border-border/60 bg-background/65 text-muted-foreground hover:border-highlight/30 hover:text-foreground",
                        )}
                      >
                        {CATEGORY_LABELS[item]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="feedback-description"
                  className="text-sm font-medium text-foreground"
                >
                  Descrição
                </label>
                <Textarea
                  id="feedback-description"
                  placeholder="Descreva o problema, a ideia ou o comentario que deseja compartilhar."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={submitting}
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="size-4" />
                      Enviar feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
