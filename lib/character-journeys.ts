import { fetchBackend } from "@/lib/backend-api";
import { parseBackendEnvelope } from "@/lib/server-response";

export interface CharacterJourney {
  id: string;
  titulo: string;
  categoria: string;
  perfilAlvo: string;
  duracaoEstimadaMinutos: number;
  isActive: boolean;
  coverImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterJourneyStreamPayload {
  audioUrl: string;
}

export async function fetchCharacterJourneys(token?: string) {
  if (!token) {
    return [] as CharacterJourney[];
  }

  const response = await fetchBackend("/character-journeys", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const envelope = await parseBackendEnvelope<CharacterJourney[]>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return [] as CharacterJourney[];
  }

  return envelope.data.filter((item) => item.isActive);
}
