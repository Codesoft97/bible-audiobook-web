import { fetchBackend } from "@/lib/backend-api";
import type { ApiEnvelope, Profile } from "@/lib/auth/types";
import { parseBackendEnvelope } from "@/lib/server-response";

interface ProfilesRequestOptions {
  cookieHeader?: string;
  token?: string;
}

export async function fetchCurrentProfiles({
  cookieHeader,
  token,
}: ProfilesRequestOptions = {}) {
  const result = await fetchCurrentProfilesEnvelope({ cookieHeader, token });

  if (!result.response.ok || result.envelope.status !== "success" || !result.envelope.data) {
    return null;
  }

  return result.envelope.data;
}

export async function fetchCurrentProfilesEnvelope({
  cookieHeader,
  token,
}: ProfilesRequestOptions = {}) {
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
      } satisfies ApiEnvelope<Profile[]>,
    };
  }

  const response = await fetchBackend("/profiles", {
    method: "GET",
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const envelope = await parseBackendEnvelope<Profile[]>(response);
  return { response, envelope };
}
