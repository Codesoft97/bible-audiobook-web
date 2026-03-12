import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { SubscriptionPortalResponse } from "@/lib/subscriptions";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function POST(request: NextRequest) {
  const backendResponse = await fetchBackend("/subscriptions/portal", {
    method: "POST",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  const envelope = await parseBackendEnvelope<SubscriptionPortalResponse>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
