import { UserRound } from "lucide-react";

import type { CharacterJourney } from "@/lib/character-journeys";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface JourneyGridProps {
  journeys: CharacterJourney[];
  selectedId: string | null;
  onSelect: (journey: CharacterJourney) => void;
}

export function JourneyGrid({ journeys, selectedId, onSelect }: JourneyGridProps) {
  if (journeys.length === 0) {
    return (
      <Card className="sm:col-span-2">
        <p className="text-base font-semibold">Nenhuma jornada encontrada.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajuste a busca ou verifique se o backend retornou jornadas para este perfil.
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
            "surface overflow-hidden rounded-[28px] text-left transition hover:-translate-y-1 hover:border-highlight/35",
            selectedId === journey.id ? "border-highlight/40 bg-accent/65" : "",
          )}
        >
          {journey.coverImageUrl ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-accent/40">
              <img
                src={journey.coverImageUrl}
                alt={journey.titulo}
                className="size-full object-cover"
              />
            </div>
          ) : null}
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              {!journey.coverImageUrl ? (
                <div className="flex size-12 items-center justify-center rounded-2xl bg-highlight/12 text-highlight">
                  <UserRound className="size-6" />
                </div>
              ) : null}
              <Badge>{journey.duracaoEstimadaMinutos} min</Badge>
            </div>
            <div>
              <p className="text-xl font-semibold">{journey.titulo}</p>
              <p className="mt-2 text-sm text-muted-foreground">{journey.categoria}</p>
            </div>
          </div>
        </button>
      ))}
    </>
  );
}
