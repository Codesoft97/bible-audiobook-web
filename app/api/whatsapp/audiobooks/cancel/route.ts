import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { WhatsAppCancelResponse } from "@/lib/whatsapp";
import { parseBackendEnvelope } from "@/lib/server-response";
import { buildCancelPayload } from "@/lib/whatsapp-consent";

export async function PATCH(request: NextRequest) {
  const backendPayload = buildCancelPayload();
  const result = await fetchBackendWithAutoRefresh(
    request,
    "/whatsapp/audiobooks/cancel",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
    },
  );
  const envelope = await parseBackendEnvelope<WhatsAppCancelResponse>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
