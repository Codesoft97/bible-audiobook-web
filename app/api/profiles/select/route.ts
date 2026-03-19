import { NextRequest, NextResponse } from "next/server";

import { parseSession } from "@/lib/auth/session";
import type { Profile } from "@/lib/auth/types";
import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import { AUTH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/constants";
import { hydrateSessionFamily } from "@/lib/family";
import {
  jsonError,
  parseBackendEnvelope,
  persistSession,
} from "@/lib/server-response";
import { selectProfileSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = selectProfileSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const result = await fetchBackendWithAutoRefresh(request, "/profiles/select", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.data),
  });
  const envelope = await parseBackendEnvelope<{
    profile: Profile;
  }>(result.backendResponse);

  if (
    !result.backendResponse.ok ||
    envelope?.status !== "success" ||
    !envelope.data
  ) {
    const response = NextResponse.json(envelope, {
      status: result.backendResponse.status || 400,
    });

    return applyBackendProxyAuth(response, result);
  }
  const selectedProfile = envelope.data.profile;

  const session = parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const token = result.fallbackTokens.token ?? request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const sessionWithFamily = session
    ? await hydrateSessionFamily(session, { token })
    : null;
  const response = NextResponse.json({
    status: "success",
    data: {
      profile: selectedProfile,
    },
  });

  if (sessionWithFamily) {
    const updatedProfiles = sessionWithFamily.profiles.some(
      (profile) => profile.id === selectedProfile.id,
    )
      ? sessionWithFamily.profiles
      : [...sessionWithFamily.profiles, selectedProfile];

    persistSession(response, {
      ...sessionWithFamily,
      profiles: updatedProfiles,
      selectedProfile,
    });
  }

  return applyBackendProxyAuth(response, result);
}
