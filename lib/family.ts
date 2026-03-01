import { cookies } from "next/headers";

import { fetchBackend } from "@/lib/backend-api";
import { parseSession } from "@/lib/auth/session";
import type { ApiEnvelope, AppSession, Family } from "@/lib/auth/types";
import { AUTH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/constants";
import { parseBackendEnvelope } from "@/lib/server-response";

interface FamilyRequestOptions {
  cookieHeader?: string;
  token?: string;
}

function buildCookieHeader(values: { name: string; value: string }[]) {
  return values.map(({ name, value }) => `${name}=${value}`).join("; ");
}

export async function fetchCurrentFamily({ cookieHeader, token }: FamilyRequestOptions = {}) {
  const result = await fetchCurrentFamilyEnvelope({ cookieHeader, token });

  if (!result.response.ok || result.envelope.status !== "success" || !result.envelope.data) {
    return null;
  }

  return result.envelope.data;
}

export async function fetchCurrentFamilyEnvelope({
  cookieHeader,
  token,
}: FamilyRequestOptions = {}) {
  if (!cookieHeader && !token) {
    return {
      response: new Response(
        JSON.stringify({
          status: "error",
          message: "Missing authentication",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
      envelope: {
        status: "error",
        message: "Missing authentication",
      } satisfies ApiEnvelope<Family>,
    };
  }

  const response = await fetchBackend("/families/me", {
    method: "GET",
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const envelope = await parseBackendEnvelope<Family>(response);
  return { response, envelope };
}

export async function hydrateSessionFamily(
  session: AppSession,
  options: FamilyRequestOptions = {},
) {
  const family = await fetchCurrentFamily(options);

  if (!family) {
    return session;
  }

  return {
    ...session,
    family,
  };
}

export async function getServerSessionWithFamily() {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return null;
  }

  return hydrateSessionFamily(session, {
    cookieHeader: buildCookieHeader(cookieStore.getAll()),
    token: cookieStore.get(AUTH_COOKIE_NAME)?.value,
  });
}
