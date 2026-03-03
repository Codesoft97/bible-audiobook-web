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

export async function fetchCharacterJourneys(options: {
  token?: string;
  cookieHeader?: string;
} = {}) {
  const headers: Record<string, string> = {};

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.cookieHeader) {
    headers.cookie = options.cookieHeader;
  }

  const response = await fetchBackend("/character-journeys", {
    method: "GET",
    headers,
  });

  const envelope = await parseBackendEnvelope<CharacterJourney[]>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return [] as CharacterJourney[];
  }

  return envelope.data.filter((item) => item.isActive);
}
