import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { BibleTextHighlight } from "@/lib/bible-text";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.toString();
  const result = await fetchBackendWithAutoRefresh(
    request,
    `/bible-text/me/highlights${search ? `?${search}` : ""}`,
    {
      method: "GET",
    },
  );
  const envelope = await parseBackendEnvelope<BibleTextHighlight[]>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
