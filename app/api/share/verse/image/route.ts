import { NextRequest, NextResponse } from "next/server";

import { fetchBackend } from "@/lib/backend-api";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const backendResponse = await fetchBackend(
    `/share/verse/image${request.nextUrl.search}`,
    {
      method: "GET",
      headers: {
        Accept: "image/png,image/*,*/*",
      },
    },
  );

  if (backendResponse.ok) {
    const response = new NextResponse(backendResponse.body, {
      status: backendResponse.status,
    });
    const contentType = backendResponse.headers.get("content-type");
    const cacheControl = backendResponse.headers.get("cache-control");
    const contentLength = backendResponse.headers.get("content-length");
    const contentDisposition = backendResponse.headers.get("content-disposition");

    response.headers.set("Content-Type", contentType ?? "image/png");

    if (cacheControl) {
      response.headers.set("Cache-Control", cacheControl);
    }

    if (contentLength) {
      response.headers.set("Content-Length", contentLength);
    }

    if (contentDisposition) {
      response.headers.set("Content-Disposition", contentDisposition);
    }

    return response;
  }

  const envelope = await parseBackendEnvelope<null>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
