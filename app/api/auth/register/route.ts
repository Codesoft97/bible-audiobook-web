import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, resolveBackendToken } from "@/lib/backend-api";
import { fetchCurrentFamily } from "@/lib/family";
import { parseBackendEnvelope, jsonError, mirrorBackendCookie, persistSession } from "@/lib/server-response";
import type { AuthResponse } from "@/lib/auth/types";
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

  const registerEnvelope = await parseBackendEnvelope<{
    family: AuthResponse["family"];
    profile: AuthResponse["profiles"][number];
  }>(registerResponse);

  if (!registerResponse.ok || registerEnvelope?.status !== "success") {
    return NextResponse.json(registerEnvelope, {
      status: registerResponse.status || 400,
    });
  }

  const loginResponse = await fetchBackend("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: validation.data.email,
      password: validation.data.password,
    }),
  });

  const loginEnvelope = await parseBackendEnvelope<AuthResponse>(loginResponse);

  if (!loginResponse.ok || loginEnvelope?.status !== "success" || !loginEnvelope.data) {
    return jsonError(
      loginEnvelope?.message ?? "Cadastro concluido, mas o login automatico falhou.",
      loginResponse.status || 502,
    );
  }

  const token = resolveBackendToken(loginResponse, loginEnvelope.data.token);

  if (!token) {
    return jsonError("Cadastro concluido, mas nenhum token valido foi recebido.", 502);
  }

  const family = (await fetchCurrentFamily({ token })) ?? loginEnvelope.data.family;

  const response = NextResponse.json({
    status: "success",
    data: {
      family,
      profiles: loginEnvelope.data.profiles,
    },
  });

  mirrorBackendCookie(response, loginResponse, loginEnvelope.data.token);
  persistSession(response, {
    family,
    profiles: loginEnvelope.data.profiles,
    selectedProfile: null,
  });
  return response;
}
