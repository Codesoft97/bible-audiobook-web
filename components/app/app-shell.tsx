"use client";

import { useState } from "react";

import {
  BookOpenText,
  Compass,
  Crown,
  Home,
  Library,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Audiobook } from "@/lib/audiobooks";
import type { CharacterJourney } from "@/lib/character-journeys";
import { AudiobookBrowser } from "@/components/app/audiobook-browser";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/app/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AppSession } from "@/lib/auth/types";
import { cn, formatPlanLabel, formatProfileTypeLabel } from "@/lib/utils";

type LibraryView = "books" | "journeys";
type SidebarKey = "books" | "journeys" | "home" | "explore" | "library" | "plans";

const SIDEBAR_ITEMS: Array<{
  key: Exclude<SidebarKey, "books" | "journeys">;
  label: string;
  icon: LucideIcon;
  soon?: boolean;
}> = [
  { key: "home", label: "Home", icon: Home },
  { key: "explore", label: "Explorar", icon: Compass },
  { key: "library", label: "Biblioteca", icon: Library },
  { key: "plans", label: "Meus planos", icon: Crown, soon: true },
];

const LIBRARY_ITEMS: Array<{
  key: Extract<SidebarKey, "books" | "journeys">;
  label: string;
  icon: LucideIcon;
  view: LibraryView;
}> = [
  { key: "books", label: "Livros da Biblia", icon: BookOpenText, view: "books" },
  { key: "journeys", label: "Jornadas", icon: UserRound, view: "journeys" },
];

export function AppShell({
  session,
  initialAudiobooks,
  initialCharacterJourneys,
}: {
  session: AppSession;
  initialAudiobooks: Audiobook[];
  initialCharacterJourneys: CharacterJourney[];
}) {
  const selectedProfile = session.selectedProfile;
  const [libraryView, setLibraryView] = useState<LibraryView>("books");
  const [activeSidebar, setActiveSidebar] = useState<SidebarKey>("books");

  if (!selectedProfile) {
    return null;
  }

  const profileInitial = selectedProfile.name.trim().charAt(0).toUpperCase() || "P";

  return (
    <main className="dashboard-atmosphere min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto flex w-full max-w-[1500px] gap-4 lg:gap-5">
        <aside className="sticky top-5 hidden h-[calc(100vh-40px)] w-[282px] shrink-0 flex-col rounded-[30px] border border-primary-foreground/15 bg-gradient-to-b from-[#0c3159] via-[#082a4c] to-[#08233f] p-5 text-primary-foreground shadow-[0_24px_64px_-30px_rgba(9,24,44,0.9)] lg:flex">
          <div className="space-y-4">
            <Logo className="max-w-[220px]" priority />
            <p className="text-xs uppercase tracking-[0.24em] text-primary-foreground/70">
              Voz da palavra
            </p>
          </div>

          <Card className="mt-6 rounded-[22px] border-primary-foreground/10 bg-primary-foreground/10 p-4 text-primary-foreground">
            <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
              Perfil ativo
            </p>
            <p className="mt-2 text-xl font-semibold">{selectedProfile.name}</p>
            <p className="mt-1 text-sm text-primary-foreground/80">
              {formatProfileTypeLabel(selectedProfile.type)}
            </p>
          </Card>

          <nav className="mt-5 space-y-1.5">
            <div className="space-y-1.5">
              {LIBRARY_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setLibraryView(item.view);
                    setActiveSidebar(item.key);
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
                onClick={() => setActiveSidebar(item.key)}
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
                  <p className="truncate text-xs text-primary-foreground/70">
                    {session.family.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LogoutButton compact />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 rounded-[30px] border border-border/70 bg-card/85 p-3 shadow-glow md:p-5">
          <div className="surface mb-4 flex items-center justify-between rounded-[22px] px-4 py-3 lg:hidden">
            <Logo className="h-10 w-[170px]" compact={false} />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton compact />
            </div>
          </div>

          <header className="surface mb-4 rounded-[24px] px-4 py-4 md:mb-5 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bom dia, {selectedProfile.name}</p>
                
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary dark:bg-primary-foreground/10 dark:text-primary-foreground">
                  {formatPlanLabel(session.family.plan)}
                </Badge>
                <Badge className="bg-highlight/15 text-highlight">
                  {session.profiles.length} perfis
                </Badge>
                <div className="flex size-11 items-center justify-center rounded-2xl border border-highlight/45 bg-highlight/18 font-semibold text-highlight">
                  {profileInitial}
                </div>
              </div>
            </div>
          </header>

          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:hidden">
            <Card className="rounded-[20px] bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">Perfil ativo</p>
              <p className="mt-1 text-lg font-semibold">{selectedProfile.name}</p>
              <Badge className="mt-2">{formatProfileTypeLabel(selectedProfile.type)}</Badge>
            </Card>
            <Card className="rounded-[20px] bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">Familia</p>
              <p className="mt-1 text-lg font-semibold">{session.family.familyName}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {session.profiles.length} perfis cadastrados
              </p>
            </Card>
          </div>

          <AudiobookBrowser
            initialAudiobooks={initialAudiobooks}
            initialCharacterJourneys={initialCharacterJourneys}
            view={libraryView}
            onViewChange={(view) => {
              setLibraryView(view);
              setActiveSidebar(view);
            }}
          />
        </section>
      </div>
    </main>
  );
}
