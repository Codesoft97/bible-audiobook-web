import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import type { Audiobook } from "@/lib/audiobooks";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const backendResponse = await fetchBackend("/audiobooks", {
    method: "GET",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  const envelope = await parseBackendEnvelope<Audiobook[]>(backendResponse);

  if (!backendResponse.ok || envelope.status !== "success" || !envelope.data) {
    return NextResponse.json(envelope, {
      status: backendResponse.status || 400,
    });
  }

  const selectedBook = request.nextUrl.searchParams.get("book")?.trim().toLowerCase();
  const filteredData = selectedBook
    ? envelope.data.filter((item) => item.book.toLowerCase() === selectedBook)
    : envelope.data;

  return NextResponse.json({
    status: "success",
    data: filteredData,
  });
}
