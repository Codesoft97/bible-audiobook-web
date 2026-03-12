import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth/session.server";
import { APP_ROUTES } from "@/lib/constants";

type RedirectStatus = "success" | "cancel" | "portal";

function resolveStatus(value?: string): RedirectStatus | null {
  if (value === "success" || value === "cancel" || value === "portal") {
    return value;
  }

  return null;
}

const STATUS_MESSAGES: Record<RedirectStatus, string> = {
  success: "Checkout concluido com sucesso.",
  cancel: "Checkout cancelado.",
  portal: "Retorno do portal de assinatura realizado.",
};

export default async function RedirectAppPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = resolveStatus(params.status);

  if (!status) {
    redirect(APP_ROUTES.root);
  }

  const session = await getServerSession();

  if (session) {
    redirect(`${APP_ROUTES.app}?status=${status}`);
  }

  return (
    <main className="dashboard-atmosphere min-h-screen px-4 py-8 md:px-7 md:py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border/65 bg-card/85 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Retorno do checkout</p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">
          {STATUS_MESSAGES[status]}
        </h1>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={APP_ROUTES.login}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Entrar
          </Link>
          <Link
            href={APP_ROUTES.root}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/65 bg-background/70 px-5 text-sm font-medium text-foreground transition hover:bg-background"
          >
            Ir para inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
