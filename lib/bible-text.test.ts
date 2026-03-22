import { describe, expect, it } from "vitest";

import {
  buildBibleTextChapterCacheKey,
  buildBibleTextHighlightsCacheKey,
  clampBibleTextFontScale,
  formatBibleTextTestamentLabel,
  groupBibleTextBooksByTestament,
  sortBibleTextBooks,
  type BibleTextBook,
} from "@/lib/bible-text";

const BOOKS_FIXTURE: BibleTextBook[] = [
  {
    name: "Mateus",
    abbrev: "mt",
    testament: "new",
    totalChapters: 28,
    order: 40,
  },
  {
    name: "Genesis",
    abbrev: "gn",
    testament: "old",
    totalChapters: 50,
    order: 1,
  },
  {
    name: "Salmos",
    abbrev: "sl",
    testament: "old",
    totalChapters: 150,
    order: 19,
  },
];

describe("bible-text helpers", () => {
  it("sorts books by canonical order", () => {
    expect(sortBibleTextBooks(BOOKS_FIXTURE).map((book) => book.abbrev)).toEqual([
      "gn",
      "sl",
      "mt",
    ]);
  });

  it("groups books by testament", () => {
    const grouped = groupBibleTextBooksByTestament(BOOKS_FIXTURE);

    expect(grouped).toEqual([
      {
        testament: "old",
        title: "Antigo Testamento",
        books: [
          BOOKS_FIXTURE[1],
          BOOKS_FIXTURE[2],
        ],
      },
      {
        testament: "new",
        title: "Novo Testamento",
        books: [BOOKS_FIXTURE[0]],
      },
    ]);
  });

  it("formats testament labels", () => {
    expect(formatBibleTextTestamentLabel("old")).toBe("Antigo Testamento");
    expect(formatBibleTextTestamentLabel("new")).toBe("Novo Testamento");
  });

  it("builds stable chapter cache keys", () => {
    expect(buildBibleTextChapterCacheKey("GN", 3)).toBe("gn:3");
  });

  it("builds stable highlight cache keys", () => {
    expect(buildBibleTextHighlightsCacheKey("GN", 3)).toBe("gn:3:highlights");
  });

  it("clamps font scale to supported limits", () => {
    expect(clampBibleTextFontScale(0.5)).toBe(0.85);
    expect(clampBibleTextFontScale(1.237)).toBe(1.24);
    expect(clampBibleTextFontScale(2)).toBe(1.6);
  });
});
