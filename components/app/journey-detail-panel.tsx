import { LoaderCircle, UserRound } from "lucide-react";

import type { CharacterJourney } from "@/lib/character-journeys";
import { AudioPlayer } from "@/components/app/audio-player";
import { Card } from "@/components/ui/card";

interface JourneyDetailPanelProps {
  selectedJourney: CharacterJourney | null;
  audioUrl: string;
  loading: boolean;
  error: string;
}

export function JourneyDetailPanel({
  selectedJourney,
  audioUrl,
  loading,
  error,
}: JourneyDetailPanelProps) {
  if (!selectedJourney) {
    return (
      <Card className="rounded-[32px] p-7">
        <div className="space-y-4">
          <div className="flex size-14 items-center justify-center rounded-[24px] bg-highlight/12 text-highlight">
            <UserRound className="size-7" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Jornadas de personagens</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Escolha uma jornada para buscar no backend a URL temporaria do audiobook.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[32px] p-7">
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-highlight/25 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-highlight">
            <UserRound className="size-3.5" />
            {selectedJourney.titulo}
          </div>
          <h3 className="text-2xl font-semibold">Jornada selecionada</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {selectedJourney.categoria} para o perfil {selectedJourney.perfilAlvo}.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Carregando audio da jornada...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : audioUrl ? (
          <AudioPlayer
            title={selectedJourney.titulo}
            description={`${selectedJourney.categoria} · Perfil ${selectedJourney.perfilAlvo}`}
            badgeLabel={`${selectedJourney.duracaoEstimadaMinutos} min`}
            tracks={[
              {
                id: selectedJourney.id,
                title: selectedJourney.titulo,
                src: audioUrl,
              },
            ]}
          />
        ) : (
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            Selecione uma jornada para carregar o audio no player.
          </div>
        )}
      </div>
    </Card>
  );
}
