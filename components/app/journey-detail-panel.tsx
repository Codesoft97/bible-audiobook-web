import Image from "next/image";
import { BookOpenText, ChevronDown, LoaderCircle, PersonSimpleHike } from "@/components/icons";
import type { LucideIcon } from "@/components/icons";

import { CompletionBadge } from "@/components/app/completion-badge";
import { AudioPlayer } from "@/components/app/audio-player";
import { Card } from "@/components/ui/card";
import {
  countBibleReferencePassages,
  parseBibleReferenceGroups,
} from "@/lib/bible-references";
import type { CharacterJourney } from "@/lib/character-journeys";
import type { HistoryContentType } from "@/lib/history";

interface JourneyDetailPanelProps {
  selectedJourney: CharacterJourney | null;
  audioUrl: string;
  loading: boolean;
  error: string;
  selectedHeading?: string;
  emptySelectionTitle?: string;
  emptySelectionDescription?: string;
  progressContentType?: HistoryContentType;
  icon?: LucideIcon;
  completionStatus?: boolean | null;
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
  icon: Icon = PersonSimpleHike,
  completionStatus = null,
}: JourneyDetailPanelProps) {
  if (!selectedJourney) {
    return (
      <Card className="rounded-[22px] border-border/70 bg-background/70 p-4 sm:p-5 md:p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-highlight/14 text-highlight">
              <Icon className="size-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground sm:text-2xl">{emptySelectionTitle}</h3>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{emptySelectionDescription}</p>
        </div>
      </Card>
    );
  }

  const referenceGroups =
    progressContentType === "parable" || progressContentType === "teaching"
      ? parseBibleReferenceGroups(selectedJourney.referencia)
      : [];
  const totalReferencePassages = countBibleReferencePassages(referenceGroups);
  const shouldOpenReferences = totalReferencePassages > 0 && totalReferencePassages <= 4;

  return (
    <Card className="rounded-[22px] border-border/70 bg-background/80 p-4 sm:p-5 md:p-6">
      <div className="flex flex-col gap-5 md:flex-row">
        {selectedJourney.coverImageUrl ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-accent/40 md:w-[250px] md:shrink-0">
            <Image
              src={selectedJourney.coverImageUrl}
              alt={selectedJourney.titulo}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 250px"
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[18px] bg-accent/55 md:w-[250px] md:shrink-0">
            <Icon className="size-8 text-highlight" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-highlight/25 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-highlight">
              <Icon className="size-3.5" />
              {selectedHeading}
            </div>
            <CompletionBadge completed={completionStatus} />
          </div>
          <h3 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {selectedJourney.titulo}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {selectedJourney.categoria}.
          </p>

          {referenceGroups.length > 0 ? (
            <details
              className="group mt-4 overflow-hidden rounded-[18px] border border-border/60 bg-background/55"
              open={shouldOpenReferences}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-highlight">
                    <BookOpenText className="size-3.5" />
                    Referencias biblicas
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {referenceGroups.length} livro(s) citado(s), {totalReferencePassages} trecho(s) para consultar na Biblia.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-medium text-highlight">
                    {shouldOpenReferences ? "Visivel" : "Expandir"}
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </div>
              </summary>

              <div className="border-t border-border/60 px-4 py-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Use estas referencias para localizar na Biblia os textos mencionados neste audio.
                </p>

                <div className="mt-3 grid max-h-56 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                  {referenceGroups.map((group) => (
                    <div
                      key={`${selectedJourney.id}-${group.book}`}
                      className="rounded-2xl border border-border/55 bg-card/80 px-3 py-3"
                    >
                      <p className="text-sm font-semibold text-foreground">{group.book}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {group.passages.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ) : null}
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
            getTrackCompletionStatus={() => completionStatus}
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
