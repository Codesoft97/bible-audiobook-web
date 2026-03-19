import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { WhatsAppBibleBook } from "@/lib/whatsapp";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const result = await fetchBackendWithAutoRefresh(request, "/whatsapp/bible-books", {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<WhatsAppBibleBook[]>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
