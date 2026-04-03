import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProfileSelection } from "@/components/profiles/profile-selection";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/app/logout-button", () => ({
  LogoutButton: () => <button type="button">Sair</button>,
}));

describe("ProfileSelection", () => {
  it("nao quebra quando a sessao chega sem lista de perfis", () => {
    render(
      <ProfileSelection
        session={
          {
            family: {
              id: "family-1",
              familyName: "Familia Silva",
              userName: "Joao",
              email: "joao@email.com",
              plan: "free",
              authProvider: "local",
              createdAt: "2026-03-18T00:00:00.000Z",
              updatedAt: "2026-03-18T00:00:00.000Z",
            },
            selectedProfile: null,
          } as never
        }
      />,
    );

    expect(screen.getByText("Adicionar perfil")).toBeInTheDocument();
    expect(screen.getByText("0/2")).toBeInTheDocument();
  });
});
