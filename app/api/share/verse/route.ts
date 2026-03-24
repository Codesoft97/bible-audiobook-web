import { NextRequest, NextResponse } from "next/server";

import { fetchBackend } from "@/lib/backend-api";
import type { BibleVerseShareData } from "@/lib/verse-share";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const backendResponse = await fetchBackend(`/share/verse${request.nextUrl.search}`, {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<BibleVerseShareData>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
