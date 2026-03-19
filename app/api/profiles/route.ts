import { NextRequest, NextResponse } from "next/server";

import { parseSession } from "@/lib/auth/session";
import type { Profile } from "@/lib/auth/types";
import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import { hydrateSessionFamily } from "@/lib/family";
import { jsonError, parseBackendEnvelope, persistSession } from "@/lib/server-response";
import { profileSchema } from "@/lib/validation";
import { AUTH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const result = await fetchBackendWithAutoRefresh(request, "/profiles", {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<Profile[]>(result.backendResponse);

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

  const session = parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const token = result.fallbackTokens.token ?? request.cookies.get(AUTH_COOKIE_NAME)?.value;
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

  return applyBackendProxyAuth(response, result);
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = profileSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const result = await fetchBackendWithAutoRefresh(request, "/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.data),
  });
  const envelope = await parseBackendEnvelope<Profile>(result.backendResponse);

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

  const session = parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const token = result.fallbackTokens.token ?? request.cookies.get(AUTH_COOKIE_NAME)?.value;
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

  return applyBackendProxyAuth(response, result);
}
