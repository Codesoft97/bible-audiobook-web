import { createHmac, timingSafeEqual } from "crypto";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { env } from "@/lib/env";
import type { AppSession } from "@/lib/auth/types";

function encodeSession(session: AppSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
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
    return decodeSession(payload);
  } catch {
    return null;
  }
}

export function buildSessionCookie(session: AppSession) {
  return {
    name: SESSION_COOKIE_NAME,
    value: serializeSession(session),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.IS_PRODUCTION,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function buildClearedSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.IS_PRODUCTION,
    path: "/",
    maxAge: 0,
  };
}
