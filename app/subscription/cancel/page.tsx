import Link from "next/link";
import { redirect } from "next/navigation";

import { AlertCircle, RefreshCw } from "@/components/icons";

import { APP_ROUTES } from "@/lib/constants";
import { getServerSessionWithFamily } from "@/lib/family";

export default async function SubscriptionCancelPage() {
  const session = await getServerSessionWithFamily();

  if (!session) {
    redirect(APP_ROUTES.login);
  }

  return (
    <main className="dashboard-atmosphere min-h-screen px-4 py-8 md:px-7 md:py-10">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-destructive/30 bg-destructive/10 p-6 md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-destructive/35 bg-destructive/15 px-3 py-1 text-xs uppercase tracking-[0.14em] text-destructive">
            <AlertCircle className="size-3.5" />
            Checkout cancelado
          </p>

          <h1 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
            Não foi possivel concluir a assinatura
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            O pagamento foi cancelado ou ocorreu alguma falha. Voce pode tentar novamente quando quiser.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={APP_ROUTES.subscription}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <RefreshCw className="size-4" />
              Tentar novamente
            </Link>
            <Link
              href={APP_ROUTES.app}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/65 bg-background/70 px-5 text-sm font-medium text-foreground transition hover:bg-background"
            >
              Voltar ao app
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
