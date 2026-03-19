import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type {
  SubscriptionPixCheckoutPayload,
  SubscriptionPixCheckoutResponse,
} from "@/lib/subscriptions";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";
import { subscriptionPixCheckoutSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = subscriptionPixCheckoutSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const validatedPayload: SubscriptionPixCheckoutPayload = validation.data;

  const result = await fetchBackendWithAutoRefresh(
    request,
    "/subscriptions/pix/checkout",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedPayload),
    },
  );
  const envelope = await parseBackendEnvelope<SubscriptionPixCheckoutResponse>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
