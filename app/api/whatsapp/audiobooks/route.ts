import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";
import { buildAudiobookSubscribePayload } from "@/lib/whatsapp-consent";
import type { WhatsAppAudiobookSubscription } from "@/lib/whatsapp";
import { whatsappAudiobookSubscribeSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const result = await fetchBackendWithAutoRefresh(request, "/whatsapp/audiobooks", {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<WhatsAppAudiobookSubscription[]>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = whatsappAudiobookSubscribeSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const backendPayload = buildAudiobookSubscribePayload(
    validation.data,
    request.headers,
  );

  const result = await fetchBackendWithAutoRefresh(request, "/whatsapp/audiobooks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(backendPayload),
  });
  const envelope = await parseBackendEnvelope<WhatsAppAudiobookSubscription>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
