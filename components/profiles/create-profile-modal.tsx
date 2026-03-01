"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProfileType } from "@/lib/auth/types";
import { profileSchema } from "@/lib/validation";

interface CreateProfileModalProps {
  isOpen: boolean;
  disabledTypes: ProfileType[];
  onClose: () => void;
  onCreate: (payload: { name: string; type: ProfileType }) => Promise<void>;
}

export function CreateProfileModal({
  isOpen,
  disabledTypes,
  onClose,
  onCreate,
}: CreateProfileModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProfileType>("adult");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setType(disabledTypes.includes("adult") ? "child" : "adult");
      setError("");
      setSubmitting(false);
    }
  }, [disabledTypes, isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleCreate() {
    setError("");

    const validation = profileSchema.safeParse({ name, type });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Revise os dados do perfil.");
      return;
    }

    setSubmitting(true);

    try {
      await onCreate(validation.data);
    } catch (message) {
      setError(message instanceof Error ? message.message : "Nao foi possivel criar o perfil.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm">
      <div className="surface w-full max-w-lg rounded-[28px] p-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Novo perfil
          </p>
          <h3 className="text-2xl font-semibold">Adicione um perfil para outro membro.</h3>
          <p className="text-sm text-muted-foreground">
            Limite total de 3 perfis: ate 2 adultos e 1 infantil.
          </p>
        </div>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="profile-name">
              Nome do perfil
            </label>
            <Input
              id="profile-name"
              autoComplete="off"
              maxLength={60}
              placeholder="Maria Silva"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">Tipo de perfil</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { value: "adult", label: "Adulto", detail: "Acesso padrao para responsaveis." },
                { value: "child", label: "Infantil", detail: "Experiencia filtrada para criancas." },
              ] as const).map((option) => {
                const disabled = disabledTypes.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => setType(option.value)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      type === option.value
                        ? "border-highlight/40 bg-highlight/10"
                        : "border-border bg-background/60"
                    } ${disabled ? "cursor-not-allowed opacity-45" : "hover:border-highlight/50"}`}
                  >
                    <p className="font-medium">{option.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{option.detail}</p>
                  </button>
                );
              })}
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={() => void handleCreate()} disabled={submitting}>
              {submitting ? "Criando..." : "Criar perfil"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
