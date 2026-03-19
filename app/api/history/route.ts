import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { ListeningHistoryListPayload } from "@/lib/history";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search ?? "";

  const result = await fetchBackendWithAutoRefresh(request, `/history${search}`, {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<ListeningHistoryListPayload>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
