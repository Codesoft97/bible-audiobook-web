import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, resolveBackendTokens } from "@/lib/backend-api";
import type { AuthResponse } from "@/lib/auth/types";
import { fetchCurrentFamily } from "@/lib/family";
import {
  parseBackendEnvelope,
  jsonError,
  mirrorBackendAuthCookies,
  persistSession,
} from "@/lib/server-response";
import { registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = registerSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const registerResponse = await fetchBackend("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.data),
  });

  const registerEnvelope = await parseBackendEnvelope<AuthResponse>(registerResponse);

  if (!registerResponse.ok || registerEnvelope?.status !== "success" || !registerEnvelope.data) {
    return NextResponse.json(registerEnvelope, {
      status: registerResponse.status || 400,
    });
  }

  const { token } = resolveBackendTokens(registerResponse, registerEnvelope.data);

  if (!token) {
    return jsonError("Cadastro concluido, mas nenhum token valido foi recebido.", 502);
  }

  const family = (await fetchCurrentFamily({ token })) ?? registerEnvelope.data.family;

  const response = NextResponse.json({
    status: "success",
    data: {
      family,
      profiles: registerEnvelope.data.profiles,
    },
  });

  mirrorBackendAuthCookies(response, registerResponse, registerEnvelope.data);
  persistSession(response, {
    family,
    profiles: registerEnvelope.data.profiles,
    selectedProfile: null,
  });
  return response;
}
