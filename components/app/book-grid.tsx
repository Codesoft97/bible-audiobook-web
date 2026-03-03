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
      <Card className="sm:col-span-2">
        <p className="text-base font-semibold">Nenhum livro encontrado.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajuste a busca para localizar um livro com audiobooks disponiveis.
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
            "surface overflow-hidden rounded-[28px] text-left transition hover:-translate-y-1 hover:border-highlight/35",
            selectedSlug === book.slug ? "border-highlight/40 bg-accent/65" : "",
          )}
        >
          {book.coverImageUrl ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-accent/40">
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="size-full object-cover"
              />
            </div>
          ) : null}
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              {!book.coverImageUrl ? (
                <div className="flex size-12 items-center justify-center rounded-2xl bg-highlight/12 text-highlight">
                  <BookOpenText className="size-6" />
                </div>
              ) : null}
              <Badge>{book.totalChapters} capitulos</Badge>
            </div>
            <div>
              <p className="text-xl font-semibold">{book.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ultimo capitulo disponivel: {book.latestChapter}
              </p>
            </div>
          </div>
        </button>
      ))}
    </>
  );
}
