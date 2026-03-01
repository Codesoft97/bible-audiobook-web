import "server-only";

import { cookies } from "next/headers";

import { fetchCharacterJourneys } from "@/lib/character-journeys";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export async function getServerCharacterJourneys() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return fetchCharacterJourneys(token);
}
