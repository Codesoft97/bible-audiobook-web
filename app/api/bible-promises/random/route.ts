import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { BiblePromise } from "@/lib/bible-promises";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const backendResponse = await fetchBackend("/bible-promises/random", {
    method: "GET",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  const envelope = await parseBackendEnvelope<BiblePromise>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
