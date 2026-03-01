import { AudioLines, BookOpenText, LoaderCircle } from "lucide-react";

import type { Audiobook, AudiobookBookSummary } from "@/lib/audiobooks";
import { AudioPlayer } from "@/components/app/audio-player";
import type { AudioTrack } from "@/components/app/audio-player";
import { Card } from "@/components/ui/card";

function buildStreamUrl(trackId: string) {
  return `/api/audiobooks/${encodeURIComponent(trackId)}/stream`;
}

function chaptersToTracks(bookTitle: string, chapters: Audiobook[]): AudioTrack[] {
  return chapters.map((ch, i) => ({
    id: ch.id,
    title: `Capitulo ${ch.chapter}`,
    subtitle: `Faixa ${i + 1} do livro ${bookTitle}`,
    src: buildStreamUrl(ch.id),
  }));
}

interface BookDetailPanelProps {
  selectedBook: AudiobookBookSummary | null;
  chapters: Audiobook[];
  loading: boolean;
  error: string;
}

export function BookDetailPanel({ selectedBook, chapters, loading, error }: BookDetailPanelProps) {
  if (!selectedBook) {
    return (
      <Card className="rounded-[32px] p-7">
        <div className="space-y-4">
          <div className="flex size-14 items-center justify-center rounded-[24px] bg-highlight/12 text-highlight">
            <BookOpenText className="size-7" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Escolha um livro</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Selecione um item da lista para buscar no backend os audiobooks daquele livro.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[32px] p-7">
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-highlight/25 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-highlight">
            <AudioLines className="size-3.5" />
            {selectedBook.title}
          </div>
          <h3 className="text-2xl font-semibold">Audiobooks do livro</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Cada clique dispara uma nova consulta ao backend para listar os capitulos
            disponiveis deste livro.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Carregando capitulos de {selectedBook.title}...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : chapters.length > 0 ? (
          <AudioPlayer
            title={selectedBook.title}
            tracks={chaptersToTracks(selectedBook.title, chapters)}
          />
        ) : (
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            Selecione um livro para carregar seus audiobooks.
          </div>
        )}
      </div>
    </Card>
  );
}
