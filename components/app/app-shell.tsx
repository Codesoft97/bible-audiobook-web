"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AlertCircle,
  BookOpenText,
  CheckCircle2,
  Clock3,
  Crown,
  Info,
  HandsPraying,
  Lock,
  MessageCircle,
  NotebookIcon,
  PanelLeftClose,
  PanelLeftOpen,
  PersonSimpleHike,
  X,
} from "@/components/icons";
import type { LucideIcon } from "@/components/icons";

import { AudiobookBrowser } from "@/components/app/audiobook-browser";
import { HistoryPanel } from "@/components/app/history-panel";
import { LogoutButton } from "@/components/app/logout-button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AppSession } from "@/lib/auth/types";
import type { Audiobook } from "@/lib/audiobooks";
import type { CharacterJourney } from "@/lib/character-journeys";
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
  premium?: boolean;
  route?: string;
}> = [
  { key: "history", label: "Historico", icon: Clock3, premium: true },
  { key: "plans", label: "Assinatura", icon: Crown, route: APP_ROUTES.subscription },
];

const LIBRARY_ITEMS: Array<{
  key: Exclude<SidebarKey, "history" | "plans">;
  label: string;
  icon: LucideIcon;
  view: LibraryView;
  premium?: boolean;
}> = [
  { key: "books", label: "Livros da Biblia", icon: BookOpenText, view: "books" },
  { key: "journeys", label: "Jornadas", icon: PersonSimpleHike, view: "journeys", premium: true },
  { key: "parables", label: "Parabolas", icon: BookOpenText, view: "parables", premium: true },
  { key: "teachings", label: "Ensinamentos", icon: NotebookIcon, view: "teachings", premium: true },
  { key: "promises", label: "Promessas", icon: HandsPraying, view: "promises", premium: true },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, view: "whatsapp", premium: true },
];

function isPremiumLibraryView(view: LibraryView) {
  return view !== "books";
}

type RedirectStatus = "success" | "cancel" | "portal";

const APP_STATUS_FEEDBACK: Record<
  RedirectStatus,
  {
    title: string;
    description: string;
    icon: LucideIcon;
    containerClassName: string;
    iconClassName: string;
  }
> = {
  success: {
    title: "Assinatura concluida",
    description: "Pagamento confirmado. Seu acesso premium foi atualizado.",
    icon: CheckCircle2,
    containerClassName: "border-success/35 bg-success/10",
    iconClassName: "text-success",
  },
  cancel: {
    title: "Checkout cancelado",
    description: "A compra nao foi concluida. Voce pode tentar novamente quando quiser.",
    icon: AlertCircle,
    containerClassName: "border-destructive/30 bg-destructive/10",
    iconClassName: "text-destructive",
  },
  portal: {
    title: "Portal acessado",
    description: "Retorno do portal de assinatura realizado com sucesso.",
    icon: Info,
    containerClassName: "border-primary/35 bg-primary/10",
    iconClassName: "text-primary",
  },
};

function parseRedirectStatus(value: string | null): RedirectStatus | null {
  if (value === "success" || value === "cancel" || value === "portal") {
    return value;
  }

  return null;
}

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProfile = session.selectedProfile;
  const hasPremiumAccess = session.family.plan !== "free";
  const hasActiveSubscription = session.family.plan === "paid";
  const isTrial = session.family.plan === "free_trial";
  const [statusFeedback, setStatusFeedback] = useState<RedirectStatus | null>(null);
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

  useEffect(() => {
    const nextStatus = parseRedirectStatus(searchParams.get("status"));

    if (!nextStatus) {
      return;
    }

    setStatusFeedback(nextStatus);
    router.replace(APP_ROUTES.app, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    if (hasPremiumAccess) {
      return;
    }

    const hasLockedSidebar =
      activeSidebar === "history" ||
      activeSidebar === "journeys" ||
      activeSidebar === "parables" ||
      activeSidebar === "teachings" ||
      activeSidebar === "promises" ||
      activeSidebar === "whatsapp";

    if (libraryView !== "books") {
      setLibraryView("books");
    }

    if (hasLockedSidebar) {
      setActiveSidebar("books");
    }
  }, [activeSidebar, hasPremiumAccess, libraryView]);

  if (!selectedProfile) {
    return null;
  }

  const feedback = statusFeedback ? APP_STATUS_FEEDBACK[statusFeedback] : null;
  const FeedbackIcon = feedback?.icon;

  const profileInitial = selectedProfile.name.trim().charAt(0).toUpperCase() || "P";
  const showingHistory = activeSidebar === "history" && hasPremiumAccess;

  function closeSidebarOnMobile() {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setSidebarOpen(false);
    }
  }

  function openSubscription() {
    router.push(APP_ROUTES.subscription);
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
            <div className="space-y-1">
              <Logo className="max-w-[220px]" priority />
              <p className="text-xs uppercase tracking-[0.24em] text-primary-foreground/70">
                Evangelho em áudio
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
              {LIBRARY_ITEMS.map((item) => {
                const locked = Boolean(item.premium && !hasPremiumAccess);

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (locked) {
                        openSubscription();
                        closeSidebarOnMobile();
                        return;
                      }

                      setLibraryView(item.view);
                      setActiveSidebar(item.key);
                      closeSidebarOnMobile();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition",
                      locked
                        ? "bg-primary-foreground/5 text-primary-foreground/65"
                        : activeSidebar === item.key
                          ? "bg-highlight text-highlight-foreground"
                          : "bg-primary-foreground/8 text-primary-foreground hover:bg-primary-foreground/14",
                    )}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                    {locked ? (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary-foreground/16 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">
                        <Lock className="size-3" />
                        Premium
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border-t border-primary-foreground/15 pt-4" />

            {SIDEBAR_ITEMS.map((item) => {
              const locked = Boolean(item.premium && !hasPremiumAccess);

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (item.route) {
                      setActiveSidebar(item.key);
                      router.push(item.route);
                      closeSidebarOnMobile();
                      return;
                    }

                    if (locked) {
                      openSubscription();
                      closeSidebarOnMobile();
                      return;
                    }

                    setActiveSidebar(item.key);
                    closeSidebarOnMobile();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition",
                    locked
                      ? "bg-primary-foreground/5 text-primary-foreground/65"
                      : activeSidebar === item.key
                        ? "bg-highlight text-highlight-foreground"
                        : "bg-primary-foreground/8 text-primary-foreground hover:bg-primary-foreground/14",
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                  {locked ? (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary-foreground/16 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">
                      <Lock className="size-3" />
                      Premium
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <Link
            href={APP_ROUTES.subscription}
            onClick={closeSidebarOnMobile}
            className="mt-4 mb-4 block rounded-[20px] border border-highlight/35 bg-highlight/12 p-4 text-primary-foreground transition hover:bg-highlight/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/55"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-primary-foreground/75">Plano premium</p>
            <p className="mt-2 text-sm font-semibold">
              {hasActiveSubscription
                ? "Gerenciar assinatura ativa"
                : isTrial
                  ? "Assine antes do fim do teste"
                  : "Desbloqueie todos os recursos do app"}
            </p>
            <p className="mt-1 text-xs text-primary-foreground/75">
              {hasActiveSubscription
                ? "Acesse seus dados de faturamento"
                : "Assine com cartao de credito em poucos minutos"}
            </p>
          </Link>

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

          {feedback && FeedbackIcon ? (
            <div className={cn("mb-5 rounded-2xl border p-4", feedback.containerClassName)}>
              <div className="flex items-start gap-3">
                <FeedbackIcon className={cn("mt-0.5 size-5 shrink-0", feedback.iconClassName)} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{feedback.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{feedback.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusFeedback(null)}
                  className="ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/65 text-muted-foreground transition hover:bg-background hover:text-foreground"
                  aria-label="Fechar aviso de status"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ) : null}

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

                if (!hasPremiumAccess && isPremiumLibraryView(nextView)) {
                  openSubscription();
                  return;
                }

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
              hasPremiumAccess={hasPremiumAccess}
              onUpgradeRequest={openSubscription}
              onViewChange={(view) => {
                if (!hasPremiumAccess && isPremiumLibraryView(view)) {
                  openSubscription();
                  return;
                }

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
