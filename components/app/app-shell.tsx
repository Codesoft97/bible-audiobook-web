"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  BookOpenText,
  Clock3,
  Crown,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Audiobook } from "@/lib/audiobooks";
import type { CharacterJourney } from "@/lib/character-journeys";
import { AudiobookBrowser } from "@/components/app/audiobook-browser";
import { HistoryPanel } from "@/components/app/history-panel";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/app/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AppSession } from "@/lib/auth/types";
import { APP_ROUTES } from "@/lib/constants";
import { cn, formatPlanLabel } from "@/lib/utils";

type LibraryView = "books" | "journeys" | "parables" | "teachings" | "promises" | "whatsapp";
type SidebarKey =
  | "books"
  | "journeys"
  | "parables"
  | "teachings"
  | "promises"
  | "whatsapp"
  | "history"
  | "plans";

const SIDEBAR_ITEMS: Array<{
  key: Exclude<SidebarKey, "books" | "journeys" | "promises" | "whatsapp">;
  label: string;
  icon: LucideIcon;
  soon?: boolean;
}> = [
  { key: "history", label: "Histórico", icon: Clock3 },
  { key: "plans", label: "Meus planos", icon: Crown, soon: true },
];

const LIBRARY_ITEMS: Array<{
  key: Exclude<SidebarKey, "history" | "plans">;
  label: string;
  icon: LucideIcon;
  view: LibraryView;
}> = [
  { key: "books", label: "Livros da Bíblia", icon: BookOpenText, view: "books" },
  { key: "journeys", label: "Jornadas", icon: UserRound, view: "journeys" },
  { key: "parables", label: "Parábolas", icon: BookOpenText, view: "parables" },
  { key: "teachings", label: "Ensinamentos", icon: Sparkles, view: "teachings" },
  { key: "promises", label: "Promessas", icon: Sparkles, view: "promises" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, view: "whatsapp" },
];

export function AppShell({
  session,
  initialAudiobooks,
  initialCharacterJourneys,
  initialParables,
  initialTeachings,
}: {
  session: AppSession;
  initialAudiobooks: Audiobook[];
  initialCharacterJourneys: CharacterJourney[];
  initialParables: CharacterJourney[];
  initialTeachings: CharacterJourney[];
}) {
  const selectedProfile = session.selectedProfile;
  const [libraryView, setLibraryView] = useState<LibraryView>("books");
  const [activeSidebar, setActiveSidebar] = useState<SidebarKey>("books");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncSidebarState = (matches: boolean) => {
      setSidebarOpen(matches);
    };

    syncSidebarState(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      syncSidebarState(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("app-sidebar-open", sidebarOpen);

    return () => {
      document.body.classList.remove("app-sidebar-open");
    };
  }, [sidebarOpen]);

  if (!selectedProfile) {
    return null;
  }

  const profileInitial = selectedProfile.name.trim().charAt(0).toUpperCase() || "P";
  const showingHistory = activeSidebar === "history";
  const pageTitle = showingHistory
    ? "Histórico de escuta"
    : libraryView === "books"
      ? "Biblioteca"
        : libraryView === "journeys"
          ? "Jornadas"
          : libraryView === "parables"
            ? "Parábolas"
            : libraryView === "teachings"
              ? "Ensinamentos"
              : libraryView === "promises"
                ? "Promessas"
          : "Evangelho em áudio no WhatsApp";

  function closeSidebarOnMobile() {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setSidebarOpen(false);
    }
  }

  return (
    <main className="dashboard-atmosphere min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[60] w-[86vw] max-w-[292px] border-r border-primary-foreground/15 bg-gradient-to-b from-[#0c3159] via-[#082a4c] to-[#08233f] text-primary-foreground shadow-[0_28px_70px_-30px_rgba(9,24,44,0.92)] transition-transform duration-300 sm:w-[292px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-4">
              <Logo className="max-w-[220px]" priority />
              <p className="text-xs uppercase tracking-[0.24em] text-primary-foreground/70">
                Evangelho em audio
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-primary-foreground/25 bg-primary-foreground/12 text-primary-foreground transition hover:bg-primary-foreground/20"
              aria-label="Fechar menu lateral"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>

          <Link
            href={APP_ROUTES.profiles}
            className="mt-6 block rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#082a4c]"
            aria-label="Alterar perfil ativo"
          >
            <Card className="rounded-[22px] border-primary-foreground/10 bg-primary-foreground/10 p-4 text-primary-foreground transition hover:bg-primary-foreground/16">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                Perfil ativo
              </p>
              <p className="mt-2 text-xl font-semibold">{selectedProfile.name}</p>
            </Card>
          </Link>

          <nav className="mt-5 space-y-1.5">
            <div className="space-y-1.5">
              {LIBRARY_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setLibraryView(item.view);
                    setActiveSidebar(item.key);
                    closeSidebarOnMobile();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition",
                    activeSidebar === item.key
                      ? "bg-highlight text-highlight-foreground"
                      : "bg-primary-foreground/8 text-primary-foreground hover:bg-primary-foreground/14",
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-primary-foreground/15 pt-4" />

            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveSidebar(item.key);
                  closeSidebarOnMobile();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition",
                  activeSidebar === item.key
                    ? "bg-highlight text-highlight-foreground"
                    : "bg-primary-foreground/8 text-primary-foreground hover:bg-primary-foreground/14",
                )}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
                {item.soon ? (
                  <span className="ml-auto rounded-full bg-primary-foreground/16 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">
                    Em breve
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <Card className="rounded-[20px] border-primary-foreground/10 bg-primary-foreground/10 p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-highlight text-highlight-foreground">
                  <Crown className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/70">Plano atual</p>
                  <p className="font-semibold">{formatPlanLabel(session.family.plan)}</p>
                </div>
              </div>
            </Card>

            <div className="rounded-[20px] border border-primary-foreground/10 bg-primary-foreground/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{session.family.userName}</p>
                  <p className="truncate text-xs text-primary-foreground/70">{session.family.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LogoutButton compact />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          aria-label="Fechar menu lateral"
        />
      ) : null}

      {!sidebarOpen ? (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 hidden size-11 items-center justify-center rounded-2xl border border-border/60 bg-card/90 text-foreground shadow-lg transition hover:bg-card lg:inline-flex"
          aria-label="Abrir menu lateral"
        >
          <PanelLeftOpen className="size-5" />
        </button>
      ) : null}

      <div
        className={cn(
          "mx-auto w-full max-w-[1500px] px-2 py-3 transition-[padding] duration-300 sm:px-3 md:px-5 md:py-5",
          sidebarOpen ? "lg:pl-[322px]" : "lg:pl-5",
        )}
      >
        <section className="min-w-0 px-0.5 py-2 sm:px-1 md:px-2 md:py-3">
          <div className="mb-5 rounded-2xl border border-border/65 bg-card/80 px-3 py-3 sm:px-4 lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-foreground"
                aria-label="Abrir menu lateral"
              >
                <PanelLeftOpen className="size-4" />
              </button>
              <Logo className="h-10 w-[140px] sm:w-[170px]" compact={false} />
              <ThemeToggle />
            </div>
            <div className="mt-3 flex justify-end border-t border-border/55 pt-3">
              <LogoutButton compact />
            </div>
          </div>

          <header className="mb-5 border-b border-border/60 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bom dia, {selectedProfile.name}</p>
                <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{pageTitle}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary dark:bg-primary-foreground/10 dark:text-primary-foreground">
                  {formatPlanLabel(session.family.plan)}
                </Badge>
                <Badge className="bg-highlight/15 text-highlight">{session.profiles.length} perfis</Badge>
                <Link
                  href={APP_ROUTES.profiles}
                  className="flex size-11 items-center justify-center rounded-2xl border border-highlight/45 bg-highlight/18 font-semibold text-highlight transition hover:bg-highlight/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/70 focus-visible:ring-offset-2"
                  aria-label="Ir para seleção de perfis"
                >
                  {profileInitial}
                </Link>
              </div>
            </div>
          </header>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:hidden">
            <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
              <p className="text-sm text-muted-foreground">Perfil ativo</p>
              <p className="mt-1 text-lg font-semibold">{selectedProfile.name}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
              <p className="text-sm text-muted-foreground">Familia</p>
              <p className="mt-1 text-lg font-semibold">{session.family.familyName}</p>
              <p className="mt-2 text-sm text-muted-foreground">{session.profiles.length} perfis cadastrados</p>
            </div>
          </div>

          {showingHistory ? (
            <HistoryPanel
              initialAudiobooks={initialAudiobooks}
              initialCharacterJourneys={initialCharacterJourneys}
              initialParables={initialParables}
              initialTeachings={initialTeachings}
              onOpenContent={(contentType) => {
                const nextView =
                  contentType === "bible"
                    ? "books"
                    : contentType === "character-journey"
                      ? "journeys"
                      : contentType === "parable"
                        ? "parables"
                        : "teachings";
                setLibraryView(nextView);
                setActiveSidebar(nextView);
              }}
            />
          ) : (
            <AudiobookBrowser
              initialAudiobooks={initialAudiobooks}
              initialCharacterJourneys={initialCharacterJourneys}
              initialParables={initialParables}
              initialTeachings={initialTeachings}
              view={libraryView}
              onViewChange={(view) => {
                setLibraryView(view);
                setActiveSidebar(view);
              }}
            />
          )}
        </section>
      </div>
    </main>
  );
}
