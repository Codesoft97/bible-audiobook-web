import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { BiblePromiseStreamPayload } from "@/lib/bible-promises";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ promiseId: string }> },
) {
  const { promiseId } = await context.params;

  const backendResponse = await fetchBackend(
    `/bible-promises/${encodeURIComponent(promiseId)}/stream`,
    {
      method: "GET",
      headers: {
        ...getBackendAuthHeaders(request),
      },
    },
  );

  const envelope = await parseBackendEnvelope<BiblePromiseStreamPayload>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
