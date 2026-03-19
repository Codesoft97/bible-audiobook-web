import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { BiblePromiseStreamPayload } from "@/lib/bible-promises";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ promiseId: string }> },
) {
  const { promiseId } = await context.params;

  const result = await fetchBackendWithAutoRefresh(
    request,
    `/bible-promises/${encodeURIComponent(promiseId)}/stream`,
    {
      method: "GET",
    },
  );
  const envelope = await parseBackendEnvelope<BiblePromiseStreamPayload>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
