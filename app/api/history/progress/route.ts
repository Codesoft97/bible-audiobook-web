import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { PlaybackProgressPayload, PlaybackProgressSnapshot } from "@/lib/history";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";

export async function PUT(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as PlaybackProgressPayload | null;

  if (!payload) {
    return jsonError("Payload invalido.", 400);
  }

  const result = await fetchBackendWithAutoRefresh(request, "/history/progress", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const envelope = await parseBackendEnvelope<PlaybackProgressSnapshot>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
