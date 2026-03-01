"use client";

import { useMemo, useState, useTransition } from "react";

import { Plus, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { CreateProfileModal } from "@/components/profiles/create-profile-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AppSession, Profile, ProfileType } from "@/lib/auth/types";
import { APP_ROUTES, PROFILE_LIMITS } from "@/lib/constants";
import { formatPlanLabel, formatProfileTypeLabel } from "@/lib/utils";

interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export function ProfileSelection({ session }: { session: AppSession }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(session.profiles);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(() => {
    return profiles.reduce(
      (accumulator, profile) => {
        accumulator[profile.type] += 1;
        return accumulator;
      },
      { adult: 0, child: 0 },
    );
  }, [profiles]);

  const disabledTypes = useMemo(() => {
    const result: ProfileType[] = [];

    if (counts.adult >= PROFILE_LIMITS.adult) {
      result.push("adult");
    }

    if (counts.child >= PROFILE_LIMITS.child) {
      result.push("child");
    }

    return result;
  }, [counts.adult, counts.child]);

  const canCreateMore = profiles.length < PROFILE_LIMITS.adult + PROFILE_LIMITS.child;

  async function handleSelect(profileId: string) {
    setError("");

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
        return;
      }
    } catch {
      setError("Nao foi possivel conectar ao servidor.");
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
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Nao foi possivel conectar ao servidor.",
      );
    }
  }

  return (
    <>
      <CreateProfileModal
        isOpen={modalOpen}
        disabledTypes={disabledTypes}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-5 rounded-[32px] border border-border/70 bg-card/85 p-6 backdrop-blur-sm md:flex-row md:items-center md:justify-between md:p-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-4 py-2 text-sm text-highlight">
                <ShieldCheck className="size-4" />
                Sessao autenticada com cookies HTTP-only
              </div>
              <div>
                <h1 className="text-4xl font-semibold">Quem vai ouvir agora?</h1>
                <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                  Escolha um perfil para entrar no sistema. O plano da familia vem do backend e o
                  perfil selecionado passa a acompanhar a sessao.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="min-w-[168px] p-5">
                <p className="text-sm text-muted-foreground">Familia</p>
                <p className="mt-2 text-lg font-semibold">{session.family.familyName}</p>
              </Card>
              <Card className="min-w-[168px] border-highlight/20 bg-gradient-to-br from-accent/85 to-highlight/10 p-5">
                <p className="text-sm text-muted-foreground">Plano</p>
                <p className="mt-2 text-lg font-semibold">{formatPlanLabel(session.family.plan)}</p>
              </Card>
              <Card className="min-w-[168px] p-5">
                <p className="text-sm text-muted-foreground">Perfis</p>
                <p className="mt-2 text-lg font-semibold">
                  {counts.adult}/2 adultos | {counts.child}/1 infantil
                </p>
              </Card>
            </div>
          </div>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                className="group flex min-h-[280px] flex-col justify-between rounded-[32px] border-highlight/15 bg-gradient-to-br from-card via-card to-accent/55 p-7 transition hover:-translate-y-1 hover:border-highlight/40"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex size-16 items-center justify-center rounded-[22px] bg-highlight/12 text-highlight">
                      <UserRound className="size-8" />
                    </div>
                    <Badge>{formatProfileTypeLabel(profile.type)}</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold">{profile.name}</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Perfil pronto para acessar o sistema com filtros, preferencias e historico
                      dedicados.
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-6 w-full"
                  onClick={() => void handleSelect(profile.id)}
                  disabled={pending}
                >
                  Entrar com este perfil
                </Button>
              </Card>
            ))}

            <Card className="flex min-h-[280px] flex-col justify-between rounded-[32px] border-dashed bg-transparent">
              <div className="space-y-4">
                <div className="flex size-16 items-center justify-center rounded-[22px] border border-dashed border-highlight/30 bg-highlight/8 text-highlight">
                  <Plus className="size-8" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-semibold">Novo perfil</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Cadastre mais membros da familia. O backend garante os limites por tipo de
                    perfil.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="mt-6 w-full"
                disabled={!canCreateMore}
                onClick={() => setModalOpen(true)}
              >
                {canCreateMore ? "Adicionar perfil" : "Limite maximo atingido"}
              </Button>
            </Card>
          </section>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </main>
    </>
  );
}
