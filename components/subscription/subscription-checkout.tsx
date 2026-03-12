"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CheckCircle2, Copy, Crown, Loader2, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiEnvelope, AppSession } from "@/lib/auth/types";
import { APP_ROUTES } from "@/lib/constants";
import type {
  SubscriptionPixCheckoutPayload,
  SubscriptionPixCheckoutResponse,
  SubscriptionPlansResponse,
  SubscriptionPortalResponse,
} from "@/lib/subscriptions";
import { formatPlanLabel } from "@/lib/utils";

const PIX_PLAN_FEATURES = [
  "Biblioteca completa",
  "Jornadas, parabolas e ensinamentos",
  "Promessas em audio",
  "Envios no WhatsApp",
] as const;

const FALLBACK_PLANS: SubscriptionPlansResponse = {
  freeTrialDays: 7,
  monthlyPrice: 19.9,
  annualPrice: 199.9,
};

const BRL_CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function resolvePixQrCodeSource(checkout: SubscriptionPixCheckoutResponse | null) {
  if (!checkout) {
    return null;
  }

  if (checkout.qrCodeImageUrl) {
    return checkout.qrCodeImageUrl;
  }

  if (!checkout.qrCodeBase64) {
    return null;
  }

  if (checkout.qrCodeBase64.startsWith("data:image")) {
    return checkout.qrCodeBase64;
  }

  if (checkout.qrCodeBase64.startsWith("http")) {
    return checkout.qrCodeBase64;
  }

  return `data:image/svg+xml;base64,${checkout.qrCodeBase64}`;
}

function formatExpiresAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return DATETIME_FORMATTER.format(date);
}

function sanitizeCpf(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatCpf(value: string) {
  const digits = sanitizeCpf(value);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);

  if (digits.length <= 3) {
    return part1;
  }

  if (digits.length <= 6) {
    return `${part1}.${part2}`;
  }

  if (digits.length <= 9) {
    return `${part1}.${part2}.${part3}`;
  }

  return `${part1}.${part2}.${part3}-${part4}`;
}

export function SubscriptionCheckout({ session }: { session: AppSession }) {
  const [plans, setPlans] = useState<SubscriptionPlansResponse | null>(null);
  const [plansError, setPlansError] = useState("");
  const [pixLoading, setPixLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pixCheckout, setPixCheckout] = useState<SubscriptionPixCheckoutResponse | null>(null);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [cpfInput, setCpfInput] = useState("");

  const hasActiveSubscription = session.family.plan === "paid";
  const resolvedPlans = plans ?? FALLBACK_PLANS;
  const pixPriceLabel = BRL_CURRENCY_FORMATTER.format(resolvedPlans.monthlyPrice);
  const taxId = useMemo(() => sanitizeCpf(cpfInput), [cpfInput]);
  const isTaxIdValid = taxId.length === 11;
  const pageTitle = hasActiveSubscription ? "Gerencie seu plano" : "Escolha como assinar";
  const pageSubtitle = hasActiveSubscription
    ? "Sua assinatura esta ativa. Use o portal para acompanhar cobrancas, atualizar forma de pagamento ou cancelar quando precisar."
    : "Escolha o metodo de pagamento para liberar todos os recursos premium. Cartao de credito sera liberado em breve.";
  const pixQrCodeSource = useMemo(() => resolvePixQrCodeSource(pixCheckout), [pixCheckout]);

  useEffect(() => {
    if (hasActiveSubscription) {
      return;
    }

    let mounted = true;

    async function loadPlans() {
      try {
        const response = await fetch("/api/subscriptions/plans", {
          method: "GET",
        });
        const payload = (await response.json()) as ApiEnvelope<SubscriptionPlansResponse>;

        if (!mounted) {
          return;
        }

        if (!response.ok || payload.status !== "success" || !payload.data) {
          setPlansError(payload.message ?? "Nao foi possivel carregar os valores da assinatura.");
          return;
        }

        setPlans(payload.data);
      } catch {
        if (!mounted) {
          return;
        }

        setPlansError("Nao foi possivel carregar os valores da assinatura.");
      }
    }

    void loadPlans();

    return () => {
      mounted = false;
    };
  }, [hasActiveSubscription]);

  useEffect(() => {
    if (!copyFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyFeedback("");
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyFeedback]);

  async function handleCreatePixCheckout() {
    setActionError("");
    setCopyFeedback("");
    setPixCheckout(null);

    if (!isTaxIdValid) {
      setActionError("Preencha um CPF valido para gerar o pagamento via PIX.");
      return;
    }

    setPixLoading(true);

    try {
      const response = await fetch("/api/subscriptions/pix/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taxId,
        } satisfies SubscriptionPixCheckoutPayload),
      });

      const payload = (await response.json()) as ApiEnvelope<SubscriptionPixCheckoutResponse>;

      if (!response.ok || payload.status !== "success" || !payload.data) {
        setActionError(payload.message ?? "Nao foi possivel iniciar o checkout via PIX.");
        return;
      }

      setPixCheckout(payload.data);
    } catch {
      setActionError("Nao foi possivel conectar ao servidor.");
    } finally {
      setPixLoading(false);
    }
  }

  async function handleCopyPixCode() {
    if (!pixCheckout?.qrCodeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(pixCheckout.qrCodeText);
      setCopyFeedback("Codigo PIX copiado.");
    } catch {
      setCopyFeedback("Nao foi possivel copiar automaticamente.");
    }
  }

  async function handleOpenPortal() {
    setActionError("");
    setPortalLoading(true);

    try {
      const response = await fetch("/api/subscriptions/portal", {
        method: "POST",
      });
      const payload = (await response.json()) as ApiEnvelope<SubscriptionPortalResponse>;

      if (!response.ok || payload.status !== "success" || !payload.data?.url) {
        setActionError(payload.message ?? "Nao foi possivel abrir o portal de assinatura.");
        setPortalLoading(false);
        return;
      }

      window.location.assign(payload.data.url);
    } catch {
      setActionError("Nao foi possivel conectar ao servidor.");
      setPortalLoading(false);
    }
  }

  return (
    <main className="dashboard-atmosphere min-h-screen px-4 py-6 md:px-7 md:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-border/65 bg-card/80 p-6 md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/12 px-3 py-1 text-xs uppercase tracking-[0.14em] text-highlight">
            <Crown className="size-3.5" />
            {hasActiveSubscription ? "Assinatura ativa" : "Assinatura"}
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">{pageTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            {pageSubtitle}
          </p>
          {!hasActiveSubscription ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {resolvedPlans.freeTrialDays} dias de teste gratis para novos assinantes.
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Plano atual: {formatPlanLabel(session.family.plan)}
            </span>

            <Link
              href={APP_ROUTES.app}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-border/65 bg-background/70 px-4 text-sm font-medium text-foreground transition hover:bg-background"
            >
              Voltar ao app
            </Link>

            {hasActiveSubscription ? (
              <Button
                onClick={() => void handleOpenPortal()}
                disabled={portalLoading || pixLoading}
                variant="secondary"
                className="h-10 rounded-2xl"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Abrindo portal
                  </>
                ) : (
                  "Gerenciar assinatura"
                )}
              </Button>
            ) : null}
          </div>
        </section>

        {!hasActiveSubscription ? (
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-highlight/40 bg-gradient-to-br from-highlight/10 via-card to-card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <QrCode className="size-4 text-highlight" />
                  PIX
                </p>
                <span className="inline-flex rounded-full border border-success/30 bg-success/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-success">
                  Disponivel
                </span>
              </div>

              <p className="mt-3 text-4xl font-semibold text-foreground">{pixPriceLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">Pagamento mensal via PIX</p>

              <ul className="mt-4 space-y-2">
                {PIX_PLAN_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 rounded-xl border border-border/55 bg-background/60 px-3 py-2 text-sm text-foreground/90"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2">
                <label htmlFor="pix-cpf" className="text-sm font-medium text-foreground">
                  CPF do titular
                </label>
                <Input
                  id="pix-cpf"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  value={cpfInput}
                  onChange={(event) => {
                    setCpfInput(formatCpf(event.target.value));
                    setActionError("");
                    setPixCheckout(null);
                  }}
                  maxLength={14}
                />
                <p className="text-xs text-muted-foreground">
                  Usamos seu CPF apenas para gerar este pagamento PIX. Nao salvamos essa informacao.
                </p>
              </div>

              <Button
                onClick={() => void handleCreatePixCheckout()}
                disabled={pixLoading || portalLoading || !isTaxIdValid}
                className="mt-5 w-full rounded-2xl"
              >
                {pixLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Gerando pagamento PIX
                  </>
                ) : (
                  "Gerar QR Code PIX"
                )}
              </Button>
            </article>

            <article className="rounded-2xl border border-border/65 bg-card/70 p-5 opacity-55">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Cartao de credito
                </p>
                <span className="inline-flex rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Em breve
                </span>
              </div>
              <p className="mt-3 text-4xl font-semibold text-foreground">{pixPriceLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Por enquanto para assinar com cartão de crédito você precisa baixar o App nas lojas.
              </p>
              <Button disabled className="mt-5 w-full rounded-2xl">
                Em breve
              </Button>
            </article>
          </section>
        ) : null}

        {!hasActiveSubscription && pixCheckout ? (
          <section className="rounded-2xl border border-primary/35 bg-primary/8 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/12 px-3 py-1 text-xs uppercase tracking-[0.14em] text-primary">
                <QrCode className="size-3.5" />
                Pagamento PIX gerado
              </p>
              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                {pixPriceLabel}
              </span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[220px,1fr]">
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-border/65 bg-background/65 p-4">
                {pixQrCodeSource ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pixQrCodeSource}
                    alt="QR Code PIX para pagamento da assinatura"
                    className="size-full max-h-[220px] max-w-[220px] rounded-xl object-contain"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <QrCode className="mx-auto size-10" />
                    <p className="mt-2 text-sm">QR Code indisponivel</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Escaneie o QR Code no app do seu banco ou copie o codigo abaixo para pagar.
                </p>

                <div className="mt-3 rounded-xl border border-border/65 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Copia e cola PIX</p>
                  <p className="mt-2 break-all text-xs leading-5 text-foreground">
                    {pixCheckout.qrCodeText}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleCopyPixCode()}
                    className="rounded-2xl"
                  >
                    <Copy className="size-4" />
                    Copiar codigo PIX
                  </Button>
                  {copyFeedback ? <span className="text-sm text-muted-foreground">{copyFeedback}</span> : null}
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Expira em: <strong className="font-medium text-foreground">{formatExpiresAt(pixCheckout.expiresAt)}</strong>
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {!hasActiveSubscription && plansError ? (
          <div className="rounded-2xl border border-highlight/30 bg-highlight/10 px-4 py-3 text-sm text-highlight">
            {plansError} Exibindo valores padrao.
          </div>
        ) : null}

        {actionError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}
      </div>
    </main>
  );
}
