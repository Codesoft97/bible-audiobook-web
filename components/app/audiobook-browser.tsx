"use client";

import type { ReactNode } from "react";
import { useDeferredValue, useMemo, useState } from "react";

import { BookOpenText, MessageCircle, Search, Sparkles, UserRound } from "lucide-react";

import type { Audiobook, AudiobookBookSummary } from "@/lib/audiobooks";
import { groupAudiobooksByBook } from "@/lib/audiobooks";
import type { CharacterJourney } from "@/lib/character-journeys";
import type { HistoryContentType } from "@/lib/history";
import { BiblePromisePanel } from "@/components/app/bible-promise-panel";
import { BookDetailPanel } from "@/components/app/book-detail-panel";
import { BookGrid } from "@/components/app/book-grid";
import { JourneyDetailPanel } from "@/components/app/journey-detail-panel";
import { JourneyGrid } from "@/components/app/journey-grid";
import { WhatsAppSubscriptionPanel } from "@/components/app/whatsapp-subscription-panel";
import { useBookSelection } from "@/components/app/hooks/use-book-selection";
import { useJourneySelection } from "@/components/app/hooks/use-journey-selection";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LibraryView = "books" | "journeys" | "parables" | "teachings" | "promises" | "whatsapp";
type JourneyLikeView = "journeys" | "parables" | "teachings";

interface AudiobookBrowserProps {
  initialAudiobooks: Audiobook[];
  initialCharacterJourneys: CharacterJourney[];
  initialParables: CharacterJourney[];
  initialTeachings: CharacterJourney[];
  view: LibraryView;
  onViewChange: (view: LibraryView) => void;
}

interface StoryViewConfig {
  icon: "journey" | "parable" | "teaching";
  heading: string;
  subheading: string;
  progressContentType: HistoryContentType;
  gridItemLabel: string;
  gridEmptyTitle: string;
  gridEmptyDescription: string;
  selectedHeading: string;
  emptySelectionTitle: string;
  emptySelectionDescription: string;
}

const JOURNEY_VIEW_CONFIG: Record<JourneyLikeView, StoryViewConfig> = {
  journeys: {
    icon: "journey",
    progressContentType: "character-journey",
    heading: "Personagens para ouvir",
    subheading: "Selecione uma jornada para ouvir uma narracao guiada por personagem biblico.",
    gridItemLabel: "jornada",
    gridEmptyTitle: "Nenhuma jornada encontrada",
    gridEmptyDescription: "Ajuste a busca para localizar jornadas disponiveis para este perfil.",
    selectedHeading: "Jornada selecionada",
    emptySelectionTitle: "Selecione uma jornada",
    emptySelectionDescription: "Escolha um personagem para carregar o audio da jornada.",
  },
  parables: {
    icon: "parable",
    progressContentType: "parable",
    heading: "Parabolas para ouvir",
    subheading: "Selecione uma parabola para acompanhar a narrativa biblica.",
    gridItemLabel: "parábola",
    gridEmptyTitle: "Nenhuma parabola encontrada",
    gridEmptyDescription: "Ajuste a busca para localizar parabolas disponiveis no catalogo.",
    selectedHeading: "Parabola selecionada",
    emptySelectionTitle: "Selecione uma parabola",
    emptySelectionDescription: "Escolha uma parabola para carregar o audio.",
  },
  teachings: {
    icon: "teaching",
    progressContentType: "teaching",
    heading: "Ensinamentos para ouvir",
    subheading: "Selecione um ensinamento para seguir um estudo biblico.",
    gridItemLabel: "ensinamento",
    gridEmptyTitle: "Nenhum ensinamento encontrado",
    gridEmptyDescription: "Ajuste a busca para localizar ensinamentos disponiveis para este perfil.",
    selectedHeading: "Ensinamento selecionado",
    emptySelectionTitle: "Selecione um ensinamento",
    emptySelectionDescription: "Escolha um ensinamento para carregar o audio.",
  },
};

function filterJourneyLikeItems(items: CharacterJourney[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter(
    (item) =>
      item.titulo.toLowerCase().includes(normalizedQuery) ||
      item.categoria.toLowerCase().includes(normalizedQuery) ||
      item.perfilAlvo.toLowerCase().includes(normalizedQuery),
  );
}

function selectedIcon(view: JourneyLikeView) {
  if (view === "journeys") {
    return UserRound;
  }

  if (view === "parables") {
    return BookOpenText;
  }

  return Sparkles;
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
        "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
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
  initialParables,
  initialTeachings,
  view,
  onViewChange,
}: AudiobookBrowserProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const book = useBookSelection(initialAudiobooks);
  const journey = useJourneySelection();
  const parable = useJourneySelection({
    audioBasePath: "parables",
    progressContentType: "parable",
  });
  const teaching = useJourneySelection({
    audioBasePath: "teachings",
    progressContentType: "teaching",
  });

  const bookSummaries = useMemo(() => groupAudiobooksByBook(initialAudiobooks), [initialAudiobooks]);

  const filteredBooks = useMemo(
    () =>
      bookSummaries.filter(
        (bookSummary) =>
          bookSummary.title.toLowerCase().includes(deferredQuery.trim().toLowerCase()) ||
          bookSummary.slug.toLowerCase().includes(deferredQuery.trim().toLowerCase()),
      ),
    [bookSummaries, deferredQuery],
  );

  const filteredJourneys = useMemo(
    () => filterJourneyLikeItems(initialCharacterJourneys, deferredQuery),
    [deferredQuery, initialCharacterJourneys],
  );

  const filteredParables = useMemo(
    () => filterJourneyLikeItems(initialParables, deferredQuery),
    [deferredQuery, initialParables],
  );

  const filteredTeachings = useMemo(
    () => filterJourneyLikeItems(initialTeachings, deferredQuery),
    [deferredQuery, initialTeachings],
  );

  function clearJourneySelections() {
    journey.clearJourney();
    parable.clearJourney();
    teaching.clearJourney();
  }

  function handleSelectBook(selected: AudiobookBookSummary) {
    clearJourneySelections();
    book.clearBook();
    void book.handleSelectBook(selected);
  }

  function handleSelectJourneyLike(selected: CharacterJourney, kind: JourneyLikeView) {
    book.clearBook();
    journey.clearJourney();
    parable.clearJourney();
    teaching.clearJourney();

    if (kind === "journeys") {
      void journey.handleSelectJourney(selected);
      return;
    }

    if (kind === "parables") {
      void parable.handleSelectJourney(selected);
      return;
    }

    void teaching.handleSelectJourney(selected);
  }

  const resultCount =
    view === "books"
      ? filteredBooks.length
      : view === "journeys"
        ? filteredJourneys.length
        : view === "parables"
          ? filteredParables.length
          : view === "teachings"
            ? filteredTeachings.length
            : 0;

  const isJourneyLike = view === "journeys" || view === "parables" || view === "teachings";
  const activeStoryConfig = isJourneyLike ? JOURNEY_VIEW_CONFIG[view as JourneyLikeView] : null;
  const activeJourneySelection = view === "journeys"
    ? journey
    : view === "parables"
      ? parable
      : teaching;
  const activeJourneyItems = view === "journeys"
    ? filteredJourneys
    : view === "parables"
      ? filteredParables
      : filteredTeachings;
  const ActiveStoryIcon = view === "books" ? BookOpenText : selectedIcon(view as JourneyLikeView);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/75 px-4 py-4 md:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {view === "promises" || view === "whatsapp" ? (
            <div className="w-full rounded-2xl border border-highlight/30 bg-highlight/8 px-4 py-3 text-sm text-muted-foreground xl:max-w-[680px]">
              {view === "promises"
                ? "Receba uma promessa biblica em audio com um clique."
                : "Gerencie assinaturas para receber livros da Biblia e promessas no WhatsApp todos os dias."}
            </div>
          ) : (
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
          )}

          <div className="-mx-1 overflow-x-auto px-1">
            <div className="inline-flex min-w-max items-center rounded-full bg-accent/75 p-1">
              <FilterTab active={view === "books"} onClick={() => onViewChange("books")}>
                Livros da Biblia
              </FilterTab>
              <FilterTab active={view === "journeys"} onClick={() => onViewChange("journeys")}>
                Jornadas
              </FilterTab>
              <FilterTab active={view === "parables"} onClick={() => onViewChange("parables")}>
                Parabolas
              </FilterTab>
              <FilterTab active={view === "teachings"} onClick={() => onViewChange("teachings")}>
                Ensinamentos
              </FilterTab>
              <FilterTab active={view === "promises"} onClick={() => onViewChange("promises")}>
                Promessas
              </FilterTab>
              <FilterTab active={view === "whatsapp"} onClick={() => onViewChange("whatsapp")}>
                WhatsApp
              </FilterTab>
            </div>
          </div>
        </div>
      </div>

      {view === "promises" ? (
        <section className="space-y-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="size-3.5 text-highlight" />
              Promessa do dia
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-foreground md:text-[2.15rem]">
              Caixinha de promessas
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Receba uma promessa de Deus e ouca no player.
            </p>
          </div>
          <BiblePromisePanel />
        </section>
      ) : view === "whatsapp" ? (
        <section className="space-y-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <MessageCircle className="size-3.5 text-highlight" />
              Entregas no WhatsApp
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-foreground md:text-[2.15rem]">
              Assinaturas por WhatsApp
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Receba capitulos diarios de um livro da Biblia ou promessas biblicas no seu WhatsApp.
            </p>
          </div>
          <WhatsAppSubscriptionPanel />
        </section>
      ) : (
        <section className="rounded-2xl border border-border/60 bg-card/75 p-4 md:p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {view === "books" ? (
                  <BookOpenText className="size-3.5 text-highlight" />
                ) : (
                  <ActiveStoryIcon className="size-3.5 text-highlight" />
                )}
                {view === "books" ? "Catalogo principal" : activeStoryConfig?.heading}
              </p>
              <h2 className="mt-1 text-3xl font-semibold text-foreground md:text-[2.15rem]">
                {view === "books" ? "Biblioteca em destaque" : activeStoryConfig?.heading}
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {view === "books"
                  ? "Escolha um livro para carregar os capitulos em áudio e comecar a reprodução."
                  : activeStoryConfig?.subheading}
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
                journeys={activeJourneyItems}
                selectedId={activeJourneySelection.selectedJourney?.id ?? null}
                onSelect={(selected) => {
                  handleSelectJourneyLike(selected, view as JourneyLikeView);
                }}
                itemLabel={activeStoryConfig?.gridItemLabel}
                emptyTitle={activeStoryConfig?.gridEmptyTitle}
                emptyDescription={activeStoryConfig?.gridEmptyDescription}
              />
            )}
          </div>

          <div className="mt-6 border-t border-border/60 pt-5">
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
                selectedJourney={activeJourneySelection.selectedJourney}
                audioUrl={activeJourneySelection.journeyAudioUrl}
                loading={activeJourneySelection.journeyLoading}
                error={activeJourneySelection.journeyError}
                selectedHeading={activeStoryConfig?.selectedHeading}
                emptySelectionTitle={activeStoryConfig?.emptySelectionTitle}
                emptySelectionDescription={activeStoryConfig?.emptySelectionDescription}
                progressContentType={activeStoryConfig?.progressContentType}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
