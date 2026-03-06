import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";
import type { WhatsAppPromiseSubscription } from "@/lib/whatsapp";
import { whatsappPromiseSubscribeSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const backendResponse = await fetchBackend("/whatsapp/promises", {
    method: "GET",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  const envelope = await parseBackendEnvelope<WhatsAppPromiseSubscription[]>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = whatsappPromiseSubscribeSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const backendResponse = await fetchBackend("/whatsapp/promises", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBackendAuthHeaders(request),
    },
    body: JSON.stringify(validation.data),
  });

  const envelope = await parseBackendEnvelope<WhatsAppPromiseSubscription>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
