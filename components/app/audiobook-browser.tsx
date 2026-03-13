"use client";

import type { ReactNode } from "react";
import { useDeferredValue, useMemo, useState } from "react";

import {
  BookOpenText,
  Crown,
  Lock,
  NotebookIcon,
  PersonSimpleHike,
  Search,
} from "@/components/icons";

import { BiblePromisePanel } from "@/components/app/bible-promise-panel";
import { BookDetailPanel } from "@/components/app/book-detail-panel";
import { BookGrid } from "@/components/app/book-grid";
import { useBookSelection } from "@/components/app/hooks/use-book-selection";
import { useJourneySelection } from "@/components/app/hooks/use-journey-selection";
import { JourneyDetailPanel } from "@/components/app/journey-detail-panel";
import { JourneyGrid } from "@/components/app/journey-grid";
import { WhatsAppSubscriptionPanel } from "@/components/app/whatsapp-subscription-panel";
import { Input } from "@/components/ui/input";
import type { Audiobook, AudiobookBookSummary } from "@/lib/audiobooks";
import { groupAudiobooksByBook } from "@/lib/audiobooks";
import type { CharacterJourney } from "@/lib/character-journeys";
import type { HistoryContentType } from "@/lib/history";
import { cn } from "@/lib/utils";

type LibraryView = "books" | "journeys" | "parables" | "teachings" | "promises" | "whatsapp";
type JourneyLikeView = "journeys" | "parables" | "teachings";

interface AudiobookBrowserProps {
  initialAudiobooks: Audiobook[];
  initialCharacterJourneys: CharacterJourney[];
  initialParables: CharacterJourney[];
  initialTeachings: CharacterJourney[];
  view: LibraryView;
  hasPremiumAccess: boolean;
  onUpgradeRequest: () => void;
  onViewChange: (view: LibraryView) => void;
}

interface StoryViewConfig {
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
    progressContentType: "character-journey",
    heading: "Personagens para ouvir",
    subheading: "Selecione uma jornada para ouvir uma narracao guiada por personagem biblico.",
    gridItemLabel: "jornada",
    gridEmptyTitle: "Nenhuma jornada encontrada",
    gridEmptyDescription: "Ajuste a busca para localizar jornadas disponiveis para este perfil.",
    selectedHeading: "Jornada selecionada",
    emptySelectionTitle: "Jornadas",
    emptySelectionDescription: "Escolha uma jornada para carregar o áudio.",
  },
  parables: {
    progressContentType: "parable",
    heading: "Parabolas para ouvir",
    subheading: "Selecione uma parabola para acompanhar a narrativa biblica.",
    gridItemLabel: "parabola",
    gridEmptyTitle: "Nenhuma parabola encontrada",
    gridEmptyDescription: "Ajuste a busca para localizar parabolas disponiveis no catalogo.",
    selectedHeading: "Parabola selecionada",
    emptySelectionTitle: "Parábolas",
    emptySelectionDescription: "Escolha uma parábola para carregar o áudio.",
  },
  teachings: {
    progressContentType: "teaching",
    heading: "O que a Biblia nos ensina sobre:",
    subheading: "Aprenda a lidar com as situacoes da vida seguindo os ensinamentos biblicos.",
    gridItemLabel: "ensinamento",
    gridEmptyTitle: "Nenhum ensinamento encontrado",
    gridEmptyDescription: "Ajuste a busca para localizar ensinamentos disponiveis para este perfil.",
    selectedHeading: "Ensinamento selecionado",
    emptySelectionTitle: "O que a Bíblia nos ensina sobre:",
    emptySelectionDescription: "Escolha um ensinamento para carregar o áudio.",
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
    return PersonSimpleHike;
  }

  if (view === "parables") {
    return BookOpenText;
  }

  return NotebookIcon;
}

function isPremiumView(view: LibraryView) {
  return view !== "books";
}

function FilterTab({
  active,
  locked,
  children,
  onClick,
}: {
  active: boolean;
  locked?: boolean;
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
          : locked
            ? "text-accent-foreground/60"
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
  hasPremiumAccess,
  onUpgradeRequest,
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
  const lockedView = isPremiumView(view) && !hasPremiumAccess;
  const listTitle = view === "books" ? "Lista de livros" : "Lista de conteudos";
  const listDescription = view === "books"
    ? "Selecione um livro para atualizar o player e a fila de capitulos."
    : "Selecione um item para atualizar o player principal.";

  function handleTabChange(nextView: LibraryView) {
    if (isPremiumView(nextView) && !hasPremiumAccess) {
      onUpgradeRequest();
      return;
    }

    onViewChange(nextView);
  }

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
              <FilterTab active={view === "books"} onClick={() => handleTabChange("books")}>
                Livros da Biblia
              </FilterTab>
              <FilterTab
                active={view === "journeys"}
                locked={!hasPremiumAccess}
                onClick={() => handleTabChange("journeys")}
              >
                <span className="inline-flex items-center gap-1">
                  Jornadas
                  {!hasPremiumAccess ? <Lock className="size-3.5" /> : null}
                </span>
              </FilterTab>
              <FilterTab
                active={view === "parables"}
                locked={!hasPremiumAccess}
                onClick={() => handleTabChange("parables")}
              >
                <span className="inline-flex items-center gap-1">
                  Parabolas
                  {!hasPremiumAccess ? <Lock className="size-3.5" /> : null}
                </span>
              </FilterTab>
              <FilterTab
                active={view === "teachings"}
                locked={!hasPremiumAccess}
                onClick={() => handleTabChange("teachings")}
              >
                <span className="inline-flex items-center gap-1">
                  Ensinamentos
                  {!hasPremiumAccess ? <Lock className="size-3.5" /> : null}
                </span>
              </FilterTab>
              <FilterTab
                active={view === "promises"}
                locked={!hasPremiumAccess}
                onClick={() => handleTabChange("promises")}
              >
                <span className="inline-flex items-center gap-1">
                  Promessas
                  {!hasPremiumAccess ? <Lock className="size-3.5" /> : null}
                </span>
              </FilterTab>
              <FilterTab
                active={view === "whatsapp"}
                locked={!hasPremiumAccess}
                onClick={() => handleTabChange("whatsapp")}
              >
                <span className="inline-flex items-center gap-1">
                  WhatsApp
                  {!hasPremiumAccess ? <Lock className="size-3.5" /> : null}
                </span>
              </FilterTab>
            </div>
          </div>
        </div>
      </div>

      {lockedView ? (
        <section className="rounded-2xl border border-highlight/35 bg-highlight/10 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-highlight">
                <Lock className="size-3.5" />
                Conteudo premium
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
                Este recurso esta disponivel no plano pago
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                No plano free voce acessa apenas os livros da Biblia. Assine para liberar jornadas,
                parabolas, ensinamentos, promessas, WhatsApp e historico.
              </p>
            </div>
            <button
              type="button"
              onClick={onUpgradeRequest}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <Crown className="size-4" />
              Assinar plano pago
            </button>
          </div>
        </section>
      ) : view === "promises" ? (
        <section className="space-y-4">
          <BiblePromisePanel />
        </section>
      ) : view === "whatsapp" ? (
        <section className="space-y-4">
          <WhatsAppSubscriptionPanel />
        </section>
      ) : (
        <section className="rounded-2xl border border-border/60 bg-card/75 p-3 sm:p-4 md:p-5">
          <div className="grid gap-4 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <span className="rounded-full border border-highlight/35 bg-highlight/12 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-highlight xl:hidden">
                  {resultCount} itens
                </span>
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
                  icon={ActiveStoryIcon}
                />
              )}
            </div>

            <aside className="space-y-3 sm:space-y-4 xl:pl-1">
              <div className="rounded-[22px] border border-border/60 bg-background/45 p-3.5 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {listTitle}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {listDescription}
                    </p>
                  </div>
                  <span className="hidden rounded-full border border-highlight/35 bg-highlight/12 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-highlight xl:inline-flex">
                    {resultCount}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3 xl:max-h-[calc(100vh-14rem)] xl:overflow-y-auto xl:pr-2">
                {view === "books" ? (
                  <BookGrid
                    books={filteredBooks}
                    selectedSlug={book.selectedBook?.slug ?? null}
                    onSelect={handleSelectBook}
                    layout="rail"
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
                    layout="rail"
                    icon={ActiveStoryIcon}
                  />
                )}
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
