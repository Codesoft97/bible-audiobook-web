import { describe, expect, it } from "vitest";

import {
  formatAudiobookTestamentLabel,
  groupAudiobookSummariesByTestament,
  groupAudiobooksByBook,
  resolveAudiobookTestament,
  type Audiobook,
} from "@/lib/audiobooks";

const AUDIOBOOKS_FIXTURE: Audiobook[] = [
  {
    id: "genesis-1",
    book: "genesis",
    testament: "old",
    chapter: 1,
    isFree: true,
    isActive: true,
    coverImageUrl: "/genesis.jpg",
    createdAt: "2026-03-21T10:00:00.000Z",
    updatedAt: "2026-03-21T10:00:00.000Z",
  },
  {
    id: "genesis-2",
    book: "genesis",
    testament: "old",
    chapter: 2,
    isFree: true,
    isActive: true,
    coverImageUrl: "/genesis.jpg",
    createdAt: "2026-03-21T10:00:00.000Z",
    updatedAt: "2026-03-21T10:05:00.000Z",
  },
  {
    id: "matthew-1",
    book: "matthew",
    testament: "new",
    chapter: 1,
    isFree: false,
    isActive: true,
    coverImageUrl: "/matthew.jpg",
    createdAt: "2026-03-21T10:00:00.000Z",
    updatedAt: "2026-03-21T10:10:00.000Z",
  },
];

describe("lib/audiobooks", () => {
  it("agrupa livros preservando o testamento vindo do backend", () => {
    const grouped = groupAudiobooksByBook(AUDIOBOOKS_FIXTURE);

    expect(grouped).toEqual([
      expect.objectContaining({
        slug: "genesis",
        testament: "old",
        isFree: true,
        totalChapters: 2,
      }),
      expect.objectContaining({
        slug: "matthew",
        testament: "new",
        isFree: false,
        totalChapters: 1,
      }),
    ]);
  });

  it("agrupa os resumos em secoes de antigo e novo testamento", () => {
    const grouped = groupAudiobookSummariesByTestament(
      groupAudiobooksByBook(AUDIOBOOKS_FIXTURE),
    );

    expect(grouped).toEqual([
      expect.objectContaining({
        testament: "old",
        title: "Antigo Testamento",
        books: [expect.objectContaining({ slug: "genesis" })],
      }),
      expect.objectContaining({
        testament: "new",
        title: "Novo Testamento",
        books: [expect.objectContaining({ slug: "matthew" })],
      }),
    ]);
  });

  it("infere o testamento pelo slug quando necessario", () => {
    expect(resolveAudiobookTestament(undefined, "psalms")).toBe("old");
    expect(resolveAudiobookTestament(undefined, "john")).toBe("new");
  });

  it("formata os labels do testamento", () => {
    expect(formatAudiobookTestamentLabel("old")).toBe("Antigo Testamento");
    expect(formatAudiobookTestamentLabel("new")).toBe("Novo Testamento");
  });
});
