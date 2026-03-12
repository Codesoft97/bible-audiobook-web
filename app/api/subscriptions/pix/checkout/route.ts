import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
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

  const backendResponse = await fetchBackend("/subscriptions/pix/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBackendAuthHeaders(request),
    },
    body: JSON.stringify(validatedPayload),
  });

  const envelope = await parseBackendEnvelope<SubscriptionPixCheckoutResponse>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
