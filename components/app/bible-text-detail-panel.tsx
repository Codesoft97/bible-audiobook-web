import {
  Bookmark,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Crown,
  HighlighterCircle,
  LoaderCircle,
  ShareNetwork,
} from "@/components/icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatBibleTextTestamentLabel,
  type BibleTextBook,
  type BibleTextChapter,
  type BibleTextLastRead,
} from "@/lib/bible-text";
import {
  PAID_PLAN_SHARE_MESSAGE,
  buildBibleVerseShareKey,
  type BibleVerseShareFeedback,
} from "@/lib/verse-share";
import { cn } from "@/lib/utils";

interface BibleTextDetailPanelProps {
  selectedBook: BibleTextBook | null;
  selectedChapter: BibleTextChapter | null;
  loading: boolean;
  error: string;
  canShareVerses: boolean;
  readingStateLoading: boolean;
  readingStateError: string;
  fontScale: number;
  fontSaving: boolean;
  canDecreaseFont: boolean;
  canIncreaseFont: boolean;
  activeVerseNumber: number | null;
  highlightedVerses: number[];
  highlightsLoading: boolean;
  highlightsError: string;
  highlightPendingVerse: number | null;
  sharePendingKey: string | null;
  shareFeedback: BibleVerseShareFeedback | null;
  lastRead: BibleTextLastRead | null;
  lastReadLabel: string;
  bookmarkSaving: boolean;
  onNavigateChapter: (chapterNumber: number) => void | Promise<void>;
  onDecreaseFont: () => void;
  onIncreaseFont: () => void;
  onSelectVerse: (verseNumber: number) => void;
  onToggleHighlight: (verseNumber: number) => void | Promise<void>;
  onShareVerse: (verseNumber: number) => void | Promise<void>;
  onSaveBookmark: () => void | Promise<void>;
  onResumeLastRead: () => void | Promise<void>;
}

function ChapterNavigation({
  chapter,
  loading,
  onNavigateChapter,
  className = "",
}: {
  chapter: BibleTextChapter;
  loading: boolean;
  onNavigateChapter: (chapterNumber: number) => void | Promise<void>;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => void onNavigateChapter(chapter.previousChapter!)}
        disabled={!chapter.previousChapter || loading}
      >
        <ChevronLeft className="size-4" />
        Anterior
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => void onNavigateChapter(chapter.nextChapter!)}
        disabled={!chapter.nextChapter || loading}
      >
        Proximo
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

export function BibleTextDetailPanel({
  selectedBook,
  selectedChapter,
  loading,
  error,
  canShareVerses,
  readingStateLoading,
  readingStateError,
  fontScale,
  fontSaving,
  canDecreaseFont,
  canIncreaseFont,
  activeVerseNumber,
  highlightedVerses,
  highlightsLoading,
  highlightsError,
  highlightPendingVerse,
  sharePendingKey,
  shareFeedback,
  lastRead,
  lastReadLabel,
  bookmarkSaving,
  onNavigateChapter,
  onDecreaseFont,
  onIncreaseFont,
  onSelectVerse,
  onToggleHighlight,
  onShareVerse,
  onSaveBookmark,
  onResumeLastRead,
}: BibleTextDetailPanelProps) {
  const activeVerseIsBookmarked =
    Boolean(lastRead && selectedBook && selectedChapter) &&
    lastRead!.abbrev === selectedBook!.abbrev &&
    lastRead!.chapter === selectedChapter!.chapter &&
    lastRead!.verse === activeVerseNumber;
  const verseStyle = {
    fontSize: `${fontScale}rem`,
    lineHeight: `${Math.max(2.1, fontScale * 2.2)}rem`,
  };

  if (!selectedBook) {
    return (
      <Card className="rounded-[22px] border-border/70 bg-background/70 p-4 sm:p-5 md:p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-highlight/14 text-highlight">
              <BookOpenText className="size-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground sm:text-2xl">Biblia em texto</h3>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Escolha um livro e depois um capitulo para iniciar a leitura.
          </p>
          {lastRead ? (
            <div className="mt-4 rounded-[20px] border border-highlight/30 bg-highlight/10 p-4">
              <p className="text-sm font-medium text-foreground">
                Seu marcador atual esta em {lastReadLabel}.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Retome exatamente do ponto salvo ou abra outro capitulo livremente.
              </p>
              <div className="mt-3">
                <Button
                  variant="secondary"
                  onClick={() => void onResumeLastRead()}
                  disabled={readingStateLoading}
                >
                  Retomar marcador
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[22px] border-border/70 bg-background/80 p-4 sm:p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-highlight/25 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-highlight">
              <BookOpenText className="size-3.5" />
              Leitura selecionada
            </div>
            <Badge className="border-border/60 bg-background/70 text-foreground">
              {formatBibleTextTestamentLabel(selectedBook.testament)}
            </Badge>
            {selectedChapter ? (
              <>
                <Badge className="border-highlight/30 bg-highlight/10 text-highlight">
                  Capitulo {selectedChapter.chapter}
                </Badge>
                <button
                  type="button"
                  onClick={() => void onSaveBookmark()}
                  disabled={!activeVerseNumber || bookmarkSaving}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-full border transition sm:size-9",
                    activeVerseIsBookmarked
                      ? "border-highlight/35 bg-highlight/15 text-highlight"
                      : "border-border/60 bg-background/70 text-muted-foreground hover:border-highlight/30 hover:text-highlight",
                    (!activeVerseNumber || bookmarkSaving) &&
                      "cursor-not-allowed opacity-60 hover:border-border/60 hover:text-muted-foreground",
                  )}
                  aria-label={
                    activeVerseIsBookmarked
                      ? "Marcador salvo neste versiculo"
                      : "Salvar marcador neste versiculo"
                  }
                  title={
                    activeVerseIsBookmarked
                      ? "Marcador salvo neste versiculo"
                      : "Salvar marcador neste versiculo"
                  }
                >
                  {bookmarkSaving ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Bookmark className="size-4" />
                  )}
                </button>
              </>
            ) : null}
            {lastRead ? (
              <Badge className="border-highlight/30 bg-highlight/10 text-highlight">
                Marcador: {lastReadLabel}
              </Badge>
            ) : null}
          </div>

          <div>
            <h3 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
              {selectedBook.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {selectedChapter
                ? `${selectedChapter.totalVerses} versiculos neste capitulo. Toque em um versiculo para abrir o destaque nele mesmo e use o icone ao lado do capitulo para salvar o marcador.`
                : "Selecione um capitulo na lista lateral para visualizar os versiculos numerados."}
            </p>
          </div>
        </div>
      </div>

      {selectedChapter ? (
        <div className="mt-4 rounded-[20px] border border-border/60 bg-background/55 p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onDecreaseFont}
                disabled={!canDecreaseFont || fontSaving}
              >
                A-
              </Button>
              <Badge className="border-border/60 bg-background/70 text-foreground">
                {Math.round(fontScale * 100)}%
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={onIncreaseFont}
                disabled={!canIncreaseFont || fontSaving}
              >
                A+
              </Button>
              {fontSaving ? (
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Salvando fonte...
                </span>
              ) : null}
            </div>

            {readingStateError ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {readingStateError}
              </div>
            ) : null}

            {highlightsError ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {highlightsError}
              </div>
            ) : null}

            {!canShareVerses ? (
              <div className="rounded-2xl border border-highlight/30 bg-highlight/10 px-4 py-3 text-sm text-muted-foreground">
                {PAID_PLAN_SHARE_MESSAGE}
              </div>
            ) : null}

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
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Carregando texto biblico...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : selectedChapter ? (
          <div className="rounded-[22px] border border-border/70 bg-background/55">
            <div className="border-b border-border/60 px-4 py-4 sm:px-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {selectedChapter.book} {selectedChapter.chapter}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Capitulo {selectedChapter.chapter} de {selectedChapter.totalChapters}
              </p>
            </div>

            <div className="space-y-3 px-4 py-5 sm:px-5">
              {selectedChapter.verses.length > 0 ? (
                <>
                  {selectedChapter.verses.map((verse) => {
                    const isActive = activeVerseNumber === verse.number;
                    const isHighlighted = highlightedVerses.includes(verse.number);
                    const isSharing =
                      sharePendingKey ===
                      buildBibleVerseShareKey({
                        abbrev: selectedChapter.abbrev,
                        chapter: selectedChapter.chapter,
                        verse: verse.number,
                      });
                    const isBookmarked =
                      Boolean(lastRead) &&
                      lastRead!.abbrev === selectedChapter.abbrev &&
                      lastRead!.chapter === selectedChapter.chapter &&
                      lastRead!.verse === verse.number;

                    return (
                      <div
                        key={`${selectedChapter.abbrev}-${selectedChapter.chapter}-${verse.number}`}
                        className={cn(
                          "rounded-[20px] border transition",
                          isActive
                            ? "border-highlight/55 bg-highlight/10 ring-1 ring-highlight/35"
                            : "border-border/60 bg-background/70 hover:border-highlight/30 hover:bg-background/95",
                          isHighlighted && "border-highlight/40 bg-[rgba(229,187,102,0.16)]",
                        )}
                      >
                        <div className="px-4 py-3">
                          {isHighlighted || isBookmarked || isActive ? (
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              {isHighlighted && !isActive ? (
                                <Badge className="border-highlight/30 bg-highlight/10 text-highlight">
                                  Destaque
                                </Badge>
                              ) : null}
                              {isBookmarked ? (
                                <Badge className="border-highlight/30 bg-highlight/10 text-highlight">
                                  Marcador
                                </Badge>
                              ) : null}
                              {isActive ? (
                                <>
                                  <Button
                                    variant={isHighlighted ? "primary" : "secondary"}
                                    size="sm"
                                    onClick={() => void onToggleHighlight(verse.number)}
                                    disabled={
                                      highlightPendingVerse === verse.number || highlightsLoading
                                    }
                                  >
                                    {highlightPendingVerse === verse.number ? (
                                      <>
                                        <LoaderCircle className="size-4 animate-spin" />
                                        Salvando...
                                      </>
                                    ) : (
                                      <>
                                        <HighlighterCircle className="size-4" />
                                        {isHighlighted ? "Remover destaque" : "Destacar"}
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => void onShareVerse(verse.number)}
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
                                </>
                              ) : null}
                            </div>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => onSelectVerse(verse.number)}
                            className="w-full text-left"
                          >
                            <p className="min-w-0 text-foreground" style={verseStyle}>
                              <span className="mr-2 align-top text-sm font-semibold text-highlight">
                                {verse.number}
                              </span>
                              <span>{verse.text}</span>
                            </p>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="border-t border-border/60 pt-4">
                    <ChapterNavigation
                      chapter={selectedChapter}
                      loading={loading}
                      onNavigateChapter={onNavigateChapter}
                      className="justify-between sm:justify-end"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum versiculo foi encontrado para este capitulo.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            Selecione um capitulo de {selectedBook.name} para carregar o texto.
          </div>
        )}
      </div>

      {readingStateLoading || highlightsLoading ? (
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircle className="size-3.5 animate-spin" />
          {readingStateLoading
            ? "Carregando preferencias de leitura..."
            : "Carregando destaques deste capitulo..."}
        </div>
      ) : null}
    </Card>
  );
}
