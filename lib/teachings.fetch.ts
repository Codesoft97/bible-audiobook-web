import "server-only";

import { fetchBackend } from "@/lib/backend-api";
import type { CharacterJourney } from "@/lib/character-journeys";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function fetchTeachings(options: {
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

  const response = await fetchBackend("/teachings", {
    method: "GET",
    headers,
  });

  const envelope = await parseBackendEnvelope<CharacterJourney[]>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return [] as CharacterJourney[];
  }

  return envelope.data;
}
