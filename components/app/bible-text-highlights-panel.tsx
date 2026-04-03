"use client";

import { useState } from "react";

import {
  BookOpenText,
  Crown,
  HighlighterCircle,
  LoaderCircle,
  ShareNetwork,
} from "@/components/icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { BibleTextHighlight } from "@/lib/bible-text";
import {
  PAID_PLAN_SHARE_MESSAGE,
  buildBibleVerseShareKey,
  type BibleVerseShareFeedback,
} from "@/lib/verse-share";
import { cn } from "@/lib/utils";

interface BibleTextHighlightsPanelProps {
  highlights: BibleTextHighlight[];
  loading: boolean;
  error: string;
  canShareVerses: boolean;
  sharePendingKey: string | null;
  shareFeedback: BibleVerseShareFeedback | null;
  onOpenHighlight: (highlight: BibleTextHighlight) => void | Promise<void>;
  onShareHighlight: (highlight: BibleTextHighlight) => void | Promise<void>;
}

export function BibleTextHighlightsPanel({
  highlights,
  loading,
  error,
  canShareVerses,
  sharePendingKey,
  shareFeedback,
  onOpenHighlight,
  onShareHighlight,
}: BibleTextHighlightsPanelProps) {
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);

  return (
    <Card className="rounded-[22px] border-border/70 bg-background/80 p-4 sm:p-5 md:p-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-highlight/14 text-highlight">
              <HighlighterCircle className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-highlight">
                Seus destaques
              </p>
              <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                Versiculos destacados
              </h3>
            </div>
          </div>

          {!loading && !error ? (
            <Badge className="border-highlight/30 bg-highlight/10 text-highlight">
              {highlights.length} destaque{highlights.length === 1 ? "" : "s"}
            </Badge>
          ) : null}
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          Abra todos os destaques do perfil e toque em um item para exibir as acoes
          de compartilhar ou voltar direto ao versiculo no leitor.
        </p>
        {!canShareVerses ? (
          <div className="rounded-2xl border border-highlight/30 bg-highlight/10 px-4 py-3 text-sm text-muted-foreground">
            {PAID_PLAN_SHARE_MESSAGE}
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Carregando destaques salvos...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : highlights.length === 0 ? (
          <div className="rounded-[22px] border border-border/70 bg-background/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-highlight/14 text-highlight">
                <BookOpenText className="size-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  Nenhum destaque salvo ainda
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Destaque versiculos durante a leitura para revisitar depois nesta lista.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {shareFeedback ? (
              <div
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm",
                  shareFeedback.tone === "error"
                    ? "border-destructive/20 bg-destructive/10 text-destructive"
                    : "border-success/25 bg-success/10 text-foreground",
                )}
              >
                {shareFeedback.message}
              </div>
            ) : null}

            {highlights.map((highlight) => {
              const isSelected = selectedHighlightId === highlight.id;
              const shareKey = buildBibleVerseShareKey({
                abbrev: highlight.abbrev,
                chapter: highlight.chapter,
                verse: highlight.verse,
              });
              const isSharing = sharePendingKey === shareKey;

              return (
                <div
                  key={highlight.id}
                  className={cn(
                    "w-full rounded-[22px] border border-border/70 bg-background/70 px-4 py-4 text-left transition",
                    "hover:border-highlight/40 hover:bg-background/95",
                    isSelected && "border-highlight/45 bg-highlight/8 ring-1 ring-highlight/30",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedHighlightId(highlight.id)}
                    className="w-full text-left"
                    aria-pressed={isSelected}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-highlight/30 bg-highlight/10 text-highlight">
                        {highlight.book} {highlight.chapter}:{highlight.verse}
                      </Badge>
                      <Badge className="border-border/60 bg-background/70 text-foreground">
                        {highlight.testament === "old" ? "Antigo Testamento" : "Novo Testamento"}
                      </Badge>
                      {isSelected ? (
                        <Badge className="border-highlight/30 bg-highlight/10 text-highlight">
                          Selecionado
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm leading-7 text-foreground sm:text-base">
                      <span className="mr-2 font-semibold text-highlight">{highlight.verse}</span>
                      {highlight.text}
                    </p>
                  </button>

                  {isSelected ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void onShareHighlight(highlight)}
                        disabled={isSharing}
                      >
                        {isSharing ? (
                          <>
                            <LoaderCircle className="size-4 animate-spin" />
                            Compartilhando...
                          </>
                        ) : (
                          <>
                            {canShareVerses ? (
                              <ShareNetwork className="size-4" />
                            ) : (
                              <Crown className="size-4" />
                            )}
                            Compartilhar
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void onOpenHighlight(highlight)}
                      >
                        Abrir no leitor
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
