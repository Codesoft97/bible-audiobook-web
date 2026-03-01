import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { CharacterJourneyStreamPayload } from "@/lib/character-journeys";
import { parseBackendEnvelope } from "@/lib/server-response";

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

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
