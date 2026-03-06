import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { WhatsAppCancelResponse } from "@/lib/whatsapp";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function PATCH(request: NextRequest) {
  const backendResponse = await fetchBackend("/whatsapp/promises/cancel", {
    method: "PATCH",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  const envelope = await parseBackendEnvelope<WhatsAppCancelResponse>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
