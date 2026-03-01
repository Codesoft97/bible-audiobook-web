"use client";

import type { ReactNode } from "react";
import { useDeferredValue, useMemo, useState } from "react";

import { Search, Sparkles } from "lucide-react";

import type { Audiobook, AudiobookBookSummary } from "@/lib/audiobooks";
import { groupAudiobooksByBook } from "@/lib/audiobooks";
import type { CharacterJourney } from "@/lib/character-journeys";
import { BookDetailPanel } from "@/components/app/book-detail-panel";
import { BookGrid } from "@/components/app/book-grid";
import { JourneyDetailPanel } from "@/components/app/journey-detail-panel";
import { JourneyGrid } from "@/components/app/journey-grid";
import { useBookSelection } from "@/components/app/hooks/use-book-selection";
import { useJourneySelection } from "@/components/app/hooks/use-journey-selection";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LibraryView = "books" | "journeys";

interface AudiobookBrowserProps {
  initialAudiobooks: Audiobook[];
  initialCharacterJourneys: CharacterJourney[];
}

function FilterTab({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-highlight/20 bg-accent/80 text-accent-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

export function AudiobookBrowser({
  initialAudiobooks,
  initialCharacterJourneys,
}: AudiobookBrowserProps) {
  const [view, setView] = useState<LibraryView>("books");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const book = useBookSelection();
  const journey = useJourneySelection();

  const bookSummaries = useMemo(
    () => groupAudiobooksByBook(initialAudiobooks),
    [initialAudiobooks],
  );

  const filteredBooks = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return bookSummaries;
    }

    return bookSummaries.filter(
      (b) =>
        b.title.toLowerCase().includes(normalizedQuery) ||
        b.slug.toLowerCase().includes(normalizedQuery),
    );
  }, [bookSummaries, deferredQuery]);

  const filteredJourneys = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return initialCharacterJourneys;
    }

    return initialCharacterJourneys.filter(
      (j) =>
        j.titulo.toLowerCase().includes(normalizedQuery) ||
        j.categoria.toLowerCase().includes(normalizedQuery) ||
        j.perfilAlvo.toLowerCase().includes(normalizedQuery),
    );
  }, [deferredQuery, initialCharacterJourneys]);

  function handleSelectBook(selected: AudiobookBookSummary) {
    journey.clearJourney();
    void book.handleSelectBook(selected);
  }

  function handleSelectJourney(selected: CharacterJourney) {
    book.clearBook();
    void journey.handleSelectJourney(selected);
  }

  return (
    <div className="space-y-6">
      <div className="surface rounded-[32px] p-6 md:p-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-4 py-2 text-sm text-highlight">
                <Sparkles className="size-4" />
                Catalogo carregado do backend
              </div>
              <div>
                <h2 className="text-3xl font-semibold">Explore livros e jornadas biblicas.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  A tela inicial lista os livros e as jornadas recebidos pelo backend. Ao abrir um
                  item, o app consulta novamente o backend para retornar o conteudo reproduzivel.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterTab active={view === "books"} onClick={() => setView("books")}>
                Livros da Biblia
              </FilterTab>
              <FilterTab active={view === "journeys"} onClick={() => setView("journeys")}>
                Jornadas de personagens
              </FilterTab>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              placeholder={
                view === "books"
                  ? "Busque por livro. Ex: Jonas, Genesis, Marcos..."
                  : "Busque por jornada. Ex: Isaque, Jesus, Moises..."
              }
              className="pl-11"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      {view === "books" ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <BookGrid
              books={filteredBooks}
              selectedSlug={book.selectedBook?.slug ?? null}
              onSelect={handleSelectBook}
            />
          </div>
          <BookDetailPanel
            selectedBook={book.selectedBook}
            chapters={book.sortedChapters}
            loading={book.bookLoading}
            error={book.bookError}
          />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <JourneyGrid
              journeys={filteredJourneys}
              selectedId={journey.selectedJourney?.id ?? null}
              onSelect={handleSelectJourney}
            />
          </div>
          <JourneyDetailPanel
            selectedJourney={journey.selectedJourney}
            audioUrl={journey.journeyAudioUrl}
            loading={journey.journeyLoading}
            error={journey.journeyError}
          />
        </div>
      )}
    </div>
  );
}
