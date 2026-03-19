import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { SubscriptionPlansResponse } from "@/lib/subscriptions";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const result = await fetchBackendWithAutoRefresh(request, "/subscriptions/plans", {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<SubscriptionPlansResponse>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
