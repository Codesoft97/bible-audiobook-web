import Image from "next/image";
import { UserRound } from "lucide-react";

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
}

export function JourneyGrid({
  journeys,
  selectedId,
  onSelect,
  itemLabel = "jornada",
  emptyTitle,
  emptyDescription,
}: JourneyGridProps) {
  const noItemsTitle = emptyTitle ?? `Nenhuma ${itemLabel} encontrada`;
  const noItemsDescription =
    emptyDescription ??
    `Ajuste a busca para localizar ${itemLabel} disponiveis para este perfil.`;

  if (journeys.length === 0) {
    return (
      <Card className="rounded-[20px] bg-background/70 sm:col-span-2 xl:col-span-3">
        <p className="text-base font-semibold">{noItemsTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {noItemsDescription}
        </p>
      </Card>
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
                  <UserRound className="size-5" />
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
