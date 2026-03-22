import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { BibleTextReadingState } from "@/lib/bible-text";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const result = await fetchBackendWithAutoRefresh(request, "/bible-text/me/state", {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<BibleTextReadingState>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}

export async function PATCH(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const result = await fetchBackendWithAutoRefresh(request, "/bible-text/me/state", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload ?? {}),
  });
  const envelope = await parseBackendEnvelope<BibleTextReadingState>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
