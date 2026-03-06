import "server-only";

import { cookies } from "next/headers";

import { fetchTeachings } from "@/lib/teachings.fetch";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

function buildCookieHeader(values: { name: string; value: string }[]) {
  return values.map(({ name, value }) => `${name}=${value}`).join("; ");
}

export async function getServerTeachings() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const cookieHeader = buildCookieHeader(cookieStore.getAll());

  return fetchTeachings({ token, cookieHeader });
}
