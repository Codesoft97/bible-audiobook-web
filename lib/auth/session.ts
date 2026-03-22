import { createHmac, timingSafeEqual } from "crypto";

import { buildSerializedSessionCookie } from "@/lib/auth/session-cookie";
import { env } from "@/lib/env";
import type { AppSession } from "@/lib/auth/types";

function normalizeSession(session: AppSession) {
  return {
    ...session,
    profiles: Array.isArray(session.profiles) ? session.profiles : [],
    selectedProfile: session.selectedProfile ?? null,
  } satisfies AppSession;
}

function encodeSession(session: AppSession) {
  return Buffer.from(JSON.stringify(normalizeSession(session)), "utf8").toString("base64url");
}

function decodeSession(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AppSession;
}

function signPayload(payload: string) {
  return createHmac("sha256", env.SESSION_SECRET).update(payload).digest("base64url");
}

export function serializeSession(session: AppSession) {
  const payload = encodeSession(session);
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function parseSession(cookieValue?: string | null) {
  if (!cookieValue) {
    return null;
  }

  const [payload, signature] = cookieValue.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expected = signPayload(payload);
  const valid =
    expected.length === signature.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!valid) {
    return null;
  }

  try {
    const session = decodeSession(payload);

    if (!session || typeof session !== "object" || !("family" in session)) {
      return null;
    }

    return normalizeSession(session);
  } catch {
    return null;
  }
}

export function buildSessionCookie(session: AppSession) {
  return buildSerializedSessionCookie(serializeSession(session));
}
