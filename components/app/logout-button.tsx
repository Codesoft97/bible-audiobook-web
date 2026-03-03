"use client";

import { useTransition } from "react";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAudio } from "@/components/providers/audio-context";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const audio = useAudio();
  const [pending, startTransition] = useTransition();

  async function handleLogout() {
    audio.stop();

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      return;
    }

    startTransition(() => {
      router.push(APP_ROUTES.login);
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size={compact ? "icon" : "default"}
      aria-label="Sair"
      title="Sair"
      onClick={() => void handleLogout()}
      disabled={pending}
    >
      <LogOut className="size-4" />
      {compact ? null : pending ? "Saindo..." : "Sair"}
    </Button>
  );
}
