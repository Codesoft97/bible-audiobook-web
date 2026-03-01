import { NextRequest, NextResponse } from "next/server";

import { fetchBackend } from "@/lib/backend-api";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";
import { verifyResetCodeSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = verifyResetCodeSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const backendResponse = await fetchBackend("/auth/verify-reset-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.data),
  });

  const envelope = await parseBackendEnvelope<{ token: string }>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 200,
  });
}

