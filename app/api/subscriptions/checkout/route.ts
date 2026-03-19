import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { SubscriptionCheckoutPayload, SubscriptionCheckoutResponse } from "@/lib/subscriptions";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";
import { subscriptionCheckoutSchema } from "@/lib/validation";

async function requestCheckout(
  request: NextRequest,
  payload: SubscriptionCheckoutPayload,
) {
  return fetchBackendWithAutoRefresh(request, "/subscriptions/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

  const result = await requestCheckout(request, validation.data);
  const envelope = await parseBackendEnvelope<SubscriptionCheckoutResponse>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
