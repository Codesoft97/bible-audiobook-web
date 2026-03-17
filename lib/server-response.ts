import { NextResponse } from "next/server";

import {
  buildClearedRefreshTokenCookie,
  buildClearedTokenCookie,
  buildRefreshTokenCookie,
  buildTokenCookie,
  parseJsonSafe,
  resolveBackendTokens,
} from "@/lib/backend-api";
import { buildClearedSessionCookie, buildSessionCookie } from "@/lib/auth/session";
import type { ApiEnvelope, AppSession, SessionTokens } from "@/lib/auth/types";

export function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      status: "error",
      message,
    },
    { status },
  );
}

export async function parseBackendEnvelope<T>(response: Response) {
  const payload = await parseJsonSafe<ApiEnvelope<T>>(response);

  if (payload) {
    return payload;
  }

  return {
    status: "error",
    message: "Resposta invalida do backend.",
  } satisfies ApiEnvelope<T>;
}

export function persistAuthTokens(
  response: NextResponse,
  tokens: Partial<SessionTokens>,
) {
  if (tokens.token) {
    response.cookies.set(buildTokenCookie(tokens.token));
  }

  if (tokens.refreshToken) {
    response.cookies.set(buildRefreshTokenCookie(tokens.refreshToken));
  }

  return response;
}

export function mirrorBackendAuthCookies(
  response: NextResponse,
  backendResponse: Response,
  fallbackTokens: Partial<SessionTokens> = {},
) {
  return persistAuthTokens(response, resolveBackendTokens(backendResponse, fallbackTokens));
}

export function persistSession(response: NextResponse, session: AppSession) {
  response.cookies.set(buildSessionCookie(session));
  return response;
}

export function clearAuthState(response: NextResponse) {
  response.cookies.set(buildClearedSessionCookie());
  response.cookies.set(buildClearedTokenCookie());
  response.cookies.set(buildClearedRefreshTokenCookie());
  return response;
}
