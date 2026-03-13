import Image from "next/image";
import { AudioLines, BookOpenText, LoaderCircle } from "@/components/icons";

import { AudioPlayer } from "@/components/app/audio-player";
import type { AudioTrack } from "@/components/app/audio-player";
import { Card } from "@/components/ui/card";
import type { Audiobook, AudiobookBookSummary } from "@/lib/audiobooks";

function buildStreamUrl(trackId: string) {
  return `/api/audiobooks/${encodeURIComponent(trackId)}/stream`;
}

function chaptersToTracks(bookTitle: string, chapters: Audiobook[]): AudioTrack[] {
  return chapters.map((chapter, index) => ({
    id: chapter.id,
    title: `Capitulo ${chapter.chapter}`,
    subtitle: `Faixa ${index + 1} do livro ${bookTitle}`,
    src: buildStreamUrl(chapter.id),
    progressContentType: "bible",
    progressContentId: chapter.id,
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
      <Card className="rounded-[22px] border-border/70 bg-background/70 p-4 sm:p-5 md:p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-highlight/14 text-highlight">
              <BookOpenText className="size-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground sm:text-2xl">Livros da Biblia</h3>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Escolha um item da lista para liberar os capitulos disponiveis no player.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[22px] border-border/70 bg-background/80 p-4 sm:p-5 md:p-6">
      <div className="flex flex-col gap-5 md:flex-row">
        {selectedBook.coverImageUrl ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-accent/40 md:w-[250px] md:shrink-0">
            <Image
              src={selectedBook.coverImageUrl}
              alt={selectedBook.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 250px"
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[18px] bg-accent/55 md:w-[250px] md:shrink-0">
            <BookOpenText className="size-8 text-highlight" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-highlight/25 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-highlight">
            <AudioLines className="size-3.5" />
            Livro selecionado
          </div>
          <h3 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{selectedBook.title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {loading
              ? "Consultando capitulos no backend..."
              : `${chapters.length} capitulos prontos para reproducao.`}
          </p>
        </div>
      </div>

      <div className="mt-5">
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
            Nenhum capitulo foi encontrado para esse livro no momento.
          </div>
        )}
      </div>
    </Card>
  );
}
