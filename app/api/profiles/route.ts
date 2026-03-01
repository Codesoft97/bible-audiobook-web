import { NextRequest, NextResponse } from "next/server";

import { fetchBackend, getBackendAuthHeaders } from "@/lib/backend-api";
import { parseSession } from "@/lib/auth/session";
import type { Profile } from "@/lib/auth/types";
import { hydrateSessionFamily } from "@/lib/family";
import { jsonError, parseBackendEnvelope, persistSession } from "@/lib/server-response";
import { profileSchema } from "@/lib/validation";
import { AUTH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const backendResponse = await fetchBackend("/profiles", {
    method: "GET",
    headers: {
      ...getBackendAuthHeaders(request),
    },
  });

  const envelope = await parseBackendEnvelope<Profile[]>(backendResponse);

  if (!backendResponse.ok || envelope?.status !== "success" || !envelope.data) {
    return NextResponse.json(envelope, {
      status: backendResponse.status || 400,
    });
  }

  const session = parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const sessionWithFamily = session
    ? await hydrateSessionFamily(session, { token })
    : null;
  const selectedProfile =
    sessionWithFamily?.selectedProfile &&
    envelope.data.find((profile) => profile.id === sessionWithFamily.selectedProfile?.id)
      ? sessionWithFamily.selectedProfile
      : null;

  const response = NextResponse.json({
    status: "success",
    data: envelope.data,
  });

  if (sessionWithFamily) {
    persistSession(response, {
      ...sessionWithFamily,
      profiles: envelope.data,
      selectedProfile,
    });
  }

  return response;
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = profileSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const backendResponse = await fetchBackend("/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBackendAuthHeaders(request),
    },
    body: JSON.stringify(validation.data),
  });

  const envelope = await parseBackendEnvelope<Profile>(backendResponse);

  if (!backendResponse.ok || envelope?.status !== "success" || !envelope.data) {
    return NextResponse.json(envelope, {
      status: backendResponse.status || 400,
    });
  }

  const session = parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const sessionWithFamily = session
    ? await hydrateSessionFamily(session, { token })
    : null;
  const response = NextResponse.json(envelope, {
    status: 201,
  });

  if (sessionWithFamily) {
    persistSession(response, {
      ...sessionWithFamily,
      profiles: [...sessionWithFamily.profiles, envelope.data],
    });
  }

  return response;
}
