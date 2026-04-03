import Image from "next/image";
import { BookOpenText } from "@/components/icons";

import { ContentAccessIndicator } from "@/components/app/content-access-indicator";
import { CompletionBadge } from "@/components/app/completion-badge";
import type { AudiobookBookSummary } from "@/lib/audiobooks";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BookCompletionSummary {
  completedCount: number;
  totalCount: number;
  allCompleted: boolean;
}

interface BookGridProps {
  books: AudiobookBookSummary[];
  selectedSlug: string | null;
  onSelect: (book: AudiobookBookSummary) => void;
  layout?: "grid" | "rail";
  getCompletionSummary?: (book: AudiobookBookSummary) => BookCompletionSummary | null;
}

function renderBookCompletionBadge(summary: BookCompletionSummary | null) {
  if (!summary || summary.totalCount === 0) {
    return null;
  }

  if (summary.allCompleted) {
    return <CompletionBadge completed />;
  }

  if (summary.completedCount > 0) {
    return (
      <Badge className="border-highlight/30 bg-highlight/10 text-highlight">
        {summary.completedCount}/{summary.totalCount} concluidos
      </Badge>
    );
  }

  return <CompletionBadge completed={false} />;
}

export function BookGrid({
  books,
  selectedSlug,
  onSelect,
  layout = "grid",
  getCompletionSummary,
}: BookGridProps) {
  const isRail = layout === "rail";

  if (books.length === 0) {
    return (
      <Card className={cn("rounded-[20px] bg-background/70", !isRail && "sm:col-span-2 xl:col-span-3")}>
        <p className="text-base font-semibold">Nenhum livro encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajuste a busca para localizar livros com audio disponivel.
        </p>
      </Card>
    );
  }

  if (isRail) {
    return (
      <div className="space-y-3">
        {books.map((book) => {
          const completionSummary = getCompletionSummary?.(book) ?? null;

          return (
          <button
            key={book.slug}
            type="button"
            onClick={() => onSelect(book)}
            className={cn(
              "group flex w-full flex-col gap-2.5 rounded-[22px] border border-border/70 bg-card/92 p-3 text-left shadow-[0_14px_32px_-28px_rgba(12,27,47,0.55)] transition hover:border-highlight/35 hover:bg-card sm:flex-row sm:items-start sm:gap-3",
              selectedSlug === book.slug && "border-highlight/55 bg-highlight/8 ring-1 ring-highlight/35",
            )}
          >
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-[18px] bg-accent/35 sm:aspect-[16/10] sm:w-[122px]">
              {book.coverImageUrl ? (
                <Image
                  src={book.coverImageUrl}
                  alt={book.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 122px"
                  className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-highlight">
                  <BookOpenText className="size-6" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="space-y-2">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold leading-5 text-foreground">
                    {book.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ultimo capitulo: {book.latestChapter}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ContentAccessIndicator isFree={book.isFree} />
                  {renderBookCompletionBadge(completionSummary)}
                  <Badge>{book.totalChapters} caps</Badge>
                </div>
              </div>

              <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:mt-3">
                {selectedSlug === book.slug ? "Selecionado" : "Abrir no player"}
              </p>
            </div>
          </button>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {books.map((book) => {
        const completionSummary = getCompletionSummary?.(book) ?? null;

        return (
          <button
            key={book.slug}
            type="button"
            onClick={() => onSelect(book)}
            className={cn(
              "group overflow-hidden rounded-[20px] border border-border/70 bg-card/95 text-left shadow-[0_16px_36px_-26px_rgba(12,27,47,0.55)] transition hover:-translate-y-0.5 hover:border-highlight/40",
              selectedSlug === book.slug
                ? "border-highlight/60 bg-highlight/8 ring-1 ring-highlight/45"
                : "",
            )}
          >
            {book.coverImageUrl ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-accent/30">
                <Image
                  src={book.coverImageUrl}
                  alt={book.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
            ) : null}
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-3">
                {!book.coverImageUrl ? (
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-highlight/12 text-highlight">
                    <BookOpenText className="size-5" />
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <ContentAccessIndicator isFree={book.isFree} />
                  {renderBookCompletionBadge(completionSummary)}
                  <Badge>{book.totalChapters} capitulos</Badge>
                </div>
              </div>
              <div>
                <p className="text-xl font-semibold leading-tight text-foreground">{book.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ultimo capitulo: {book.latestChapter}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}
