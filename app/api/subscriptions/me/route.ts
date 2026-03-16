import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { SubscriptionStatusResponse } from "@/lib/subscriptions";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const backendResponse = await fetchBackend("/subscriptions/me", {
    method: "GET",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  const envelope = await parseBackendEnvelope<SubscriptionStatusResponse>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
