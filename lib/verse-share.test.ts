import { describe, expect, it } from "vitest";

import {
  buildBibleVerseShareApiPath,
  buildBibleVerseShareImageApiPath,
  buildBibleVerseShareKey,
  buildBibleVerseSharePath,
  formatBibleVerseShareText,
  resolveBibleVerseShareImageUrl,
} from "@/lib/verse-share";

describe("verse share helpers", () => {
  it("builds a stable share key", () => {
    expect(buildBibleVerseShareKey({ abbrev: "GN", chapter: 1, verse: 1 })).toBe(
      "gn:1:1:share",
    );
  });

  it("builds the public share path", () => {
    expect(buildBibleVerseSharePath({ abbrev: "GN", chapter: 1, verse: 1 })).toBe(
      "/share/verse/gn/1/1",
    );
  });

  it("builds the share API paths", () => {
    expect(buildBibleVerseShareApiPath({ abbrev: "GN", chapter: 1, verse: 1 })).toBe(
      "/api/share/verse?abbrev=gn&chapter=1&verse=1",
    );
    expect(
      buildBibleVerseShareImageApiPath({
        abbrev: "GN",
        chapter: 1,
        verse: 1,
      }),
    ).toBe("/api/share/verse/image?abbrev=gn&chapter=1&verse=1&bg=0");
    expect(
      buildBibleVerseShareImageApiPath({
        abbrev: "GN",
        chapter: 1,
        verse: 1,
        bg: 3,
      }),
    ).toBe("/api/share/verse/image?abbrev=gn&chapter=1&verse=1&bg=3");
  });

  it("formats the share text", () => {
    expect(
      formatBibleVerseShareText({
        text: "No principio Deus criou os ceus e a terra.",
        reference: "Genesis 1:1",
        socialHandle: "@evangelhoemaudio",
      }),
    ).toBe(
      '"No principio Deus criou os ceus e a terra." - Genesis 1:1 | @evangelhoemaudio',
    );
  });

  it("resolves the public image URL from the share URL origin", () => {
    expect(
      resolveBibleVerseShareImageUrl({
        abbrev: "gn",
        chapter: 1,
        verse: 1,
        shareUrl: "https://evangelhoemaudio.com/share/verse/gn/1/1",
      }),
    ).toBe(
      "https://evangelhoemaudio.com/api/share/verse/image?abbrev=gn&chapter=1&verse=1&bg=0",
    );
  });
});
