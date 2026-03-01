import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import { clearAuthState, parseBackendEnvelope } from "@/lib/server-response";

export async function POST(request: NextRequest) {
  const backendResponse = await fetchBackend("/auth/logout", {
    method: "POST",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  const envelope =
    (await parseBackendEnvelope<{ message: string }>(backendResponse)) ?? {
      status: "success" as const,
      data: { message: "Logged out successfully" },
    };

  const response = NextResponse.json(envelope, {
    status: backendResponse.ok ? 200 : backendResponse.status || 200,
  });

  clearAuthState(response);
  return response;
}
