import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";
import type { WhatsAppPromiseSubscription } from "@/lib/whatsapp";
import { whatsappPromiseSubscribeSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const result = await fetchBackendWithAutoRefresh(request, "/whatsapp/promises", {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<WhatsAppPromiseSubscription[]>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = whatsappPromiseSubscribeSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const result = await fetchBackendWithAutoRefresh(request, "/whatsapp/promises", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.data),
  });
  const envelope = await parseBackendEnvelope<WhatsAppPromiseSubscription>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
