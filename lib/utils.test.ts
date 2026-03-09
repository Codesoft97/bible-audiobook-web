import { describe, expect, it } from "vitest";

import { cn, formatPlanLabel, formatProfileTypeLabel } from "@/lib/utils";

describe("lib/utils", () => {
  it("mescla classes Tailwind removendo conflitos", () => {
    const value = cn("px-2", "px-4", "text-sm");

    expect(value).toContain("px-4");
    expect(value).toContain("text-sm");
    expect(value).not.toContain("px-2");
  });

  it("retorna o rotulo correto para o plano", () => {
    expect(formatPlanLabel("paid")).toBe("Plano Pago");
    expect(formatPlanLabel("free")).toBe("Plano Free");
  });

  it("retorna o rotulo correto para o tipo de perfil", () => {
    expect(formatProfileTypeLabel("child")).toBe("Infantil");
    expect(formatProfileTypeLabel("adult")).toBe("Adulto");
  });
});
