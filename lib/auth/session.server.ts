import "server-only";

import { cookies } from "next/headers";

import { parseSession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export async function getServerSession() {
  const cookieStore = await cookies();
  return parseSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
