import { LoaderCircle, UserRound } from "lucide-react";

import type { CharacterJourney } from "@/lib/character-journeys";
import type { HistoryContentType } from "@/lib/history";
import { AudioPlayer } from "@/components/app/audio-player";
import { Card } from "@/components/ui/card";

interface JourneyDetailPanelProps {
  selectedJourney: CharacterJourney | null;
  audioUrl: string;
  loading: boolean;
  error: string;
  selectedHeading?: string;
  emptySelectionTitle?: string;
  emptySelectionDescription?: string;
  progressContentType?: HistoryContentType;
}

export function JourneyDetailPanel({
  selectedJourney,
  audioUrl,
  loading,
  error,
  selectedHeading = "Jornada selecionada",
  emptySelectionTitle = "Selecione uma jornada",
  emptySelectionDescription = "Escolha um personagem para carregar o audio da jornada.",
  progressContentType = "character-journey",
}: JourneyDetailPanelProps) {
  if (!selectedJourney) {
    return (
      <Card className="rounded-[22px] border-border/70 bg-background/70 p-5 md:p-6">
        <div className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-highlight/14 text-highlight">
            <UserRound className="size-6" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">{emptySelectionTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {emptySelectionDescription}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[22px] border-border/70 bg-background/80 p-5 md:p-6">
      <div className="flex flex-col gap-5 md:flex-row">
        {selectedJourney.coverImageUrl ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-accent/40 md:w-[250px] md:shrink-0">
            <img
              src={selectedJourney.coverImageUrl}
              alt={selectedJourney.titulo}
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[18px] bg-accent/55 md:w-[250px] md:shrink-0">
            <UserRound className="size-8 text-highlight" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-highlight/25 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-highlight">
            <UserRound className="size-3.5" />
            {selectedHeading}
          </div>
          <h3 className="text-3xl font-semibold leading-tight text-foreground">
            {selectedJourney.titulo}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {selectedJourney.categoria} para o perfil {selectedJourney.perfilAlvo}.
          </p>
        </div>
      </div>

      <div className="mt-5">
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
            description={`${selectedJourney.categoria} - Perfil ${selectedJourney.perfilAlvo}`}
            badgeLabel={`${selectedJourney.duracaoEstimadaMinutos} min`}
            tracks={[
              {
                id: selectedJourney.id,
                title: selectedJourney.titulo,
                src: audioUrl,
                progressContentType,
                progressContentId: selectedJourney.id,
              },
            ]}
          />
        ) : (
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            Nenhum audio foi carregado para a jornada selecionada.
          </div>
        )}
      </div>
    </Card>
  );
}
