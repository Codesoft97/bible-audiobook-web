import { fetchBackend, parseJsonSafe } from "@/lib/backend-api";
import type { ApiEnvelope } from "@/lib/auth/types";

const INVALID_REFRESH_RESPONSE = {
  status: "error",
  message: "Resposta invalida do backend.",
} satisfies ApiEnvelope<unknown>;

export async function requestSessionRefresh(options: {
  cookieHeader?: string;
  refreshToken?: string;
}) {
  const refreshToken = options.refreshToken?.trim();
  const useBodyRefreshToken = Boolean(refreshToken);

  const backendResponse = await fetchBackend("/auth/refresh", {
    method: "POST",
    headers: {
      ...(useBodyRefreshToken ? { "Content-Type": "application/json" } : {}),
      ...(!useBodyRefreshToken && options.cookieHeader ? { cookie: options.cookieHeader } : {}),
    },
    body: useBodyRefreshToken ? JSON.stringify({ refreshToken }) : undefined,
  });

  const envelope = (await parseJsonSafe<ApiEnvelope<unknown>>(backendResponse)) ?? INVALID_REFRESH_RESPONSE;

  return {
    backendResponse,
    envelope,
  };
}
