import { NextRequest, NextResponse } from "next/server";

import { parseSession } from "@/lib/auth/session";
import { AUTH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/constants";
import { fetchCurrentFamilyEnvelope } from "@/lib/family";
import { persistSession } from "@/lib/session-response";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const { response: backendResponse, envelope } = await fetchCurrentFamilyEnvelope({
    token,
    cookieHeader: token ? undefined : cookieHeader,
  });

  const response = NextResponse.json(envelope, {
    status: backendResponse.status || 200,
  });

  const session = parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (session && envelope.status === "success" && envelope.data) {
    persistSession(response, {
      ...session,
      family: envelope.data,
    });
  }

  return response;
}
