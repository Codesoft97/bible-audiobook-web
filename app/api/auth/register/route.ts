import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, resolveBackendTokens } from "@/lib/backend-api";
import type { AuthResponse } from "@/lib/auth/types";
import { fetchCurrentFamily } from "@/lib/family";
import { fetchCurrentProfiles } from "@/lib/profiles";
import { persistSession } from "@/lib/session-response";
import {
  parseBackendEnvelope,
  jsonError,
  mirrorBackendAuthCookies,
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

  const { token } = resolveBackendTokens(registerResponse);

  if (!token) {
    return jsonError("Cadastro concluido, mas nenhum token valido foi recebido.", 502);
  }

  const [familyResult, profilesResult] = await Promise.all([
    fetchCurrentFamily({ token }),
    fetchCurrentProfiles({ token }),
  ]);
  const family = familyResult ?? registerEnvelope.data.family;
  const profiles =
    profilesResult ??
    (Array.isArray(registerEnvelope.data.profiles) ? registerEnvelope.data.profiles : []);

  const response = NextResponse.json({
    status: "success",
    data: {
      family,
      profiles,
    },
  });

  mirrorBackendAuthCookies(response, registerResponse);
  persistSession(response, {
    family,
    profiles,
    selectedProfile: null,
  });
  return response;
}
