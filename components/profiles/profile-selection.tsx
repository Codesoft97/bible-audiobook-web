"use client";

import { useMemo, useState, useTransition } from "react";

import { CheckCircle2, Lock, Plus } from "@/components/icons";
import { useRouter } from "next/navigation";

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
  const [profiles, setProfiles] = useState(session.profiles);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId }),
      });
      const data = (await response.json()) as ApiResponse<{ profile: Profile }>;

      if (!response.ok || data.status !== "success") {
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

      <main className="dashboard-atmosphere min-h-screen px-4 py-6 md:px-7 md:py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="relative overflow-hidden rounded-[34px] border border-primary-foreground/20 bg-gradient-to-br from-[#081f3a] via-[#0c2f57] to-[#091d33] p-6 text-primary-foreground shadow-[0_30px_70px_-28px_rgba(8,22,44,0.88)] md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(102,168,255,0.26),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(255,210,131,0.17),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(15,42,73,0.45),transparent_35%)]" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground">
                  <Lock className="mr-1 size-3.5" />
                  Sessao protegida
                </Badge>
              </div>

              <div className="mt-4 max-w-3xl">
                <h1 className="text-4xl font-semibold leading-tight text-primary-foreground md:text-5xl">
                  Quem esta ouvindo agora?
                </h1>
                <p className="mt-3 text-base leading-7 text-primary-foreground/80">
                  Escolha um perfil para entrar direto na plataforma. O perfil selecionado passa a
                  acompanhar o histórico da sessao automaticamente.
                </p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                    Familia
                  </p>
                  <p className="mt-2 truncate text-lg font-semibold">{session.family.familyName}</p>
                </div>

                <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                    Plano
                  </p>
                  <p className="mt-2 text-lg font-semibold">{formatPlanLabel(session.family.plan)}</p>
                </div>

                <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                    Perfis
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {counts.adult}/{PROFILE_LIMITS.adult}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile, index) => {
              const isSelecting = selectingProfileId === profile.id;

              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => void handleSelect(profile.id)}
                  disabled={pending}
                  className="group relative overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-accent/60 p-6 text-left shadow-[0_22px_56px_-30px_rgba(7,18,33,0.7)] transition hover:-translate-y-1 hover:border-highlight/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[34px] bg-highlight/8 transition group-hover:bg-highlight/12" />

                  <div className="relative z-10 flex items-start justify-between">
                    <div
                      className={cn(
                        "flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-semibold text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)]",
                        AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
                      )}
                    >
                      {getInitials(profile.name)}
                    </div>
                  </div>

                  <div className="relative z-10 mt-5">
                    <p className="text-2xl font-semibold text-foreground">{profile.name}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Perfil com progresso, histórico e preferencias sincronizados.
                    </p>
                  </div>

                  <div className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-4 py-2 text-sm font-medium text-highlight">
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
              className="group relative overflow-hidden rounded-[28px] border border-dashed border-highlight/35 bg-gradient-to-br from-background to-accent/35 p-6 text-left transition hover:border-highlight/60 hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/40 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <div className="flex size-16 items-center justify-center rounded-2xl border border-highlight/40 bg-highlight/10 text-highlight">
                <Plus className="size-8" />
              </div>
              <p className="mt-5 text-2xl font-semibold text-foreground">Adicionar perfil</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Crie outro acesso para sua familia mantendo tudo na mesma conta.
              </p>
              <div className="mt-6 inline-flex rounded-full border border-highlight/30 bg-highlight/10 px-4 py-2 text-sm font-medium text-highlight">
                {canCreateMore ? "Criar novo perfil" : "Limite maximo atingido"}
              </div>
            </button>
          </section>

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
