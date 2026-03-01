"use client";

import { useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Sparkles,
} from "lucide-react";

import type { Audiobook } from "@/lib/audiobooks";
import type { CharacterJourney } from "@/lib/character-journeys";
import { AudiobookBrowser } from "@/components/app/audiobook-browser";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/app/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AppSession } from "@/lib/auth/types";
import { FUTURE_FEATURES } from "@/lib/constants";
import { cn, formatPlanLabel, formatProfileTypeLabel } from "@/lib/utils";

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
  const [collapsed, setCollapsed] = useState(false);

  if (!selectedProfile) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div
        className={cn(
          "mx-auto grid max-w-7xl gap-6",
          collapsed
            ? "lg:grid-cols-[104px_minmax(0,1fr)]"
            : "lg:grid-cols-[320px_minmax(0,1fr)]",
        )}
      >
        <aside
          className={cn(
            "surface sticky top-6 flex h-fit flex-col gap-6 rounded-[32px] p-4 transition-all duration-300 lg:p-6",
            collapsed ? "lg:px-3" : "",
          )}
        >
          <div
            className={cn(
              "flex gap-3",
              collapsed ? "items-center justify-center" : "items-start justify-between",
            )}
          >
            <div className={cn("min-w-0", collapsed ? "hidden" : "block")}>
              <Logo className="max-w-[260px]" />
            </div>
            {collapsed ? (
              <div className="flex flex-col items-center gap-3">
                <Logo compact />
                <ThemeToggle />
              </div>
            ) : (
              <ThemeToggle />
            )}
          </div>

          <div className={cn("flex", collapsed ? "justify-center" : "justify-start")}>
            <Button
              variant="secondary"
              size="icon"
              aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
              title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
              onClick={() => setCollapsed((current) => !current)}
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </Button>
          </div>

          <Card
            className={cn(
              "rounded-[28px] border-highlight/20 bg-gradient-to-br from-accent/90 to-highlight/10",
              collapsed ? "p-3" : "p-5",
            )}
          >
            <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-highlight text-background">
                <Crown className="size-5" />
              </div>
              {collapsed ? null : (
                <div>
                  <p className="text-sm text-muted-foreground">Plano atual</p>
                  <p className="font-semibold">{formatPlanLabel(session.family.plan)}</p>
                </div>
              )}
            </div>
          </Card>

          <nav className="space-y-2">
            {FUTURE_FEATURES.map((feature, index) => (
              <div
                key={feature}
                title={feature}
                className={cn(
                  "flex rounded-2xl px-4 py-3 text-sm transition-all",
                  index === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent/75 text-accent-foreground",
                  collapsed ? "justify-center px-3" : "items-center gap-3",
                )}
              >
                <Sparkles className="size-4" />
                {collapsed ? null : <span>{feature}</span>}
                {!collapsed && index !== 0 ? (
                  <span className="ml-auto text-[10px] uppercase">Em breve</span>
                ) : null}
              </div>
            ))}
          </nav>

          <div
            className={cn(
              "mt-auto rounded-2xl border border-border/70 bg-background/60 p-4",
              collapsed ? "flex flex-col items-center gap-3 px-2" : "flex items-center justify-between gap-3",
            )}
          >
            {collapsed ? null : (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{session.family.userName}</p>
                <p className="truncate text-xs text-muted-foreground">{session.family.email}</p>
              </div>
            )}
            <LogoutButton compact={collapsed} />
          </div>
        </aside>

        <section className="space-y-6">
          <div className="surface rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-4 py-2 text-sm text-highlight">
                  <Sparkles className="size-4" />
                  Ambiente inicial pronto para os proximos recursos
                </div>
                <div>
                  <h1 className="text-4xl font-semibold">
                    Ola, {selectedProfile.name}!
                  </h1>
                  <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                    Bem-vindo ao Voz da Palavra, onde a jornada de fe com sua familia ganha vida
                    atraves de audiobooks biblicos personalizados.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="min-w-[170px] p-5">
                  <p className="text-sm text-muted-foreground">Perfil ativo</p>
                  <p className="mt-2 text-lg font-semibold">{selectedProfile.name}</p>
                  <Badge className="mt-3">{formatProfileTypeLabel(selectedProfile.type)}</Badge>
                </Card>
                <Card className="min-w-[170px] p-5">
                  <p className="text-sm text-muted-foreground">Familia</p>
                  <p className="mt-2 text-lg font-semibold">{session.family.familyName}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{session.profiles.length} perfis cadastrados</p>
                </Card>
              </div>
            </div>
          </div>
          <AudiobookBrowser
            initialAudiobooks={initialAudiobooks}
            initialCharacterJourneys={initialCharacterJourneys}
          />
        </section>
      </div>
    </main>
  );
}
