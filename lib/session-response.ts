import { NextResponse } from "next/server";

import { buildSessionCookie } from "@/lib/auth/session";
import type { AppSession } from "@/lib/auth/types";

export function persistSession(response: NextResponse, session: AppSession) {
  response.cookies.set(buildSessionCookie(session));
  return response;
}
