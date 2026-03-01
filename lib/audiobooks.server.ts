import "server-only";

import { cookies } from "next/headers";

import { fetchAudiobooks } from "@/lib/audiobooks";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export async function getServerAudiobooks(book?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return fetchAudiobooks({ token, book });
}
