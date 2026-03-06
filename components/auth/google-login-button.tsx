"use client";

import { useEffect, useState, useTransition } from "react";

import type { CredentialResponse } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
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
  const [message, setMessage] = useState("");
  const [buttonWidth, setButtonWidth] = useState(400);
  const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();

  useEffect(() => {
    function updateButtonWidth() {
      if (window.innerWidth <= 640) {
        setButtonWidth(Math.max(260, window.innerWidth - 64));
        return;
      }

      setButtonWidth(400);
    }

    updateButtonWidth();
    window.addEventListener("resize", updateButtonWidth);

    return () => {
      window.removeEventListener("resize", updateButtonWidth);
    };
  }, []);

  async function handleCredential(response: CredentialResponse) {
    const credential = response.credential;

    if (!credential) {
      setMessage("Nao foi possivel validar sua conta Google.");
      return;
    }

    setMessage("");

    try {
      const authResponse = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: credential }),
      });

      const data = (await authResponse.json()) as ApiResponse;

      if (!authResponse.ok || data.status !== "success") {
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

  return (
    <div className="space-y-3">
      {clientId ? (
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(response) => {
              void handleCredential(response);
            }}
            onError={() => {
              setMessage("Falha ao iniciar autenticacao com Google.");
            }}
            text="continue_with"
            shape="rectangular"
            size="large"
            width={buttonWidth}
            useOneTap={false}
          />
        </div>
      ) : (
        <Button type="button" variant="secondary" className="w-full" disabled>
          Entrar com Google
        </Button>
      )}
      {pending ? <p className="text-sm text-muted-foreground">Autenticando...</p> : null}
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
    </div>
  );
}
