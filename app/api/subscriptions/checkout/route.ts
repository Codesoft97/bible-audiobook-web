import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { SubscriptionCheckoutPayload, SubscriptionCheckoutResponse } from "@/lib/subscriptions";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";
import { subscriptionCheckoutSchema } from "@/lib/validation";

async function requestCheckout(
  request: NextRequest,
  payload: SubscriptionCheckoutPayload,
) {
  return fetchBackend("/subscriptions/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBackendAuthHeaders(request),
    },
    body: JSON.stringify(payload),
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = subscriptionCheckoutSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const backendResponse = await requestCheckout(request, validation.data);
  const envelope = await parseBackendEnvelope<SubscriptionCheckoutResponse>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
