import { fetchBackend } from "@/lib/backend-api";
import { parseBackendEnvelope } from "@/lib/server-response";

export interface Audiobook {
  id: string;
  book: string;
  chapter: number;
  isActive: boolean;
  coverImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudiobookBookSummary {
  slug: string;
  title: string;
  totalChapters: number;
  latestChapter: number;
  coverImageUrl: string;
  updatedAt: string;
}

const CANONICAL_BOOKS = [
  "genesis",
  "exodus",
  "leviticus",
  "numbers",
  "deuteronomy",
  "joshua",
  "judges",
  "ruth",
  "1samuel",
  "2samuel",
  "1kings",
  "2kings",
  "1chronicles",
  "2chronicles",
  "ezra",
  "nehemiah",
  "esther",
  "job",
  "psalms",
  "proverbs",
  "ecclesiastes",
  "songofsolomon",
  "isaiah",
  "jeremiah",
  "lamentations",
  "ezekiel",
  "daniel",
  "hosea",
  "joel",
  "amos",
  "obadiah",
  "jonah",
  "micah",
  "nahum",
  "habakkuk",
  "zephaniah",
  "haggai",
  "zechariah",
  "malachi",
  "matthew",
  "mark",
  "luke",
  "john",
  "acts",
  "romans",
  "1corinthians",
  "2corinthians",
  "galatians",
  "ephesians",
  "philippians",
  "colossians",
  "1thessalonians",
  "2thessalonians",
  "1timothy",
  "2timothy",
  "titus",
  "philemon",
  "hebrews",
  "james",
  "1peter",
  "2peter",
  "1john",
  "2john",
  "3john",
  "jude",
  "revelation",
] as const;

const BOOK_LABELS: Record<string, string> = {
  genesis: "Genesis",
  exodus: "Exodo",
  leviticus: "Levitico",
  numbers: "Numeros",
  deuteronomy: "Deuteronomio",
  joshua: "Josue",
  judges: "Juizes",
  ruth: "Rute",
  "1samuel": "1 Samuel",
  "2samuel": "2 Samuel",
  "1kings": "1 Reis",
  "2kings": "2 Reis",
  "1chronicles": "1 Cronicas",
  "2chronicles": "2 Cronicas",
  ezra: "Esdras",
  nehemiah: "Neemias",
  esther: "Ester",
  job: "Jo",
  psalms: "Salmos",
  proverbs: "Proverbios",
  ecclesiastes: "Eclesiastes",
  songofsolomon: "Cantares",
  isaiah: "Isaias",
  jeremiah: "Jeremias",
  lamentations: "Lamentacoes",
  ezekiel: "Ezequiel",
  daniel: "Daniel",
  hosea: "Oseias",
  joel: "Joel",
  amos: "Amos",
  obadiah: "Obadias",
  jonah: "Jonas",
  micah: "Miqueias",
  nahum: "Naum",
  habakkuk: "Habacuque",
  zephaniah: "Sofonias",
  haggai: "Ageu",
  zechariah: "Zacarias",
  malachi: "Malaquias",
  matthew: "Mateus",
  mark: "Marcos",
  luke: "Lucas",
  john: "Joao",
  acts: "Atos",
  romans: "Romanos",
  "1corinthians": "1 Corintios",
  "2corinthians": "2 Corintios",
  galatians: "Galatas",
  ephesians: "Efesios",
  philippians: "Filipenses",
  colossians: "Colossenses",
  "1thessalonians": "1 Tessalonicenses",
  "2thessalonians": "2 Tessalonicenses",
  "1timothy": "1 Timoteo",
  "2timothy": "2 Timoteo",
  titus: "Tito",
  philemon: "Filemom",
  hebrews: "Hebreus",
  james: "Tiago",
  "1peter": "1 Pedro",
  "2peter": "2 Pedro",
  "1john": "1 Joao",
  "2john": "2 Joao",
  "3john": "3 Joao",
  jude: "Judas",
  revelation: "Apocalipse",
};

const BOOK_ORDER_LOOKUP = new Map(
  CANONICAL_BOOKS.map((book, index) => [book, index]),
);

function normalizeBookKey(value: string) {
  return value.toLowerCase().replace(/[\s_-]+/g, "").replace(/[^\da-z]/g, "");
}

function titleizeSlug(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function sortBooks(first: AudiobookBookSummary, second: AudiobookBookSummary) {
  const firstIndex = BOOK_ORDER_LOOKUP.get(normalizeBookKey(first.slug)) ?? Number.MAX_SAFE_INTEGER;
  const secondIndex =
    BOOK_ORDER_LOOKUP.get(normalizeBookKey(second.slug)) ?? Number.MAX_SAFE_INTEGER;

  if (firstIndex !== secondIndex) {
    return firstIndex - secondIndex;
  }

  return first.title.localeCompare(second.title);
}

export function formatBookLabel(slug: string) {
  return BOOK_LABELS[normalizeBookKey(slug)] ?? titleizeSlug(slug);
}

export function groupAudiobooksByBook(items: Audiobook[]) {
  const groups = new Map<string, Audiobook[]>();

  for (const item of items) {
    const current = groups.get(item.book) ?? [];
    current.push(item);
    groups.set(item.book, current);
  }

  return [...groups.entries()]
    .map(([slug, chapters]) => {
      const sortedChapters = [...chapters].sort((first, second) => first.chapter - second.chapter);

      return {
        slug,
        title: formatBookLabel(slug),
        totalChapters: sortedChapters.length,
        latestChapter: sortedChapters[sortedChapters.length - 1]?.chapter ?? 0,
        coverImageUrl: sortedChapters[0]?.coverImageUrl ?? "",
        updatedAt: sortedChapters[sortedChapters.length - 1]?.updatedAt ?? "",
      } satisfies AudiobookBookSummary;
    })
    .sort(sortBooks);
}

export function sortAudiobookChapters(items: Audiobook[]) {
  return [...items].sort((first, second) => first.chapter - second.chapter);
}

export async function fetchAudiobooks(
  options: { token?: string; book?: string; cookieHeader?: string } = {},
) {
  const headers: Record<string, string> = {};

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.cookieHeader) {
    headers.cookie = options.cookieHeader;
  }

  const response = await fetchBackend("/audiobooks", {
    method: "GET",
    headers,
  });

  const envelope = await parseBackendEnvelope<Audiobook[]>(response);

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    return [] as Audiobook[];
  }

  const activeItems = envelope.data.filter((item) => item.isActive);

  if (!options.book) {
    return activeItems;
  }

  return activeItems.filter((item) => item.book.toLowerCase() === options.book?.toLowerCase());
}
