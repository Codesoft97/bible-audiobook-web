"use client";

import { useTransition } from "react";

import { LogOut } from "@/components/icons";
import { useRouter } from "next/navigation";

import { useAudio } from "@/components/providers/audio-context";
import { Button, type ButtonProps } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LogoutButton({
  compact = false,
  className,
  variant = "ghost",
}: {
  compact?: boolean;
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const router = useRouter();
  const audio = useAudio();
  const [pending, startTransition] = useTransition();

  async function handleLogout() {
    audio.stop();

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
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
      variant={variant}
      size={compact ? "icon" : "default"}
      aria-label="Sair"
      title="Sair"
      onClick={() => void handleLogout()}
      disabled={pending}
      className={cn(className)}
    >
      <LogOut className="size-4" />
      {compact ? null : pending ? "Saindo..." : "Sair"}
    </Button>
  );
}
