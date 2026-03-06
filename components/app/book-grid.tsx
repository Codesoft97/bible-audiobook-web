import { BookOpenText } from "lucide-react";

import type { AudiobookBookSummary } from "@/lib/audiobooks";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BookGridProps {
  books: AudiobookBookSummary[];
  selectedSlug: string | null;
  onSelect: (book: AudiobookBookSummary) => void;
}

export function BookGrid({ books, selectedSlug, onSelect }: BookGridProps) {
  if (books.length === 0) {
    return (
      <Card className="rounded-[20px] bg-background/70 sm:col-span-2 xl:col-span-3">
        <p className="text-base font-semibold">Nenhum livro encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajuste a busca para localizar livros com audio disponivel.
        </p>
      </Card>
    );
  }

  return (
    <>
      {books.map((book) => (
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
              <img
                src={book.coverImageUrl}
                alt={book.title}
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
              <Badge>{book.totalChapters} capitulos</Badge>
            </div>
            <div>
              <p className="text-xl font-semibold leading-tight text-foreground">{book.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ultimo capitulo: {book.latestChapter}
              </p>
            </div>
          </div>
        </button>
      ))}
    </>
  );
}
