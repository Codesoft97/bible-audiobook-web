import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FeedbackFab } from "@/components/app/feedback-fab";

describe("FeedbackFab", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("envia feedback com sucesso", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "success",
          data: {
            id: "feedback-1",
            profileId: "profile-1",
            category: "melhoria",
            description: "Seria bom ter mais filtros.",
            createdAt: "2026-03-19T12:00:00.000Z",
            updatedAt: "2026-03-19T12:00:00.000Z",
          },
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    render(<FeedbackFab />);

    await user.click(screen.getByRole("button", { name: /abrir feedback/i }));
    await user.click(screen.getByRole("button", { name: /melhoria/i }));
    await user.type(
      screen.getByLabelText(/descricao/i),
      "Seria bom ter mais filtros.",
    );
    await user.click(
      screen.getByRole("button", { name: /enviar feedback/i }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "melhoria",
          description: "Seria bom ter mais filtros.",
        }),
      });
    });

    expect(
      await screen.findByText("Feedback enviado com sucesso."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /conte o que podemos melhorar/i }),
    ).not.toBeInTheDocument();
  });

  it("mostra erro de validacao antes do envio", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(global, "fetch");

    render(<FeedbackFab />);

    await user.click(screen.getByRole("button", { name: /abrir feedback/i }));
    await user.click(
      screen.getByRole("button", { name: /enviar feedback/i }),
    );

    expect(
      await screen.findByText("Descreva o feedback."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
