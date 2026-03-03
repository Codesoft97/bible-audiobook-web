import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
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
    return jsonError("Rota de historico invalida.", 404);
  }

  const backendResponse = await fetchBackend(backendPath, {
    method: "GET",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  const envelope = await parseBackendEnvelope<PlaybackProgressSnapshot | null>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ segments: string[] }> },
) {
  const { segments } = await context.params;

  if (segments.length !== 1 || !segments[0]) {
    return jsonError("Rota de historico invalida.", 404);
  }

  const backendResponse = await fetchBackend(`/history/${encodeURIComponent(segments[0])}`, {
    method: "DELETE",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  if (backendResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const envelope = await parseBackendEnvelope<null>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
