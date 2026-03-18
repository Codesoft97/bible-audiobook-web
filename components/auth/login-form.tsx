"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_ROUTES } from "@/lib/constants";
import { loginSchema } from "@/lib/validation";

interface ApiResponse {
  status: "success" | "error";
  message?: string;
}

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const isLoading = submitting || pending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const validation = loginSchema.safeParse(form);

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Revise os dados informados.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || data.status !== "success") {
        setError(data.message ?? "Nao foi possivel entrar.");
        setSubmitting(false);
        return;
      }
    } catch {
      setError("Nao foi possivel conectar ao servidor.");
      setSubmitting(false);
      return;
    }

    startTransition(() => {
      router.push(APP_ROUTES.profiles);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <GoogleLoginButton flow="login" />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/70" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span className="bg-card px-3">ou use seu email</span>
        </div>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            autoComplete="email"
            inputMode="email"
            placeholder="joao@email.com"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium" htmlFor="password">
              Senha
            </label>
            <Link
              href={APP_ROUTES.forgotPassword}
              className="text-sm font-medium text-primary transition hover:opacity-80"
            >
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
