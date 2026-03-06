import "server-only";

import { cookies } from "next/headers";

import { fetchAudiobooks } from "@/lib/audiobooks.fetch";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

function buildCookieHeader(values: { name: string; value: string }[]) {
  return values.map(({ name, value }) => `${name}=${value}`).join("; ");
}

export async function getServerAudiobooks(book?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const cookieHeader = buildCookieHeader(cookieStore.getAll());

  return fetchAudiobooks({ token, book, cookieHeader });
}
