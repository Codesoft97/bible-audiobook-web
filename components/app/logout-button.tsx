"use client";

import { useState, useTransition } from "react";

import { LoaderCircle, LogOut } from "@/components/icons";
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pending, startTransition] = useTransition();
  const isLoading = isLoggingOut || pending;

  async function handleLogout() {
    if (isLoading) {
      return;
    }

    setIsLoggingOut(true);
    audio.stop();

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      setIsLoggingOut(false);
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
      title={isLoading ? "Saindo..." : "Sair"}
      onClick={() => void handleLogout()}
      disabled={isLoading}
      className={cn(className)}
    >
      {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      {compact ? null : isLoading ? "Saindo..." : "Sair"}
    </Button>
  );
}
