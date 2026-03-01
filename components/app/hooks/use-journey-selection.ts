"use client";

import { useState } from "react";

import type { CharacterJourney, CharacterJourneyStreamPayload } from "@/lib/character-journeys";
import type { ApiEnvelope } from "@/lib/auth/types";

export function useJourneySelection() {
  const [selectedJourney, setSelectedJourney] = useState<CharacterJourney | null>(null);
  const [journeyAudioUrl, setJourneyAudioUrl] = useState("");
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyError, setJourneyError] = useState("");

  async function handleSelectJourney(journey: CharacterJourney) {
    setSelectedJourney(journey);
    setJourneyAudioUrl("");
    setJourneyError("");
    setJourneyLoading(true);

    try {
      const response = await fetch(
        `/api/character-journeys/${encodeURIComponent(journey.id)}/stream`,
      );
      const data = (await response.json()) as ApiEnvelope<CharacterJourneyStreamPayload>;

      if (!response.ok || data.status !== "success" || !data.data?.audioUrl) {
        setJourneyError(data.message ?? "Nao foi possivel carregar o audio desta jornada.");
        return;
      }

      setJourneyAudioUrl(data.data.audioUrl);
    } catch {
      setJourneyError("Nao foi possivel conectar ao servidor.");
    } finally {
      setJourneyLoading(false);
    }
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
