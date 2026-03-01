"use client";

import { Headphones, Sparkles, UserRound } from "lucide-react";

import type { CharacterJourney } from "@/lib/character-journeys";
import { Badge } from "@/components/ui/badge";

interface CharacterJourneyPlayerProps {
  journey: CharacterJourney;
  audioUrl: string;
}

export function CharacterJourneyPlayer({
  journey,
  audioUrl,
}: CharacterJourneyPlayerProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-[30px] border border-highlight/25 bg-gradient-to-br from-background via-background to-accent/70 p-5 shadow-glow">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-highlight">
              <Headphones className="size-3.5" />
              Player da jornada
            </div>
            <Badge>{journey.duracaoEstimadaMinutos} min</Badge>
          </div>

          <div className="space-y-3">
            <h4 className="text-2xl font-semibold">{journey.titulo}</h4>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1">
                <Sparkles className="size-3.5 text-highlight" />
                {journey.categoria}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1">
                <UserRound className="size-3.5 text-highlight" />
                Perfil alvo: {journey.perfilAlvo}
              </span>
            </div>
          </div>

          <audio
            key={journey.id}
            controls
            autoPlay
            preload="metadata"
            src={audioUrl}
            className="w-full"
          />

          <div className="rounded-2xl border border-highlight/20 bg-highlight/10 px-4 py-3 text-sm text-foreground">
            O audio desta jornada foi solicitado ao backend e carregado a partir da URL temporaria retornada.
          </div>
        </div>
      </div>
    </div>
  );
}
