import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { APP_ROUTES } from "@/lib/constants";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({
    onSuccess,
  }: {
    onSuccess: (response: { credential?: string }) => void;
  }) => (
    <button type="button" onClick={() => onSuccess({ credential: "google-token" })}>
      Google mock
    </button>
  ),
}));

describe("GoogleLoginButton", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    vi.restoreAllMocks();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "google-client-id");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("exibe loading durante autenticacao no login", async () => {
    const user = userEvent.setup();
    let resolveFetch: ((value: Response) => void) | undefined;

    const fetchSpy = vi.spyOn(global, "fetch").mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    render(<GoogleLoginButton flow="login" />);

    await user.click(screen.getByRole("button", { name: "Google mock" }));

    expect(screen.getByRole("button", { name: "Entrando com Google..." })).toBeDisabled();

    resolveFetch?.(
      new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(APP_ROUTES.profiles);
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/auth/google",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
      }),
    );
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("exibe loading durante autenticacao no cadastro", async () => {
    const user = userEvent.setup();
    let resolveFetch: ((value: Response) => void) | undefined;

    vi.spyOn(global, "fetch").mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    render(<GoogleLoginButton flow="register" />);

    await user.click(screen.getByRole("button", { name: "Google mock" }));

    expect(screen.getByRole("button", { name: "Criando conta com Google..." })).toBeDisabled();

    resolveFetch?.(
      new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(APP_ROUTES.profiles);
    });
  });
});
