import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { WhatsAppCancelResponse } from "@/lib/whatsapp";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function PATCH(request: NextRequest) {
  const result = await fetchBackendWithAutoRefresh(
    request,
    "/whatsapp/audiobooks/cancel",
    {
      method: "PATCH",
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
