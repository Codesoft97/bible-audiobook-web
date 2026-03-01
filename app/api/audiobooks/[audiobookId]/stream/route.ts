import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders, parseJsonSafe } from "@/lib/backend-api";
import { env } from "@/lib/env";

const AUDIO_ENDPOINTS = [
  (audiobookId: string) => `/audiobooks/${audiobookId}/stream`,
  (audiobookId: string) => `/audiobooks/${audiobookId}/audio`,
  (audiobookId: string) => `/audiobooks/${audiobookId}`,
];

const PROXIED_HEADERS = [
  "accept-ranges",
  "cache-control",
  "content-disposition",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
] as const;

function isAudioResponse(response: Response) {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  return contentType.startsWith("audio/") || contentType.includes("application/octet-stream");
}

function resolveAudioUrl(payload: unknown): string | null {
  if (typeof payload === "string" && payload.length > 0) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  for (const key of ["audioUrl", "streamUrl", "fileUrl", "url", "src"]) {
    const value = record[key];

    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return resolveAudioUrl(record.data);
}

function buildAudioProxyResponse(response: Response) {
  const headers = new Headers();

  for (const headerName of PROXIED_HEADERS) {
    const value = response.headers.get(headerName);

    if (value) {
      headers.set(headerName, value);
    }
  }

  if (!headers.has("cache-control")) {
    headers.set("cache-control", "no-store");
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "audio/mpeg");
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

function readErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const message = (payload as Record<string, unknown>).message;
  return typeof message === "string" ? message : null;
}

function resolveAbsoluteAudioUrl(audioUrl: string) {
  return new URL(audioUrl, env.BACKEND_API_URL).toString();
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ audiobookId: string }> },
) {
  const { audiobookId } = await context.params;
  const encodedId = encodeURIComponent(audiobookId);
  const rangeHeader = request.headers.get("range");
  let lastStatus = 404;
  let lastMessage = "Nao foi possivel carregar o audio deste audiobook.";

  for (const buildEndpoint of AUDIO_ENDPOINTS) {
    const backendResponse = await fetchBackend(buildEndpoint(encodedId), {
      method: "GET",
      headers: {
        Accept: "*/*",
        ...getBackendAuthHeaders(request),
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      },
    });

    lastStatus = backendResponse.status || lastStatus;

    if (isAudioResponse(backendResponse)) {
      return buildAudioProxyResponse(backendResponse);
    }

    const payload = await parseJsonSafe<unknown>(backendResponse);
    const directAudioUrl = resolveAudioUrl(payload);
    const errorMessage = readErrorMessage(payload);

    if (errorMessage) {
      lastMessage = errorMessage;
    }

    if (directAudioUrl) {
      const audioResponse = await fetch(resolveAbsoluteAudioUrl(directAudioUrl), {
        headers: {
          Accept: "*/*",
          ...(rangeHeader ? { Range: rangeHeader } : {}),
        },
      });

      if (audioResponse.ok || audioResponse.status === 206) {
        return buildAudioProxyResponse(audioResponse);
      }

      lastStatus = audioResponse.status || lastStatus;
      lastMessage = "Nao foi possivel carregar o audio a partir da URL temporaria.";
    }

    if (backendResponse.status === 401 || backendResponse.status === 403) {
      break;
    }
  }

  return NextResponse.json(
    {
      status: "error",
      message: lastMessage,
    },
    {
      status: lastStatus >= 400 ? lastStatus : 404,
    },
  );
}
