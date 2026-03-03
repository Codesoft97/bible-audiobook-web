"use client";

import type { ReactNode } from "react";
import { useDeferredValue, useMemo, useState } from "react";

import { BookOpenText, Search, UserRound } from "lucide-react";

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
  view: LibraryView;
  onViewChange: (view: LibraryView) => void;
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
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-accent-foreground hover:bg-background/80",
      )}
    >
      {children}
    </button>
  );
}

export function AudiobookBrowser({
  initialAudiobooks,
  initialCharacterJourneys,
  view,
  onViewChange,
}: AudiobookBrowserProps) {
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

  const resultCount = view === "books" ? filteredBooks.length : filteredJourneys.length;

  return (
    <div className="space-y-5">
      <div className="surface rounded-[24px] p-4 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-[680px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              placeholder={
                view === "books"
                  ? "Buscar por livro, tema ou capitulo"
                  : "Buscar por personagem, categoria ou perfil"
              }
              className="h-12 rounded-full border-border/70 bg-background/80 pl-11"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="inline-flex w-fit items-center rounded-full bg-accent/75 p-1">
            <FilterTab active={view === "books"} onClick={() => onViewChange("books")}>
              Livros da Biblia
            </FilterTab>
            <FilterTab active={view === "journeys"} onClick={() => onViewChange("journeys")}>
              Jornadas
            </FilterTab>
          </div>
        </div>
      </div>

      <div className="surface rounded-[24px] p-4 md:p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {view === "books" ? (
                <BookOpenText className="size-3.5 text-highlight" />
              ) : (
                <UserRound className="size-3.5 text-highlight" />
              )}
              {view === "books" ? "Catalogo principal" : "Colecao de jornadas"}
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-foreground md:text-[2.15rem]">
              {view === "books" ? "Biblioteca em destaque" : "Personagens para ouvir"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              {view === "books"
                ? "Escolha um livro para carregar os capitulos em audio e comecar a reproducao."
                : "Selecione uma jornada para ouvir uma narracao guiada por personagem biblico."}
            </p>
          </div>
          <span className="rounded-full border border-highlight/35 bg-highlight/12 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-highlight">
            {resultCount} itens
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {view === "books" ? (
            <BookGrid
              books={filteredBooks}
              selectedSlug={book.selectedBook?.slug ?? null}
              onSelect={handleSelectBook}
            />
          ) : (
            <JourneyGrid
              journeys={filteredJourneys}
              selectedId={journey.selectedJourney?.id ?? null}
              onSelect={handleSelectJourney}
            />
          )}
        </div>
      </div>

      <div className="surface rounded-[24px] p-4 md:p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-semibold text-foreground">Player</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            A reproducao abaixo segue o item selecionado na grade.
          </p>
        </div>

        {view === "books" ? (
          <BookDetailPanel
            selectedBook={book.selectedBook}
            chapters={book.sortedChapters}
            loading={book.bookLoading}
            error={book.bookError}
          />
        ) : (
          <JourneyDetailPanel
            selectedJourney={journey.selectedJourney}
            audioUrl={journey.journeyAudioUrl}
            loading={journey.journeyLoading}
            error={journey.journeyError}
          />
        )}
      </div>
    </div>
  );
}
