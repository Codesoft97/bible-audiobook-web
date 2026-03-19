import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { SubscriptionPortalResponse } from "@/lib/subscriptions";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function POST(request: NextRequest) {
  const result = await fetchBackendWithAutoRefresh(request, "/subscriptions/portal", {
    method: "POST",
  });
  const envelope = await parseBackendEnvelope<SubscriptionPortalResponse>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
