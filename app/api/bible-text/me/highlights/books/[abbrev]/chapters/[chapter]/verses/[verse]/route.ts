import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { BibleTextHighlight } from "@/lib/bible-text";
import { parseBackendEnvelope } from "@/lib/server-response";

function buildBackendPath(abbrev: string, chapter: string, verse: string) {
  return `/bible-text/me/highlights/books/${encodeURIComponent(abbrev)}/chapters/${encodeURIComponent(chapter)}/verses/${encodeURIComponent(verse)}`;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ abbrev: string; chapter: string; verse: string }> },
) {
  const { abbrev, chapter, verse } = await context.params;
  const result = await fetchBackendWithAutoRefresh(
    request,
    buildBackendPath(abbrev, chapter, verse),
    {
      method: "PUT",
    },
  );
  const envelope = await parseBackendEnvelope<BibleTextHighlight>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ abbrev: string; chapter: string; verse: string }> },
) {
  const { abbrev, chapter, verse } = await context.params;
  const result = await fetchBackendWithAutoRefresh(
    request,
    buildBackendPath(abbrev, chapter, verse),
    {
      method: "DELETE",
    },
  );

  if (result.backendResponse.status === 204) {
    const response = new NextResponse(null, { status: 204 });
    return applyBackendProxyAuth(response, result);
  }

  const envelope = await parseBackendEnvelope<null>(result.backendResponse);
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
