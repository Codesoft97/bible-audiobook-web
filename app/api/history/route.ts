import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { ListeningHistoryListPayload } from "@/lib/history";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search ?? "";

  const backendResponse = await fetchBackend(`/history${search}`, {
    method: "GET",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  const envelope = await parseBackendEnvelope<ListeningHistoryListPayload>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
