import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { PlaybackProgressPayload, PlaybackProgressSnapshot } from "@/lib/history";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";

export async function PUT(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as PlaybackProgressPayload | null;

  if (!payload) {
    return jsonError("Payload invalido.", 400);
  }

  const backendResponse = await fetchBackend("/history/progress", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getBackendAuthHeaders(request),
    },
    body: JSON.stringify(payload),
  });

  const envelope = await parseBackendEnvelope<PlaybackProgressSnapshot>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
