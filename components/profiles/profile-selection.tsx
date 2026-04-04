"use client";

import { useMemo, useState, useTransition } from "react";

import { CheckCircle2, Lock, Plus } from "@/components/icons";
import { useRouter } from "next/navigation";

import { LogoutButton } from "@/components/app/logout-button";
import { CreateProfileModal } from "@/components/profiles/create-profile-modal";
import { Badge } from "@/components/ui/badge";
import type { AppSession, Profile, ProfileType } from "@/lib/auth/types";
import { APP_ROUTES, PROFILE_LIMITS } from "@/lib/constants";
import { cn, formatPlanLabel } from "@/lib/utils";

interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

const AVATAR_GRADIENTS = [
  "from-[#3ec8ff] to-[#2270d9]",
  "from-[#ff5c9f] to-[#d13670]",
  "from-[#9d68ff] to-[#6844d6]",
  "from-[#ffb74d] to-[#d47d16]",
  "from-[#4cd7ad] to-[#218d76]",
] as const;

function getInitials(name: string) {
  const chunks = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (chunks.length === 0) return "P";
  if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase();
  return `${chunks[0][0]}${chunks[chunks.length - 1][0]}`.toUpperCase();
}

export function ProfileSelection({ session }: { session: AppSession }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    Array.isArray(session.profiles) ? session.profiles : [],
  );
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [selectingProfileId, setSelectingProfileId] = useState<string | null>(null);

  const counts = useMemo(() => {
    return profiles.reduce(
      (accumulator, profile) => {
        accumulator[profile.type] += 1;
        return accumulator;
      },
      { adult: 0, child: 0 },
    );
  }, [profiles]);

  const canCreateMore = counts.adult < PROFILE_LIMITS.adult;

  async function handleSelect(profileId: string) {
    setError("");
    setSelectingProfileId(profileId);

    try {
      const response = await fetch("/api/profiles/select", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId }),
      });
      const data = (await response.json()) as ApiResponse<{ profile: Profile }>;

      if (!response.ok || data.status !== "success") {
        if (response.status === 403) {
          setSelectingProfileId(null);
          router.push(APP_ROUTES.profilesLegalAcceptance);
          router.refresh();
          return;
        }

        setError(data.message ?? "Nao foi possivel selecionar o perfil.");
        setSelectingProfileId(null);
        return;
      }
    } catch {
      setError("Nao foi possivel conectar ao servidor.");
      setSelectingProfileId(null);
      return;
    }

    startTransition(() => {
      router.push(APP_ROUTES.app);
      router.refresh();
    });
  }

  async function handleCreate(payload: { name: string; type: ProfileType }) {
    setError("");

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ApiResponse<Profile>;

      if (!response.ok || data.status !== "success" || !data.data) {
        throw new Error(data.message ?? "Nao foi possivel criar o perfil.");
      }

      setProfiles((current) => [...current, data.data as Profile]);
    } catch (createError) {
      throw new Error(
        createError instanceof Error ? createError.message : "Nao foi possivel conectar ao servidor.",
      );
    }
  }

  return (
    <>
      <CreateProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />

      <main className="dashboard-atmosphere min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-7 md:py-8">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          <section className="relative overflow-hidden rounded-[28px] border border-primary-foreground/20 bg-gradient-to-br from-[#081f3a] via-[#0c2f57] to-[#091d33] p-4 text-primary-foreground shadow-[0_30px_70px_-28px_rgba(8,22,44,0.88)] sm:p-5 md:rounded-[34px] md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(102,168,255,0.26),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(255,210,131,0.17),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(15,42,73,0.45),transparent_35%)]" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs text-primary-foreground">
                  <Lock className="mr-1 size-3.5" />
                  Sessao protegida
                </Badge>
              </div>

              <div className="mt-3 max-w-2xl md:mt-4 md:max-w-3xl">
                <h1 className="text-[2.25rem] font-semibold leading-[0.95] text-primary-foreground sm:text-[2.65rem] md:text-5xl md:leading-tight">
                  Quem esta ouvindo agora?
                </h1>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/80 sm:text-[15px] md:mt-3 md:text-base md:leading-7">
                  Escolha um perfil para entrar na plataforma.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-[minmax(0,1.15fr)_minmax(0,1.05fr)_auto] gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3">
                <div className="min-w-0 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-3 backdrop-blur-sm md:p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-primary-foreground/65 md:text-xs">
                    Familia
                  </p>
                  <p className="mt-1 whitespace-normal break-words text-[13px] font-semibold leading-4 sm:text-[15px] sm:leading-5 md:mt-2 md:text-lg">
                    {session.family.familyName}
                  </p>
                </div>

                <div className="min-w-0 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-3 backdrop-blur-sm md:p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-primary-foreground/65 md:text-xs">
                    Plano
                  </p>
                  <p className="mt-1 whitespace-normal break-words text-[13px] font-semibold leading-4 sm:text-[15px] sm:leading-5 md:mt-2 md:text-lg">
                    {formatPlanLabel(session.family.plan)}
                  </p>
                </div>

                <div className="min-w-0 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-3 backdrop-blur-sm md:p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-primary-foreground/65 md:text-xs">
                    Perfis
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-5 sm:text-[15px] md:mt-2 md:text-lg">
                    {counts.adult}/{PROFILE_LIMITS.adult}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {profiles.map((profile, index) => {
              const isSelecting = selectingProfileId === profile.id;

              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => void handleSelect(profile.id)}
                  disabled={pending}
                  className="group relative overflow-hidden rounded-[24px] border border-border/70 bg-gradient-to-br from-card via-card to-accent/60 p-4 text-left shadow-[0_22px_56px_-30px_rgba(7,18,33,0.7)] transition hover:-translate-y-1 hover:border-highlight/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/40 disabled:cursor-not-allowed disabled:opacity-70 sm:p-5 md:rounded-[28px] md:p-6"
                >
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[28px] bg-highlight/8 transition group-hover:bg-highlight/12 md:h-24 md:w-24 md:rounded-bl-[34px]" />

                  <div className="relative z-10 flex items-start justify-between">
                    <div
                      className={cn(
                        "flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-semibold text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)] sm:size-16 sm:text-lg",
                        AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
                      )}
                    >
                      {getInitials(profile.name)}
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 sm:mt-5">
                    <p className="text-xl font-semibold text-foreground sm:text-2xl">
                      {profile.name}
                    </p>
                  </div>

                  <div className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1.5 text-sm font-medium text-highlight sm:mt-6 sm:px-4 sm:py-2">
                    <CheckCircle2 className="size-4" />
                    {isSelecting ? "Entrando..." : "Entrar com este perfil"}
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              disabled={!canCreateMore}
              onClick={() => setModalOpen(true)}
              className="group relative overflow-hidden rounded-[24px] border border-dashed border-highlight/35 bg-gradient-to-br from-background to-accent/35 p-4 text-left transition hover:border-highlight/60 hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/40 disabled:cursor-not-allowed disabled:opacity-55 sm:p-5 md:rounded-[28px] md:p-6"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl border border-highlight/40 bg-highlight/10 text-highlight sm:size-16">
                <Plus className="size-7 sm:size-8" />
              </div>
              <p className="mt-4 text-xl font-semibold text-foreground sm:mt-5 sm:text-2xl">
                Adicionar perfil
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground sm:mt-2 sm:leading-6">
                Crie outro acesso para sua família ou um amigo.
              </p>
              <div className="mt-4 inline-flex rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1.5 text-sm font-medium text-highlight sm:mt-6 sm:px-4 sm:py-2">
                {canCreateMore ? "Criar novo perfil" : "Limite maximo atingido"}
              </div>
            </button>
          </section>

          <div className="flex justify-center">
            <LogoutButton
              variant="secondary"
              className="w-full max-w-sm border-border/60 bg-card/70 text-foreground hover:bg-accent/80"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
