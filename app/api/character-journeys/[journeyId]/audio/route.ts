import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { CharacterJourneyStreamPayload } from "@/lib/character-journeys";
import { env } from "@/lib/env";
import { parseBackendEnvelope } from "@/lib/server-response";

function resolveAbsoluteAudioUrl(audioUrl: string) {
  return new URL(audioUrl, env.BACKEND_API_URL).toString();
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ journeyId: string }> },
) {
  const { journeyId } = await context.params;

  const backendResponse = await fetchBackend(
    `/character-journeys/${encodeURIComponent(journeyId)}/stream`,
    {
      method: "GET",
      headers: {
        ...getBackendAuthHeaders(request),
      },
    },
  );

  const envelope = await parseBackendEnvelope<CharacterJourneyStreamPayload>(backendResponse);

  if (!backendResponse.ok || envelope.status !== "success" || !envelope.data?.audioUrl) {
    return NextResponse.json(
      {
        status: "error",
        message: envelope.message ?? "Nao foi possivel carregar o audio desta jornada.",
      },
      {
        status: backendResponse.status || 400,
      },
    );
  }

  const rangeHeader = request.headers.get("range");
  const audioResponse = await fetch(resolveAbsoluteAudioUrl(envelope.data.audioUrl), {
    headers: {
      Accept: "*/*",
      ...(rangeHeader ? { Range: rangeHeader } : {}),
    },
  });

  if (!audioResponse.ok && audioResponse.status !== 206) {
    return NextResponse.json(
      {
        status: "error",
        message: "Nao foi possivel carregar o audio a partir da URL temporaria.",
      },
      {
        status: audioResponse.status || 502,
      },
    );
  }

  const headers = new Headers();

  for (const name of ["accept-ranges", "cache-control", "content-disposition", "content-length", "content-range", "content-type", "etag", "last-modified"]) {
    const value = audioResponse.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "audio/mpeg");
  }

  if (!headers.has("cache-control")) {
    headers.set("cache-control", "no-store");
  }

  return new Response(audioResponse.body, {
    status: audioResponse.status,
    headers,
  });
}
