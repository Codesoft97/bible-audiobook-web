"use client";

import { useState } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_ROUTES } from "@/lib/constants";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyResetCodeSchema,
} from "@/lib/validation";

type Step = "request" | "verify" | "reset" | "done";

interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export function ForgotPasswordFlow() {
  const [step, setStep] = useState<Step>("request");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest() {
    setError("");
    setSuccess("");
    setSubmitting(true);

    const validation = forgotPasswordSchema.safeParse({ email });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Informe um email valido.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });
      const data = (await response.json()) as ApiResponse<{ message: string }>;

      if (!response.ok || data.status !== "success") {
        setError(data.message ?? "Nao foi possivel enviar o codigo.");
        return;
      }

      setSuccess(data.data?.message ?? "Se o email existir, o codigo foi enviado.");
      setStep("verify");
    } catch {
      setError("Nao foi possivel conectar ao servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify() {
    setError("");
    setSuccess("");
    setSubmitting(true);

    const validation = verifyResetCodeSchema.safeParse({ email, code });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Revise o codigo informado.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });
      const data = (await response.json()) as ApiResponse<{ token: string }>;

      if (!response.ok || data.status !== "success" || !data.data?.token) {
        setError(data.message ?? "Codigo invalido ou expirado.");
        return;
      }

      setToken(data.data.token);
      setStep("reset");
    } catch {
      setError("Nao foi possivel conectar ao servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset() {
    setError("");
    setSuccess("");
    setSubmitting(true);

    const validation = resetPasswordSchema.safeParse({ token, newPassword });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Revise sua nova senha.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });
      const data = (await response.json()) as ApiResponse<{ message: string }>;

      if (!response.ok || data.status !== "success") {
        setError(data.message ?? "Nao foi possivel redefinir sua senha.");
        return;
      }

      setSuccess(data.data?.message ?? "Senha redefinida com sucesso.");
      setStep("done");
    } catch {
      setError("Nao foi possivel conectar ao servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-2">
        {["Email", "Codigo", "Nova senha", "Concluido"].map((label, index) => {
          const activeSteps: Record<Step, number> = {
            request: 0,
            verify: 1,
            reset: 2,
            done: 3,
          };

          const active = index <= activeSteps[step];

          return (
            <div
              key={label}
              className={`rounded-full px-3 py-2 text-center text-xs font-medium ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "border border-highlight/20 bg-accent/90 text-accent-foreground"
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>

      {step === "request" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="reset-email">
              Email
            </label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              placeholder="joao@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button className="w-full" onClick={() => void handleRequest()} disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar codigo"}
          </Button>
        </div>
      ) : null}

      {step === "verify" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-highlight/20 bg-accent/80 p-4 text-sm text-accent-foreground">
            {success || "Digite o codigo de 6 digitos enviado para seu email."}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="code">
              Codigo
            </label>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="482931"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            />
          </div>
          <Button className="w-full" onClick={() => void handleVerify()} disabled={submitting}>
            {submitting ? "Validando..." : "Validar codigo"}
          </Button>
        </div>
      ) : null}

      {step === "reset" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="newPassword">
              Nova senha
            </label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Crie uma nova senha"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <Button className="w-full" onClick={() => void handleReset()} disabled={submitting}>
            {submitting ? "Salvando..." : "Redefinir senha"}
          </Button>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-success/20 bg-success/10 p-4 text-sm text-foreground">
            {success}
          </div>
          <Link
            href={APP_ROUTES.login}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Voltar para login
          </Link>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
