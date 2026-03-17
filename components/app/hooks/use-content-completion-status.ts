"use client";

import { useCallback, useEffect, useState } from "react";

import type { ApiEnvelope } from "@/lib/auth/types";
import type {
  HistoryContentType,
  HistoryProgressUpdatedDetail,
  ListeningHistoryEntry,
  ListeningHistoryListPayload,
} from "@/lib/history";
import {
  buildHistoryContentKey,
  HISTORY_PROGRESS_UPDATED_EVENT,
} from "@/lib/history";

const HISTORY_PAGE_LIMIT = 100;

function appendHistoryItems(
  lookup: Record<string, boolean>,
  items: ListeningHistoryEntry[],
) {
  for (const item of items) {
    lookup[buildHistoryContentKey(item.contentType, item.contentId)] = item.completed;
  }

  return lookup;
}

export function useContentCompletionStatus() {
  const [completionLookup, setCompletionLookup] = useState<Record<string, boolean>>({});
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadHistorySnapshot() {
      const nextLookup: Record<string, boolean> = {};
      let offset = 0;

      while (active) {
        const response = await fetch(`/api/history?limit=${HISTORY_PAGE_LIMIT}&offset=${offset}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as ApiEnvelope<ListeningHistoryListPayload>;

        if (!response.ok || payload.status !== "success" || !payload.data) {
          return;
        }

        appendHistoryItems(nextLookup, payload.data.items);
        offset += payload.data.items.length;

        if (payload.data.items.length === 0 || offset >= payload.data.total) {
          break;
        }
      }

      if (!active) {
        return;
      }

      setCompletionLookup((current) => ({
        ...nextLookup,
        ...current,
      }));
      setHistoryLoaded(true);
    }

    function handleHistoryProgressUpdated(event: Event) {
      const detail = (event as CustomEvent<HistoryProgressUpdatedDetail>).detail;

      if (!detail) {
        return;
      }

      setCompletionLookup((current) => ({
        ...current,
        [buildHistoryContentKey(detail.contentType, detail.contentId)]: detail.completed,
      }));
    }

    window.addEventListener(
      HISTORY_PROGRESS_UPDATED_EVENT,
      handleHistoryProgressUpdated as EventListener,
    );

    void loadHistorySnapshot().catch(() => undefined);

    return () => {
      active = false;
      window.removeEventListener(
        HISTORY_PROGRESS_UPDATED_EVENT,
        handleHistoryProgressUpdated as EventListener,
      );
    };
  }, []);

  const getContentCompletion = useCallback(
    (contentType: HistoryContentType, contentId: string) => {
      const key = buildHistoryContentKey(contentType, contentId);

      if (Object.prototype.hasOwnProperty.call(completionLookup, key)) {
        return completionLookup[key];
      }

      if (!historyLoaded) {
        return null;
      }

      return false;
    },
    [completionLookup, historyLoaded],
  );

  return {
    historyLoaded,
    getContentCompletion,
  };
}
