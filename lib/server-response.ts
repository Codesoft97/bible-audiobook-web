import { NextResponse } from "next/server";

import {
  buildClearedTokenCookie,
  buildTokenCookie,
  parseJsonSafe,
  resolveBackendToken,
} from "@/lib/backend-api";
import { buildClearedSessionCookie, buildSessionCookie } from "@/lib/auth/session";
import type { ApiEnvelope, AppSession } from "@/lib/auth/types";

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

export function mirrorBackendCookie(
  response: NextResponse,
  backendResponse: Response,
  fallbackToken?: string,
) {
  const token = resolveBackendToken(backendResponse, fallbackToken);

  if (token) {
    response.cookies.set(buildTokenCookie(token));
  }
}

export function persistSession(response: NextResponse, session: AppSession) {
  response.cookies.set(buildSessionCookie(session));
  return response;
}

export function clearAuthState(response: NextResponse) {
  response.cookies.set(buildClearedSessionCookie());
  response.cookies.set(buildClearedTokenCookie());
  return response;
}
