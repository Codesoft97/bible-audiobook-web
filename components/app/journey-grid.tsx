import Image from "next/image";
import { PersonSimpleHike } from "@/components/icons";
import type { LucideIcon } from "@/components/icons";

import type { CharacterJourney } from "@/lib/character-journeys";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface JourneyGridProps {
  journeys: CharacterJourney[];
  selectedId: string | null;
  onSelect: (journey: CharacterJourney) => void;
  itemLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  layout?: "grid" | "rail";
  icon?: LucideIcon;
}

export function JourneyGrid({
  journeys,
  selectedId,
  onSelect,
  itemLabel = "jornada",
  emptyTitle,
  emptyDescription,
  layout = "grid",
  icon: Icon = PersonSimpleHike,
}: JourneyGridProps) {
  const isRail = layout === "rail";
  const noItemsTitle = emptyTitle ?? `Nenhuma ${itemLabel} encontrada`;
  const noItemsDescription =
    emptyDescription ??
    `Ajuste a busca para localizar ${itemLabel} disponiveis para este perfil.`;

  if (journeys.length === 0) {
    return (
      <Card className={cn("rounded-[20px] bg-background/70", !isRail && "sm:col-span-2 xl:col-span-3")}>
        <p className="text-base font-semibold">{noItemsTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {noItemsDescription}
        </p>
      </Card>
    );
  }

  if (isRail) {
    return (
      <div className="space-y-3">
        {journeys.map((journey) => (
          <button
            key={journey.id}
            type="button"
            onClick={() => onSelect(journey)}
            className={cn(
              "group flex w-full flex-col gap-2.5 rounded-[22px] border border-border/70 bg-card/92 p-3 text-left shadow-[0_14px_32px_-28px_rgba(12,27,47,0.55)] transition hover:border-highlight/35 hover:bg-card sm:flex-row sm:items-start sm:gap-3",
              selectedId === journey.id && "border-highlight/55 bg-highlight/8 ring-1 ring-highlight/35",
            )}
          >
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-[18px] bg-accent/35 sm:aspect-[16/10] sm:w-[122px]">
              {journey.coverImageUrl ? (
                <Image
                  src={journey.coverImageUrl}
                  alt={journey.titulo}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 122px"
                  className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-highlight">
                  <Icon className="size-6" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-5 text-foreground">{journey.titulo}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{journey.categoria}</p>
                </div>
                <Badge className="shrink-0">{journey.duracaoEstimadaMinutos} min</Badge>
              </div>

              <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:mt-3">
                {selectedId === journey.id ? "Selecionado" : "Abrir no player"}
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      {journeys.map((journey) => (
        <button
          key={journey.id}
          type="button"
          onClick={() => onSelect(journey)}
          className={cn(
            "group overflow-hidden rounded-[20px] border border-border/70 bg-card/95 text-left shadow-[0_16px_36px_-26px_rgba(12,27,47,0.55)] transition hover:-translate-y-0.5 hover:border-highlight/40",
            selectedId === journey.id
              ? "border-highlight/60 bg-highlight/8 ring-1 ring-highlight/45"
              : "",
          )}
        >
          {journey.coverImageUrl ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-accent/30">
              <Image
                src={journey.coverImageUrl}
                alt={journey.titulo}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </div>
          ) : null}
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              {!journey.coverImageUrl ? (
                <div className="flex size-11 items-center justify-center rounded-2xl bg-highlight/12 text-highlight">
                  <Icon className="size-5" />
                </div>
              ) : null}
              <Badge>{journey.duracaoEstimadaMinutos} min</Badge>
            </div>
            <div>
              <p className="text-xl font-semibold leading-tight text-foreground">{journey.titulo}</p>
              <p className="mt-2 text-sm text-muted-foreground">{journey.categoria}</p>
            </div>
          </div>
        </button>
      ))}
    </>
  );
}
