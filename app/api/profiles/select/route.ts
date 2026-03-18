import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import { parseSession } from "@/lib/auth/session";
import type { Profile } from "@/lib/auth/types";
import { AUTH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/constants";
import { hydrateSessionFamily } from "@/lib/family";
import {
  jsonError,
  mirrorBackendAuthCookies,
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

  const backendResponse = await fetchBackend("/profiles/select", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBackendAuthHeaders(request),
    },
    body: JSON.stringify(validation.data),
  });

  const envelope = await parseBackendEnvelope<{
    profile: Profile;
  }>(backendResponse);

  if (!backendResponse.ok || envelope?.status !== "success" || !envelope.data) {
    return NextResponse.json(envelope, {
      status: backendResponse.status || 400,
    });
  }
  const selectedProfile = envelope.data.profile;

  const session = parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const sessionWithFamily = session
    ? await hydrateSessionFamily(session, { token })
    : null;
  const response = NextResponse.json({
    status: "success",
    data: {
      profile: selectedProfile,
    },
  });

  mirrorBackendAuthCookies(response, backendResponse);

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

  return response;
}
