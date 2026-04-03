import type { AnchorHTMLAttributes } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app/app-shell";
import type { AppSession } from "@/lib/auth/types";

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/app/audiobook-browser", () => ({
  AudiobookBrowser: () => <div>Catalogo</div>,
}));

vi.mock("@/components/app/history-panel", () => ({
  HistoryPanel: () => <div>Historico visivel</div>,
}));

vi.mock("@/components/app/feedback-fab", () => ({
  FeedbackFab: () => null,
}));

vi.mock("@/components/app/logout-button", () => ({
  LogoutButton: () => <button type="button">Sair</button>,
}));

vi.mock("@/components/logo", () => ({
  Logo: () => <div>Logo</div>,
}));

vi.mock("@/components/theme/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}));

const baseSession: AppSession = {
  family: {
    id: "family-1",
    familyName: "Familia Teste",
    userName: "Joao",
    email: "joao@example.com",
    plan: "free",
    authProvider: "local",
    createdAt: "2026-04-02T10:00:00.000Z",
    updatedAt: "2026-04-02T10:00:00.000Z",
  },
  profiles: [
    {
      id: "profile-1",
      familyId: "family-1",
      name: "Joao",
      type: "adult",
      createdAt: "2026-04-02T10:00:00.000Z",
      updatedAt: "2026-04-02T10:00:00.000Z",
    },
  ],
  selectedProfile: {
    id: "profile-1",
    familyId: "family-1",
    name: "Joao",
    type: "adult",
    createdAt: "2026-04-02T10:00:00.000Z",
    updatedAt: "2026-04-02T10:00:00.000Z",
  },
};

describe("AppShell", () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(min-width: 1024px)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("permite abrir o historico no plano free", async () => {
    const user = userEvent.setup();

    render(
      <AppShell
        session={baseSession}
        initialAudiobooks={[]}
        initialBibleTextBooks={[]}
        initialBibleTextReadingState={null}
        initialCharacterJourneys={[]}
        initialParables={[]}
        initialTeachings={[]}
      />,
    );

    expect(screen.getByText("Catalogo")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Historico" }));

    expect(screen.getByText("Historico visivel")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
