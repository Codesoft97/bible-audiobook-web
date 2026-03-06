"use client";

import { useState } from "react";

import type { CharacterJourney } from "@/lib/character-journeys";
import { type HistoryContentType } from "@/lib/history";
import { useAudio } from "@/components/providers/audio-context";

interface UseJourneySelectionOptions {
  audioBasePath?: string;
  progressContentType?: HistoryContentType;
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
    const audioUrl = buildJourneyAudioUrl(audioBasePath, journey.id);
    setJourneyAudioUrl(audioUrl);
    setJourneyError("");
    setJourneyLoading(false);

    audio.play(
      [
        {
          id: journey.id,
          title: journey.titulo,
          subtitle: journey.categoria,
          src: audioUrl,
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
