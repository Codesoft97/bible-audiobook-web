import "server-only";

import { fetchBackend } from "@/lib/backend-api";
import type { Audiobook } from "@/lib/audiobooks";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function fetchAudiobooks(
  options: { token?: string; book?: string; cookieHeader?: string } = {},
) {
  const headers: Record<string, string> = {};

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.cookieHeader) {
    headers.cookie = options.cookieHeader;
  }

  const response = await fetchBackend("/audiobooks", {
    method: "GET",
    headers,
  });

  const envelope = await parseBackendEnvelope<Audiobook[]>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return [] as Audiobook[];
  }

  const items = envelope.data;

  if (!options.book) {
    return items;
  }

  return items.filter((item) => item.book.toLowerCase() === options.book?.toLowerCase());
}
