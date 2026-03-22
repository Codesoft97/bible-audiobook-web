import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { env } from "@/lib/env";

const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function buildSessionCookieOptions(value: string, maxAge: number) {
  return {
    name: SESSION_COOKIE_NAME,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.IS_PRODUCTION,
    path: "/",
    maxAge,
  };
}

export function buildSerializedSessionCookie(value: string) {
  return buildSessionCookieOptions(value, SESSION_COOKIE_MAX_AGE_SECONDS);
}

export function buildClearedSessionCookie() {
  return buildSessionCookieOptions("", 0);
}
