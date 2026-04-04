"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { LogoutButton } from "@/components/app/logout-button";
import { CheckCircle2, Lock } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { RequiredLegalDocuments } from "@/lib/auth/types";
import {
  APP_ROUTES,
  LEGAL_CONSENT_LOCALE,
} from "@/lib/constants";

interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

interface LegalConsentGateProps {
  familyName: string;
  userName: string;
  requiredDocuments: RequiredLegalDocuments;
}

export function LegalConsentGate({
  familyName,
  userName,
  requiredDocuments,
}: LegalConsentGateProps) {
  const router = useRouter();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pending, startTransition] = useTransition();
  const isLoading = submitting || pending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!acceptTerms || !acceptPolicy) {
      setError("Voce precisa aceitar os Termos de Uso e a Politica de Privacidade.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/families/me/legal-consent", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          acceptTerms: true,
          acceptPolicy: true,
          termsVersion: requiredDocuments.termsVersion,
          policyVersion: requiredDocuments.policyVersion,
          locale: LEGAL_CONSENT_LOCALE,
        }),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || data.status !== "success") {
        setError(data.message ?? "Nao foi possivel registrar o aceite.");
        setSubmitting(false);
        return;
      }
    } catch {
      setError("Nao foi possivel conectar ao servidor.");
      setSubmitting(false);
      return;
    }

    startTransition(() => {
      router.replace(APP_ROUTES.profiles);
      router.refresh();
    });
  }

  return (
    <main className="dashboard-atmosphere min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-7 md:py-8">
      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-[28px] border border-border/70 bg-card/92 shadow-glow">
          <div className="border-b border-border/60 bg-gradient-to-br from-[#081f3a] via-[#0c2f57] to-[#091d33] px-5 py-6 text-primary-foreground sm:px-7 sm:py-8 md:px-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground">
              <Lock className="size-3.5" />
              Aceite dos termos
            </div>

            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Antes de continuar, confirme o aceite dos documentos legais.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-primary-foreground/80 sm:text-base">
              Oi, {userName}. Para acessar o Evangelho em áudio você precisa aceitar os Termos de Uso e a Politica de Privacidade.
            </p>
          </div>

          <div className="space-y-6 px-5 py-6 sm:px-7 sm:py-8 md:px-10">
            <div className="rounded-3xl border border-border/65 bg-background/55 p-5">
              <p className="text-sm leading-7 text-muted-foreground">
                Leia os documentos abaixo antes de continuar.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  href={APP_ROUTES.termsOfUse}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-border/60 bg-card/75 px-4 py-4 transition hover:border-highlight/35 hover:bg-card"
                >
                  <p className="text-sm font-semibold text-foreground">Termos de Uso</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Versão: {requiredDocuments.termsVersion}
                  </p>
                </Link>

                <Link
                  href={APP_ROUTES.privacyPolicy}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-border/60 bg-card/75 px-4 py-4 transition hover:border-highlight/35 hover:bg-card"
                >
                  <p className="text-sm font-semibold text-foreground">Politica de Privacidade</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Versão: {requiredDocuments.policyVersion}
                  </p>
                </Link>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4 rounded-3xl border border-border/65 bg-background/55 p-5">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(event) => setAcceptTerms(event.target.checked)}
                    className="mt-1 size-4 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm leading-7 text-foreground/90">
                    Li e aceito os{" "}
                    <Link
                      href={APP_ROUTES.termsOfUse}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      Termos de Uso
                    </Link>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptPolicy}
                    onChange={(event) => setAcceptPolicy(event.target.checked)}
                    className="mt-1 size-4 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm leading-7 text-foreground/90">
                    Li e aceito a{" "}
                    <Link
                      href={APP_ROUTES.privacyPolicy}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      Politica de Privacidade
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {error ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="sm:min-w-[220px]" type="submit" disabled={isLoading}>
                  {isLoading ? "Registrando aceite..." : "Aceitar e continuar"}
                </Button>
                <LogoutButton
                  variant="secondary"
                  className="sm:min-w-[160px]"
                />
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
