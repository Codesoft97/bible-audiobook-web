import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";
import { APP_ROUTES } from "@/lib/constants";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/auth/google-login-button", () => ({
  GoogleLoginButton: () => <div data-testid="google-login-button" />,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    vi.restoreAllMocks();
  });

  it("exibe erro de validacao e nao chama a API com dados invalidos", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch");

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "joao@email.com");
    await user.type(screen.getByLabelText("Senha"), "123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("A senha precisa ter pelo menos 8 caracteres."),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("submete com sucesso e redireciona para selecao de perfil", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "joao@email.com");
    await user.type(screen.getByLabelText("Senha"), "12345678");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(APP_ROUTES.profiles);
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("exibe erro quando nao consegue conectar ao servidor", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "joao@email.com");
    await user.type(screen.getByLabelText("Senha"), "12345678");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Nao foi possivel conectar ao servidor.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
