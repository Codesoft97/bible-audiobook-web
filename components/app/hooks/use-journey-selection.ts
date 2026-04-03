"use client";

import { useState } from "react";

import type { CharacterJourney } from "@/lib/character-journeys";
import { type HistoryContentType } from "@/lib/history";
import { useAudio } from "@/components/providers/audio-context";

interface UseJourneySelectionOptions {
  audioBasePath?: string;
  progressContentType?: HistoryContentType;
  canPlayJourney?: (journey: CharacterJourney) => boolean;
}

function buildJourneyAudioUrl(basePath: string, journeyId: string) {
  return `/api/${basePath}/${encodeURIComponent(journeyId)}/audio`;
}

export function useJourneySelection(
  options: UseJourneySelectionOptions = {},
) {
  const audio = useAudio();
  const audioBasePath = options.audioBasePath?.trim() || "character-journeys";
  const progressContentType = options.progressContentType || "character-journey";

  const [selectedJourney, setSelectedJourney] = useState<CharacterJourney | null>(null);
  const [journeyAudioUrl, setJourneyAudioUrl] = useState("");
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyError, setJourneyError] = useState("");

  function handleSelectJourney(journey: CharacterJourney) {
    setSelectedJourney(journey);
    setJourneyError("");
    setJourneyLoading(false);

    if (options.canPlayJourney && !options.canPlayJourney(journey)) {
      setJourneyAudioUrl("");
      audio.stop();
      return;
    }

    const audioUrl = buildJourneyAudioUrl(audioBasePath, journey.id);
    setJourneyAudioUrl(audioUrl);

    audio.play(
      [
        {
          id: journey.id,
          title: journey.titulo,
          subtitle: journey.categoria,
          src: audioUrl,
          isFree: journey.isFree,
          progressContentType,
          progressContentId: journey.id,
        },
      ],
      0,
    );
  }

  function clearJourney() {
    setSelectedJourney(null);
    setJourneyAudioUrl("");
    setJourneyError("");
  }

  return {
    selectedJourney,
    journeyAudioUrl,
    journeyLoading,
    journeyError,
    handleSelectJourney,
    clearJourney,
  };
}
