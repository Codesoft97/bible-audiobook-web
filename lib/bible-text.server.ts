import "server-only";

import { cookies } from "next/headers";

import {
  fetchBibleTextBooks,
  fetchBibleTextChapter,
  fetchBibleTextReadingState,
} from "@/lib/bible-text.fetch";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

function buildCookieHeader(values: { name: string; value: string }[]) {
  return values.map(({ name, value }) => `${name}=${value}`).join("; ");
}

export async function getServerBibleTextBooks() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const cookieHeader = buildCookieHeader(cookieStore.getAll());

  return fetchBibleTextBooks({ token, cookieHeader });
}

export async function getServerBibleTextChapter(abbrev: string, chapter: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const cookieHeader = buildCookieHeader(cookieStore.getAll());

  return fetchBibleTextChapter(abbrev, chapter, { token, cookieHeader });
}

export async function getServerBibleTextReadingState() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const cookieHeader = buildCookieHeader(cookieStore.getAll());

  return fetchBibleTextReadingState({ token, cookieHeader });
}
