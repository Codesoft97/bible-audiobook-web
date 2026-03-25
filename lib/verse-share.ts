export interface BibleVerseShareParams {
  abbrev: string;
  chapter: number;
  verse: number;
  bg?: number;
}

export interface BibleVerseShareData {
  text: string;
  book: string;
  abbrev: string;
  chapter: number;
  verse: number;
  reference: string;
  translation: string;
  socialHandle: string;
  shareUrl: string;
  imageUrl: string;
}

export interface BibleVerseShareFeedback {
  tone: "success" | "error";
  message: string;
}

function normalizeAbbrev(abbrev: string) {
  return abbrev.trim().toLowerCase();
}

export function buildBibleVerseShareKey(
  params: Pick<BibleVerseShareParams, "abbrev" | "chapter" | "verse">,
) {
  return `${normalizeAbbrev(params.abbrev)}:${params.chapter}:${params.verse}:share`;
}

export function buildBibleVerseSharePath(
  params: Pick<BibleVerseShareParams, "abbrev" | "chapter" | "verse">,
) {
  return `/share/verse/${encodeURIComponent(normalizeAbbrev(params.abbrev))}/${params.chapter}/${params.verse}`;
}

export function buildBibleVerseShareSearchParams(params: BibleVerseShareParams) {
  const searchParams = new URLSearchParams({
    abbrev: normalizeAbbrev(params.abbrev),
    chapter: String(params.chapter),
    verse: String(params.verse),
  });

  if (typeof params.bg === "number") {
    searchParams.set("bg", String(params.bg));
  }

  return searchParams;
}

export function buildBibleVerseShareApiPath(params: BibleVerseShareParams) {
  return `/api/share/verse?${buildBibleVerseShareSearchParams(params).toString()}`;
}

export function buildBibleVerseShareImageApiPath(params: BibleVerseShareParams) {
  return `/api/share/verse/image?${buildBibleVerseShareSearchParams({
    ...params,
    bg: params.bg ?? 0,
  }).toString()}`;
}

export function formatBibleVerseShareText(
  data: Pick<BibleVerseShareData, "text" | "reference" | "socialHandle">,
) {
  return `"${data.text}" - ${data.reference} | ${data.socialHandle}`;
}

export function resolveBibleVerseShareImageUrl(
  data: Pick<BibleVerseShareData, "abbrev" | "chapter" | "verse" | "shareUrl">,
) {
  return new URL(buildBibleVerseShareImageApiPath(data), data.shareUrl).toString();
}
