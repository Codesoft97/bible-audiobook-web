import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { fetchBackend, resolveBackendToken } from "@/lib/backend-api";
import type { AuthResponse } from "@/lib/auth/types";
import { fetchCurrentFamily } from "@/lib/family";
import { jsonError, mirrorBackendCookie, parseBackendEnvelope, persistSession } from "@/lib/server-response";

const schema = z.object({
  idToken: z.string().min(1, "Token do Google ausente."),
});

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = schema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const backendResponse = await fetchBackend("/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.data),
  });

  const envelope = await parseBackendEnvelope<AuthResponse>(backendResponse);

  if (!backendResponse.ok || envelope?.status !== "success" || !envelope.data) {
    return NextResponse.json(envelope, {
      status: backendResponse.status || 400,
    });
  }

  const token = resolveBackendToken(backendResponse, envelope.data.token);

  if (!token) {
    return jsonError("Autenticacao Google concluida sem token valido.", 502);
  }

  const family = (await fetchCurrentFamily({ token })) ?? envelope.data.family;

  const response = NextResponse.json({
    status: "success",
    data: {
      family,
      profiles: envelope.data.profiles,
      isNewFamily: envelope.data.isNewFamily ?? false,
    },
  });

  mirrorBackendCookie(response, backendResponse, envelope.data.token);
  persistSession(response, {
    family,
    profiles: envelope.data.profiles,
    selectedProfile: null,
  });
  return response;
}
