import { CheckCircle2, Crown } from "@/components/icons";
import { cn } from "@/lib/utils";

export function ContentAccessIndicator({
  isFree,
  showLabel = false,
  className,
}: {
  isFree: boolean;
  showLabel?: boolean;
  className?: string;
}) {
  const label = isFree ? "Conteudo gratis" : "Conteudo pago";
  const Icon = isFree ? CheckCircle2 : Crown;

  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border text-[11px] font-medium uppercase tracking-[0.08em]",
        isFree
          ? "border-success/30 bg-success/10 text-success"
          : "border-highlight/30 bg-highlight/10 text-highlight",
        showLabel ? "px-2.5 py-1" : "size-7 justify-center p-0",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {showLabel ? <span>{isFree ? "Gratis" : "Pago"}</span> : null}
    </span>
  );
}
