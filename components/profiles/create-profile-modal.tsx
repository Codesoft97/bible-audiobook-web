"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProfileType } from "@/lib/auth/types";
import { profileSchema } from "@/lib/validation";

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; type: ProfileType }) => Promise<void>;
}

export function CreateProfileModal({
  isOpen,
  onClose,
  onCreate,
}: CreateProfileModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleCreate() {
    setError("");

    const validation = profileSchema.safeParse({ name, type: "adult" });

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
          <h3 className="text-2xl font-semibold">Adicione um perfil para alguem que voce ama.</h3>
          <p className="text-sm text-muted-foreground">
            Vocês compartilham todas as funcionalidades com uma unica conta.
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
