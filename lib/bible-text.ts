export type BibleTextTestament = "old" | "new";

export interface BibleTextBook {
  name: string;
  abbrev: string;
  testament: BibleTextTestament;
  totalChapters: number;
  order: number;
}

export interface BibleTextVerse {
  number: number;
  text: string;
}

export interface BibleTextChapter {
  translation: string;
  book: string;
  abbrev: string;
  testament: BibleTextTestament;
  order: number;
  chapter: number;
  totalChapters: number;
  totalVerses: number;
  previousChapter: number | null;
  nextChapter: number | null;
  verses: BibleTextVerse[];
}

export interface BibleTextLastReadInput {
  abbrev: string;
  chapter: number;
  verse: number;
}

export interface BibleTextLastRead extends BibleTextLastReadInput {
  updatedAt: string;
}

export interface BibleTextReadingState {
  translation: string;
  fontScale: number;
  lastRead: BibleTextLastRead | null;
}

export interface BibleTextReadingStateUpdateInput {
  fontScale?: number;
  lastRead?: BibleTextLastReadInput;
}

export interface BibleTextHighlight {
  id: string;
  translation: string;
  book: string;
  abbrev: string;
  testament: BibleTextTestament;
  order: number;
  chapter: number;
  verse: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface BibleTextBookSection {
  testament: BibleTextTestament;
  title: string;
  books: BibleTextBook[];
}

function sortBooks(first: BibleTextBook, second: BibleTextBook) {
  if (first.order !== second.order) {
    return first.order - second.order;
  }

  return first.name.localeCompare(second.name, "pt-BR");
}

export function formatBibleTextTestamentLabel(testament: BibleTextTestament) {
  return testament === "old" ? "Antigo Testamento" : "Novo Testamento";
}

export function sortBibleTextBooks(items: BibleTextBook[]) {
  return [...items].sort(sortBooks);
}

export function groupBibleTextBooksByTestament(items: BibleTextBook[]) {
  return (["old", "new"] as const)
    .map((testament) => ({
      testament,
      title: formatBibleTextTestamentLabel(testament),
      books: sortBibleTextBooks(items.filter((item) => item.testament === testament)),
    }))
    .filter((section) => section.books.length > 0) satisfies BibleTextBookSection[];
}

export function buildBibleTextChapterCacheKey(abbrev: string, chapter: number) {
  return `${abbrev.toLowerCase()}:${chapter}`;
}

export function buildBibleTextHighlightsCacheKey(abbrev: string, chapter: number) {
  return `${abbrev.toLowerCase()}:${chapter}:highlights`;
}

export function clampBibleTextFontScale(value: number) {
  return Math.min(1.6, Math.max(0.85, Number(value.toFixed(2))));
}
