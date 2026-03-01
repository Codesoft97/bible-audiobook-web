"use client";

import { useEffect, useState, useTransition } from "react";

import Script from "next/script";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants";

interface ApiResponse {
  status: "success" | "error";
  message?: string;
}

export function GoogleLoginButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [scriptReady, setScriptReady] = useState(false);
  const [message, setMessage] = useState("");
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  useEffect(() => {
    if (!scriptReady || !clientId || !window.google) {
      return;
    }

    async function handleCredential(credential?: string) {
      if (!credential) {
        setMessage("Nao foi possivel validar sua conta Google.");
        return;
      }

      setMessage("");

      try {
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken: credential }),
        });

        const data = (await response.json()) as ApiResponse;

        if (!response.ok || data.status !== "success") {
          setMessage(data.message ?? "Falha ao autenticar com Google.");
          return;
        }
      } catch {
        setMessage("Nao foi possivel conectar ao servidor.");
        return;
      }

      startTransition(() => {
        router.push(APP_ROUTES.profiles);
        router.refresh();
      });
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => {
        void handleCredential(credential);
      },
    });
  }, [clientId, router, scriptReady, startTransition]);

  const disabled = pending || !clientId || !scriptReady;

  return (
    <div className="space-y-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={disabled}
        onClick={() => {
          setMessage("");

          if (!clientId) {
            setMessage("Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID para habilitar o Google sign-in.");
            return;
          }

          window.google?.accounts.id.prompt();
        }}
      >
        Entrar com Google
      </Button>
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
    </div>
  );
}
