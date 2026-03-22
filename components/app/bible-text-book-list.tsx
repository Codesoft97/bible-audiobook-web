import {
  BookOpenText,
  ChevronDown,
  HighlighterCircle,
  LoaderCircle,
} from "@/components/icons";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  buildBibleTextChapterCacheKey,
  type BibleTextBook,
} from "@/lib/bible-text";
import { cn } from "@/lib/utils";

interface BibleTextBookListProps {
  books: BibleTextBook[];
  expandedBookAbbrev: string | null;
  selectedBookAbbrev: string | null;
  selectedChapterNumber: number | null;
  loadingChapterKey: string;
  showingAllHighlights: boolean;
  allHighlightsLoading: boolean;
  allHighlightsCount: number;
  onToggleBook: (book: BibleTextBook) => void;
  onOpenHighlights: () => void | Promise<void>;
  onSelectChapter: (book: BibleTextBook, chapterNumber: number) => void | Promise<void>;
}

function buildChapterItems(totalChapters: number) {
  return Array.from({ length: totalChapters }, (_, index) => index + 1);
}

export function BibleTextBookList({
  books,
  expandedBookAbbrev,
  selectedBookAbbrev,
  selectedChapterNumber,
  loadingChapterKey,
  showingAllHighlights,
  allHighlightsLoading,
  allHighlightsCount,
  onToggleBook,
  onOpenHighlights,
  onSelectChapter,
}: BibleTextBookListProps) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void onOpenHighlights()}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-[22px] border px-4 py-3 text-left transition",
          showingAllHighlights
            ? "border-highlight/45 bg-highlight/8"
            : "border-border/70 bg-card/92 hover:border-highlight/35 hover:bg-card",
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Destaques</p>
            {showingAllHighlights ? (
              <Badge className="border-highlight/30 bg-highlight/10 text-highlight">
                Aberto
              </Badge>
            ) : null}
            {allHighlightsCount > 0 ? (
              <Badge className="border-border/60 bg-background/70 text-foreground">
                {allHighlightsCount}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Todos os versiculos destacados
          </p>
        </div>

        <div className="flex size-9 items-center justify-center rounded-xl bg-highlight/12 text-highlight">
          {allHighlightsLoading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <HighlighterCircle className="size-4" />
          )}
        </div>
      </button>

      {books.length === 0 ? (
        <Card className="rounded-[20px] border-border/70 bg-background/70 p-5">
          <p className="text-base font-semibold text-foreground">Nenhum livro encontrado</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajuste a busca para localizar um livro da Biblia.
          </p>
        </Card>
      ) : null}

      {books.map((book) => {
        const isExpanded = expandedBookAbbrev === book.abbrev;
        const isSelectedBook = !showingAllHighlights && selectedBookAbbrev === book.abbrev;

        return (
          <div
            key={book.abbrev}
            className={cn(
              "overflow-hidden rounded-[22px] border border-border/70 bg-card/92 shadow-[0_14px_32px_-28px_rgba(12,27,47,0.55)] transition",
              isExpanded && "border-highlight/45 bg-highlight/8",
            )}
          >
            <button
              type="button"
              onClick={() => onToggleBook(book)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-background/35"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{book.name}</p>
                  {isSelectedBook ? (
                    <Badge className="border-highlight/30 bg-highlight/10 text-highlight">
                      Selecionado
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {book.totalChapters} capitulos
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-highlight/12 text-highlight">
                  <BookOpenText className="size-4" />
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    isExpanded && "rotate-180",
                  )}
                />
              </div>
            </button>

            {isExpanded ? (
              <div className="border-t border-border/60 px-4 py-4">
                <div className="grid max-h-60 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
                  {buildChapterItems(book.totalChapters).map((chapterNumber) => {
                    const chapterKey = buildBibleTextChapterCacheKey(
                      book.abbrev,
                      chapterNumber,
                    );
                    const isSelectedChapter =
                      !showingAllHighlights &&
                      isSelectedBook &&
                      selectedChapterNumber === chapterNumber;
                    const isLoadingChapter = loadingChapterKey === chapterKey;

                    return (
                      <button
                        key={`${book.abbrev}-${chapterNumber}`}
                        type="button"
                        onClick={() => void onSelectChapter(book, chapterNumber)}
                        className={cn(
                          "inline-flex h-11 items-center justify-center rounded-2xl border text-sm font-medium transition",
                          isSelectedChapter
                            ? "border-highlight/55 bg-highlight text-highlight-foreground"
                            : "border-border/60 bg-background/75 text-foreground hover:border-highlight/35 hover:bg-highlight/10",
                        )}
                        aria-label={`Ler ${book.name} capitulo ${chapterNumber}`}
                      >
                        {isLoadingChapter ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          chapterNumber
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
