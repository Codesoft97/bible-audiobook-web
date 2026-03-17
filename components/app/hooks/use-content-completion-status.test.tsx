import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useContentCompletionStatus } from "@/components/app/hooks/use-content-completion-status";
import {
  HISTORY_PROGRESS_UPDATED_EVENT,
  type HistoryContentType,
  type HistoryProgressUpdatedDetail,
  type ListeningHistoryEntry,
} from "@/lib/history";

function createHistoryEntry(overrides: Partial<ListeningHistoryEntry>): ListeningHistoryEntry {
  return {
    id: "history-entry-1",
    contentType: "character-journey",
    contentId: "journey-1",
    currentPositionSeconds: 600,
    totalDurationSeconds: 900,
    completed: false,
    lastListenedAt: "2026-03-17T19:00:00.000Z",
    createdAt: "2026-03-17T19:00:00.000Z",
    updatedAt: "2026-03-17T19:00:00.000Z",
    ...overrides,
  };
}

function CompletionProbe({
  contentType,
  contentId,
}: {
  contentType: HistoryContentType;
  contentId: string;
}) {
  const { getContentCompletion } = useContentCompletionStatus();
  const completion = getContentCompletion(contentType, contentId);

  return (
    <div data-testid="completion-state">
      {completion === null ? "unknown" : completion ? "completed" : "pending"}
    </div>
  );
}

describe("useContentCompletionStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("carrega o historico e resolve o status concluido do conteudo", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "success",
          data: {
            items: [
              createHistoryEntry({
                contentType: "parable",
                contentId: "parable-7",
                completed: true,
              }),
            ],
            total: 1,
            limit: 100,
            offset: 0,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    render(<CompletionProbe contentType="parable" contentId="parable-7" />);

    expect(screen.getByTestId("completion-state")).toHaveTextContent("unknown");
    expect(await screen.findByText("completed")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/history?limit=100&offset=0", {
      cache: "no-store",
    });
  });

  it("atualiza o status quando recebe o evento de progresso do player", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "success",
          data: {
            items: [],
            total: 0,
            limit: 100,
            offset: 0,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    render(<CompletionProbe contentType="teaching" contentId="teaching-9" />);

    await waitFor(() => {
      expect(screen.getByTestId("completion-state")).toHaveTextContent("pending");
    });

    const detail: HistoryProgressUpdatedDetail = {
      contentType: "teaching",
      contentId: "teaching-9",
      currentPositionSeconds: 1200,
      totalDurationSeconds: 1200,
      completed: true,
      lastListenedAt: "2026-03-17T20:00:00.000Z",
    };

    act(() => {
      window.dispatchEvent(
        new CustomEvent<HistoryProgressUpdatedDetail>(HISTORY_PROGRESS_UPDATED_EVENT, {
          detail,
        }),
      );
    });

    expect(screen.getByTestId("completion-state")).toHaveTextContent("completed");
  });
});
