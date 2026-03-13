import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckCircle2, Crown } from "@/components/icons";

import { APP_ROUTES } from "@/lib/constants";
import { getServerSessionWithFamily } from "@/lib/family";

export default async function SubscriptionSuccessPage() {
  const session = await getServerSessionWithFamily();

  if (!session) {
    redirect(APP_ROUTES.login);
  }

  return (
    <main className="dashboard-atmosphere min-h-screen px-4 py-8 md:px-7 md:py-10">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-success/30 bg-success/10 p-6 md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-success/35 bg-success/15 px-3 py-1 text-xs uppercase tracking-[0.14em] text-success">
            <CheckCircle2 className="size-3.5" />
            Compra confirmada
          </p>

          <h1 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
            Assinatura concluida com sucesso
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Seu pagamento foi aprovado, você já pode continuar aproveitando os conteúdos.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={APP_ROUTES.app}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Ir para o app
            </Link>
            <Link
              href={APP_ROUTES.subscription}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/65 bg-background/70 px-5 text-sm font-medium text-foreground transition hover:bg-background"
            >
              Ver assinatura
            </Link>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-border/65 bg-card/75 p-5">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <Crown className="size-3.5 text-highlight" />
            Próximo passo
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Se o plano ainda não tiver mudado na interface, aguarde alguns segundos e atualize a página.
          </p>
        </section>
      </div>
    </main>
  );
}
