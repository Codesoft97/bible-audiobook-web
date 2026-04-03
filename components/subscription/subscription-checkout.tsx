"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AlertCircle, CheckCircle2, CreditCard, Crown, Info, Loader2 } from "@/components/icons";

import { Button } from "@/components/ui/button";
import type { ApiEnvelope, AppSession } from "@/lib/auth/types";
import { APP_ROUTES } from "@/lib/constants";
import type {
  BillingCycle,
  SubscriptionCheckoutPayload,
  SubscriptionCheckoutResponse,
  SubscriptionPlansResponse,
  SubscriptionPortalResponse,
  SubscriptionStatusResponse,
} from "@/lib/subscriptions";
import { formatPlanLabel } from "@/lib/utils";

const PLAN_FEATURES = [
  "Livros da Bíblia em texto e áudio",
  "Jornadas de personagens bíblicos",
  "Parábolas de Jesus",
  "Ensinamentos da bíblia sobre assuntos da vida",
  "Caixinha de promessas em áudio",
  "Download para ouvir offline no App",
  "Devocional diário com leitura e áudio",
  "Compartilhamento de versículos com imagens",
  "Atualizações semanais dos conteúdos",
] as const;

const BRL_CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatSubscriptionDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

function formatSubscriptionSourceLabel(value: string | null) {
  switch (value) {
    case "none":
      return null;
    case "stripe":
      return "Site";
    case "google_play":
      return "Google Play";
    case "apple_app_store":
      return "App Store";
    default:
      return value ? value.replace(/_/g, " ") : null;
  }
}

export function SubscriptionCheckout({ session }: { session: AppSession }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [plans, setPlans] = useState<SubscriptionPlansResponse | null>(null);
  const [plansError, setPlansError] = useState("");
  const [plansLoading, setPlansLoading] = useState(false);
  const [checkoutLoadingCycle, setCheckoutLoadingCycle] = useState<BillingCycle | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [returningToApp, setReturningToApp] = useState(false);
  const [actionError, setActionError] = useState("");
  const isNavigatingToApp = returningToApp || pending;
  const resolvedPlan = subscriptionStatus?.plan ?? session.family.plan;
  const hasActiveSubscription = subscriptionStatus?.hasActiveSubscription ?? (session.family.plan === "paid");
  const isStripeManagedSubscription =
    subscriptionStatus?.managementChannel === "stripe" ||
    subscriptionStatus?.billingSource === "stripe" ||
    subscriptionStatus?.hasActiveStripeSubscription === true;
  const canManageOnWeb =
    isStripeManagedSubscription &&
    (Boolean(subscriptionStatus?.canManage) || Boolean(hasActiveSubscription));
  const canPurchaseOnWeb =
    Boolean(subscriptionStatus?.canPurchaseOnWeb) &&
    !subscriptionStatus?.purchaseBlocked &&
    !subscriptionStatus?.hasActiveSubscription;
  const billingSourceLabel = formatSubscriptionSourceLabel(subscriptionStatus?.billingSource ?? null);
  const paidUntilLabel = formatSubscriptionDate(subscriptionStatus?.paidUntil ?? null);
  const lastPaymentLabel = formatSubscriptionDate(subscriptionStatus?.lastPaymentAt ?? null);
  const monthlyPriceLabel = plans ? BRL_CURRENCY_FORMATTER.format(plans.monthlyPrice) : null;
  const annualPriceLabel = plans ? BRL_CURRENCY_FORMATTER.format(plans.annualPrice) : null;
  const annualEquivalentLabel = plans ? BRL_CURRENCY_FORMATTER.format(plans.annualPrice / 12) : null;
  const annualSavings = plans ? plans.monthlyPrice * 12 - plans.annualPrice : null;
  const annualSavingsLabel =
    annualSavings !== null && annualSavings > 0 ? BRL_CURRENCY_FORMATTER.format(annualSavings) : null;

  const pageTitle = subscriptionLoading
    ? "Carregando assinatura"
    : hasActiveSubscription
      ? canManageOnWeb
        ? "Gerencie seu plano"
        : "Assinatura ativa"
      : subscriptionStatus?.purchaseBlocked
        ? "Assinatura indisponivel no web"
        : "Escolha seu plano";
  const pageSubtitle = subscriptionLoading
    ? "Estamos carregando o status mais recente da sua assinatura."
    : subscriptionStatus?.managementMessage ??
      subscriptionStatus?.purchaseBlockedReason ??
      (hasActiveSubscription
        ? "Sua assinatura premium esta ativa."
        : "Assine com cartão de crédito para liberar todos os conteúdos.");

  useEffect(() => {
    let mounted = true;

    async function loadSubscriptionStatus() {
      setSubscriptionLoading(true);
      setSubscriptionError("");

      try {
        const response = await fetch("/api/subscriptions/me", {
          method: "GET",
        });
        const payload = (await response.json()) as ApiEnvelope<SubscriptionStatusResponse>;

        if (!mounted) {
          return;
        }

        if (!response.ok || payload.status !== "success" || !payload.data) {
          setSubscriptionStatus(null);
          setSubscriptionError(payload.message ?? "Nao foi possivel carregar o status da assinatura.");
          return;
        }

        setSubscriptionStatus(payload.data);
      } catch {
        if (!mounted) {
          return;
        }

        setSubscriptionStatus(null);
        setSubscriptionError("Nao foi possivel carregar o status da assinatura.");
      } finally {
        if (mounted) {
          setSubscriptionLoading(false);
        }
      }
    }

    void loadSubscriptionStatus();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (subscriptionLoading || !subscriptionStatus || !canPurchaseOnWeb) {
      return;
    }

    let mounted = true;

    async function loadPlans() {
      setPlansLoading(true);
      setPlansError("");

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
      } finally {
        if (mounted) {
          setPlansLoading(false);
        }
      }
    }

    void loadPlans();

    return () => {
      mounted = false;
    };
  }, [canPurchaseOnWeb, subscriptionLoading, subscriptionStatus]);

  async function handleStartCheckout(billingCycle: BillingCycle) {
    if (checkoutLoadingCycle || portalLoading || isNavigatingToApp) {
      return;
    }

    if (!subscriptionStatus || !canPurchaseOnWeb) {
      setActionError(
        subscriptionStatus?.purchaseBlockedReason ??
          "A compra no web nao esta disponivel para esta conta no momento.",
      );
      return;
    }

    if (!plans) {
      setActionError("Aguarde o carregamento dos valores antes de iniciar o checkout.");
      return;
    }

    setActionError("");
    setCheckoutLoadingCycle(billingCycle);

    try {
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billingCycle,
          platform: "web",
        } satisfies SubscriptionCheckoutPayload),
      });

      const payload = (await response.json()) as ApiEnvelope<SubscriptionCheckoutResponse>;

      if (!response.ok || payload.status !== "success" || !payload.data?.url) {
        setActionError(payload.message ?? "Nao foi possivel iniciar o checkout com cartao.");
        return;
      }

      window.location.assign(payload.data.url);
    } catch {
      setActionError("Nao foi possivel conectar ao servidor.");
    } finally {
      setCheckoutLoadingCycle(null);
    }
  }

  async function handleOpenPortal() {
    if (!subscriptionStatus || !canManageOnWeb || isNavigatingToApp) {
      return;
    }

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

  function handleReturnToApp() {
    if (isNavigatingToApp || portalLoading || checkoutLoadingCycle) {
      return;
    }

    setActionError("");
    setReturningToApp(true);

    startTransition(() => {
      router.push(APP_ROUTES.app);
    });
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
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{pageSubtitle}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Plano atual: {formatPlanLabel(resolvedPlan)}
            </span>
            {billingSourceLabel ? (
              <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm font-medium text-foreground">
                Origem: {billingSourceLabel}
              </span>
            ) : null}
            {paidUntilLabel ? (
              <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm font-medium text-foreground">
                Acesso até: {paidUntilLabel}
              </span>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              onClick={handleReturnToApp}
              disabled={isNavigatingToApp || portalLoading || Boolean(checkoutLoadingCycle)}
              className="h-10 rounded-2xl border border-border/65 bg-background/70 px-4 hover:bg-background"
            >
              {isNavigatingToApp ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Voltando...
                </>
              ) : (
                "Voltar ao app"
              )}
            </Button>

            {canManageOnWeb ? (
              <Button
                onClick={() => void handleOpenPortal()}
                disabled={portalLoading || Boolean(checkoutLoadingCycle) || isNavigatingToApp}
                variant="secondary"
                className="h-10 rounded-2xl"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Abrindo portal
                  </>
                ) : (
                  "Gerenciar no Stripe"
                )}
              </Button>
            ) : null}
          </div>

          {!subscriptionLoading && subscriptionStatus ? (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {subscriptionStatus.managementMessage ? (
                <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <Info className="size-4" />
                    Gerenciamento
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{subscriptionStatus.managementMessage}</p>
                </div>
              ) : null}

              {lastPaymentLabel ? (
                <div className="rounded-2xl border border-border/60 bg-background/65 p-4">
                  <p className="text-sm font-medium text-foreground">Ultimo pagamento</p>
                  <p className="mt-2 text-sm text-muted-foreground">{lastPaymentLabel}</p>
                </div>
              ) : null}

              {subscriptionStatus.lastPaymentProvider ? (
                <div className="rounded-2xl border border-border/60 bg-background/65 p-4">
                  <p className="text-sm font-medium text-foreground">Provedor</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatSubscriptionSourceLabel(subscriptionStatus.lastPaymentProvider)}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        {subscriptionLoading ? (
          <section className="rounded-2xl border border-border/60 bg-card/75 p-5 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Carregando status da assinatura...
            </p>
          </section>
        ) : null}

        {!subscriptionLoading && canPurchaseOnWeb && plansLoading ? (
          <section className="rounded-2xl border border-border/60 bg-card/75 p-5 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Carregando valores da assinatura...
            </p>
          </section>
        ) : null}

        {!subscriptionLoading && canPurchaseOnWeb && plans ? (
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-highlight/40 bg-gradient-to-br from-highlight/10 via-card to-card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <CreditCard className="size-4 text-highlight" />
                  Cartão de credito
                </p>
                <span className="inline-flex rounded-full border border-success/30 bg-success/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-success">
                  Disponivel
                </span>
              </div>

              <p className="mt-3 text-4xl font-semibold text-foreground">{monthlyPriceLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">Plano mensal, cobrança recorrente.</p>

              <ul className="mt-4 space-y-2">
                {PLAN_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 rounded-xl border border-border/55 bg-background/60 px-3 py-2 text-sm text-foreground/90"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => void handleStartCheckout("monthly")}
                disabled={Boolean(checkoutLoadingCycle) || portalLoading || isNavigatingToApp}
                className="mt-5 w-full rounded-2xl"
              >
                {checkoutLoadingCycle === "monthly" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Abrindo checkout
                  </>
                ) : (
                  "Assinar plano mensal"
                )}
              </Button>
            </article>

            <article className="rounded-2xl border border-border/65 bg-card/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <CreditCard className="size-4 text-highlight" />
                  Cartão de credito
                </p>
                <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Melhor custo
                </span>
              </div>

              <p className="mt-3 text-4xl font-semibold text-foreground">{annualPriceLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">Plano anual. Equivale a {annualEquivalentLabel}/mês.</p>
              {annualSavingsLabel ? (
                <p className="mt-2 text-xs font-medium text-primary">
                  Economia de {annualSavingsLabel} por ano em relação ao plano mensal.
                </p>
              ) : null}

              <ul className="mt-4 space-y-2">
                {PLAN_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 rounded-xl border border-border/55 bg-background/60 px-3 py-2 text-sm text-foreground/90"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => void handleStartCheckout("annual")}
                disabled={Boolean(checkoutLoadingCycle) || portalLoading || isNavigatingToApp}
                variant="secondary"
                className="mt-5 w-full rounded-2xl"
              >
                {checkoutLoadingCycle === "annual" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Abrindo checkout
                  </>
                ) : (
                  "Assinar plano anual"
                )}
              </Button>
            </article>
          </section>
        ) : null}

        {!subscriptionLoading && subscriptionStatus?.purchaseBlocked && subscriptionStatus.purchaseBlockedReason ? (
          <div className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-foreground">
            <p className="inline-flex items-center gap-2 font-medium text-primary">
              <Info className="size-4" />
              Compra indisponivel
            </p>
            {/* <p className="mt-2 text-muted-foreground">{subscriptionStatus.purchaseBlockedReason}</p> */}
          </div>
        ) : null}

        {!subscriptionLoading && subscriptionStatus?.hasMultipleActiveRecurringSubscriptions ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="inline-flex items-center gap-2 font-medium">
              <AlertCircle className="size-4" />
              Encontramos mais de uma assinatura recorrente ativa para esta conta.
            </p>
            <p className="mt-2">
              Revise o canal de gerenciamento informado acima antes de iniciar uma nova compra.
            </p>
          </div>
        ) : null}

        {!subscriptionLoading && canPurchaseOnWeb && !plansLoading && plansError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {plansError}
          </div>
        ) : null}

        {!subscriptionLoading && subscriptionError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {subscriptionError}
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
