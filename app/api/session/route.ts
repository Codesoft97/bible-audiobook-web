import { NextRequest, NextResponse } from "next/server";

import { parseSession } from "@/lib/auth/session";
import { AUTH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/constants";
import { hydrateSessionFamily } from "@/lib/family";
import { persistSession } from "@/lib/session-response";

export async function GET(request: NextRequest) {
  const session = parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!session) {
    return NextResponse.json({
      status: "success",
      data: {
        authenticated: false,
        session: null,
      },
    });
  }

  const hydratedSession = await hydrateSessionFamily(session, { token });

  const response = NextResponse.json({
    status: "success",
    data: {
      authenticated: true,
      session: hydratedSession,
    },
  });

  persistSession(response, hydratedSession);
  return response;
}
