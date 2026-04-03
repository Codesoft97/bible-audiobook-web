import { describe, expect, it } from "vitest";

import {
  canConsumeContent,
  filterConsumableContent,
  hasConsumableContent,
} from "@/lib/content-access";

describe("lib/content-access", () => {
  it("permite consumir conteudo gratis para usuarios free", () => {
    expect(canConsumeContent(true, false)).toBe(true);
  });

  it("bloqueia conteudo pago para usuarios free", () => {
    expect(canConsumeContent(false, false)).toBe(false);
  });

  it("filtra e detecta conteudos consumiveis corretamente", () => {
    const items = [
      { id: "1", isFree: false },
      { id: "2", isFree: true },
    ];

    expect(hasConsumableContent(items, false)).toBe(true);
    expect(filterConsumableContent(items, false)).toEqual([{ id: "2", isFree: true }]);
    expect(filterConsumableContent(items, true)).toEqual(items);
  });
});
