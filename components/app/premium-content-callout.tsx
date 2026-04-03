import { Crown, Lock } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PremiumContentCallout({
  title = "Conteudo disponivel no plano pago",
  description = "Este conteudo aparece para todos, mas a reproducao esta disponivel apenas para quem assina o plano pago.",
  onUpgradeRequest,
  ctaLabel = "Assinar plano pago",
}: {
  title?: string;
  description?: string;
  onUpgradeRequest: () => void;
  ctaLabel?: string;
}) {
  return (
    <Card className="rounded-[22px] border-highlight/30 bg-highlight/10 p-4 sm:p-5">
      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-highlight">
          <Lock className="size-3.5" />
          Conteudo pago
        </p>
        <div>
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <Button onClick={onUpgradeRequest} className="rounded-2xl">
          <Crown className="size-4" />
          {ctaLabel}
        </Button>
      </div>
    </Card>
  );
}
