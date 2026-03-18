import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, resolveBackendTokens } from "@/lib/backend-api";
import type { AuthResponse } from "@/lib/auth/types";
import { fetchCurrentFamily } from "@/lib/family";
import { fetchCurrentProfiles } from "@/lib/profiles";
import { loginSchema } from "@/lib/validation";
import {
  jsonError,
  mirrorBackendAuthCookies,
  parseBackendEnvelope,
  persistSession,
} from "@/lib/server-response";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = loginSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const backendResponse = await fetchBackend("/auth/login", {
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

  const { token } = resolveBackendTokens(backendResponse);

  if (!token) {
    return jsonError("Autenticacao concluida sem token valido.", 502);
  }

  const [familyResult, profilesResult] = await Promise.all([
    fetchCurrentFamily({ token }),
    fetchCurrentProfiles({ token }),
  ]);
  const family = familyResult ?? envelope.data.family;
  const profiles =
    profilesResult ?? (Array.isArray(envelope.data.profiles) ? envelope.data.profiles : []);

  const response = NextResponse.json({
    status: "success",
    data: {
      family,
      profiles,
      isNewFamily: envelope.data.isNewFamily ?? false,
    },
  });

  mirrorBackendAuthCookies(response, backendResponse);
  persistSession(response, {
    family,
    profiles,
    selectedProfile: null,
  });
  return response;
}
