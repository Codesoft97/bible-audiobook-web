"use client";

import { useEffect, useRef, useState } from "react";

import { AlertCircle, Info, X } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmationModalRequest {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string | null;
  tone?: "default" | "danger";
}

interface ConfirmationModalState {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string | null;
  tone: "default" | "danger";
}

function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone,
  onConfirm,
  onCancel,
}: ConfirmationModalState & {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const HeaderIcon = tone === "danger" ? AlertCircle : Info;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-background/78 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="surface w-full max-w-xl rounded-[28px] p-6 shadow-[0_28px_80px_-30px_rgba(3,12,24,0.7)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl",
                tone === "danger"
                  ? "bg-destructive/12 text-destructive"
                  : "bg-highlight/12 text-highlight",
              )}
            >
              <HeaderIcon className="size-5" />
            </div>
            <div className="space-y-2">
              <p
                className={cn(
                  "text-xs uppercase tracking-[0.18em]",
                  tone === "danger" ? "text-destructive" : "text-highlight",
                )}
              >
                Confirmação
              </p>
              <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-muted-foreground transition hover:bg-background hover:text-foreground"
            aria-label="Fechar modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {cancelLabel ? (
            <Button variant="ghost" onClick={onCancel}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmationModal() {
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const [dialog, setDialog] = useState<ConfirmationModalState | null>(null);

  useEffect(() => () => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  function closeWith(result: boolean) {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }

    setDialog(null);
  }

  function requestConfirmation(options: ConfirmationModalRequest) {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? "Confirmar",
        cancelLabel: options.cancelLabel === undefined ? "Cancelar" : options.cancelLabel,
        tone: options.tone ?? "default",
      });
    });
  }

  return {
    requestConfirmation,
    confirmationModal: (
      <ConfirmationModal
        isOpen={Boolean(dialog)}
        title={dialog?.title ?? ""}
        description={dialog?.description ?? ""}
        confirmLabel={dialog?.confirmLabel ?? "Confirmar"}
        cancelLabel={dialog?.cancelLabel ?? "Cancelar"}
        tone={dialog?.tone ?? "default"}
        onConfirm={() => closeWith(true)}
        onCancel={() => closeWith(false)}
      />
    ),
  };
}
