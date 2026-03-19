import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { PlaybackProgressSnapshot } from "@/lib/history";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";

function buildProgressPath(segments: string[]) {
  if (segments.length !== 3) {
    return null;
  }

  const [contentType, contentId, suffix] = segments;

  if (!contentType || !contentId || suffix !== "progress") {
    return null;
  }

  return `/history/${encodeURIComponent(contentType)}/${encodeURIComponent(contentId)}/progress`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ segments: string[] }> },
) {
  const { segments } = await context.params;
  const backendPath = buildProgressPath(segments);

  if (!backendPath) {
    return jsonError("Rota de histórico invalida.", 404);
  }

  const result = await fetchBackendWithAutoRefresh(request, backendPath, {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<PlaybackProgressSnapshot | null>(
    result.backendResponse,
  );
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ segments: string[] }> },
) {
  const { segments } = await context.params;

  if (segments.length !== 1 || !segments[0]) {
    return jsonError("Rota de histórico invalida.", 404);
  }

  const result = await fetchBackendWithAutoRefresh(
    request,
    `/history/${encodeURIComponent(segments[0])}`,
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
