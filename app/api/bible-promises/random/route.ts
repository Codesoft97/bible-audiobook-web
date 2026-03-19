import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { BiblePromise } from "@/lib/bible-promises";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const result = await fetchBackendWithAutoRefresh(request, "/bible-promises/random", {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<BiblePromise>(result.backendResponse);
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
