import "server-only";

import { fetchBackend } from "@/lib/backend-api";
import type {
  BibleTextBook,
  BibleTextChapter,
  BibleTextHighlight,
  BibleTextReadingState,
  BibleTextReadingStateUpdateInput,
} from "@/lib/bible-text";
import { parseBackendEnvelope } from "@/lib/server-response";

interface BibleTextRequestOptions {
  token?: string;
  cookieHeader?: string;
}

function buildRequestHeaders(options: BibleTextRequestOptions) {
  const headers: Record<string, string> = {};

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.cookieHeader) {
    headers.cookie = options.cookieHeader;
  }

  return headers;
}

export async function fetchBibleTextBooks(options: BibleTextRequestOptions = {}) {
  const response = await fetchBackend("/bible-text/books", {
    method: "GET",
    headers: buildRequestHeaders(options),
  });

  const envelope = await parseBackendEnvelope<BibleTextBook[]>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return [] as BibleTextBook[];
  }

  return envelope.data;
}

export async function fetchBibleTextChapter(
  abbrev: string,
  chapter: number,
  options: BibleTextRequestOptions = {},
) {
  const response = await fetchBackend(
    `/bible-text/books/${encodeURIComponent(abbrev)}/chapters/${chapter}`,
    {
      method: "GET",
      headers: buildRequestHeaders(options),
    },
  );

  const envelope = await parseBackendEnvelope<BibleTextChapter>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return null;
  }

  return envelope.data;
}

export async function fetchBibleTextReadingState(
  options: BibleTextRequestOptions = {},
) {
  const response = await fetchBackend("/bible-text/me/state", {
    method: "GET",
    headers: buildRequestHeaders(options),
  });

  const envelope = await parseBackendEnvelope<BibleTextReadingState>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return null;
  }

  return envelope.data;
}

export async function updateBibleTextReadingState(
  payload: BibleTextReadingStateUpdateInput,
  options: BibleTextRequestOptions = {},
) {
  const response = await fetchBackend("/bible-text/me/state", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...buildRequestHeaders(options),
    },
    body: JSON.stringify(payload),
  });

  const envelope = await parseBackendEnvelope<BibleTextReadingState>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return null;
  }

  return envelope.data;
}

export async function fetchBibleTextHighlights(
  options: BibleTextRequestOptions & { abbrev?: string; chapter?: number } = {},
) {
  const searchParams = new URLSearchParams();

  if (options.abbrev) {
    searchParams.set("abbrev", options.abbrev);
  }

  if (typeof options.chapter === "number") {
    searchParams.set("chapter", String(options.chapter));
  }

  const search = searchParams.toString();
  const response = await fetchBackend(
    `/bible-text/me/highlights${search ? `?${search}` : ""}`,
    {
      method: "GET",
      headers: buildRequestHeaders(options),
    },
  );

  const envelope = await parseBackendEnvelope<BibleTextHighlight[]>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return [] as BibleTextHighlight[];
  }

  return envelope.data;
}

export async function highlightBibleTextVerse(
  abbrev: string,
  chapter: number,
  verse: number,
  options: BibleTextRequestOptions = {},
) {
  const response = await fetchBackend(
    `/bible-text/me/highlights/books/${encodeURIComponent(abbrev)}/chapters/${chapter}/verses/${verse}`,
    {
      method: "PUT",
      headers: buildRequestHeaders(options),
    },
  );

  const envelope = await parseBackendEnvelope<BibleTextHighlight>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return null;
  }

  return envelope.data;
}

export async function removeBibleTextHighlight(
  abbrev: string,
  chapter: number,
  verse: number,
  options: BibleTextRequestOptions = {},
) {
  const response = await fetchBackend(
    `/bible-text/me/highlights/books/${encodeURIComponent(abbrev)}/chapters/${chapter}/verses/${verse}`,
    {
      method: "DELETE",
      headers: buildRequestHeaders(options),
    },
  );

  return response.status === 204;
}
