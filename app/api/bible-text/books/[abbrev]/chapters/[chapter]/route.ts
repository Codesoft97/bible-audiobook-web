import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { BibleTextChapter } from "@/lib/bible-text";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ abbrev: string; chapter: string }> },
) {
  const { abbrev, chapter } = await context.params;
  const result = await fetchBackendWithAutoRefresh(
    request,
    `/bible-text/books/${encodeURIComponent(abbrev)}/chapters/${encodeURIComponent(chapter)}`,
    {
      method: "GET",
    },
  );
  const envelope = await parseBackendEnvelope<BibleTextChapter>(result.backendResponse);
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
