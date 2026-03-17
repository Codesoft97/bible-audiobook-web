import { describe, expect, it } from "vitest";

import {
  countBibleReferencePassages,
  parseBibleReferenceGroups,
} from "@/lib/bible-references";

describe("bible references parser", () => {
  it("agrupa referencias pelo livro anterior quando o backend omite o nome nas seguintes", () => {
    const groups = parseBibleReferenceGroups(
      "Mateus 6:14-15; 18:21-35; Marcos 11:25; Lucas 6:37; 17:3-4",
    );

    expect(groups).toEqual([
      {
        book: "Mateus",
        passages: ["6:14-15", "18:21-35"],
      },
      {
        book: "Marcos",
        passages: ["11:25"],
      },
      {
        book: "Lucas",
        passages: ["6:37", "17:3-4"],
      },
    ]);
    expect(countBibleReferencePassages(groups)).toBe(5);
  });

  it("preserva livros com numeral no nome", () => {
    const groups = parseBibleReferenceGroups("1 Joao 1:9; Salmos 32:1-5; 86:5");

    expect(groups).toEqual([
      {
        book: "1 Joao",
        passages: ["1:9"],
      },
      {
        book: "Salmos",
        passages: ["32:1-5", "86:5"],
      },
    ]);
  });
});
