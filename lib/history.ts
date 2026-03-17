export type HistoryContentType =
  | "bible"
  | "character-journey"
  | "parable"
  | "teaching";

export const HISTORY_PROGRESS_UPDATED_EVENT = "history-progress-updated";

export function buildHistoryContentKey(contentType: HistoryContentType, contentId: string) {
  return `${contentType}:${contentId}`;
}

export interface ListeningHistoryEntry {
  id: string;
  contentType: HistoryContentType;
  contentId: string;
  currentPositionSeconds: number;
  totalDurationSeconds: number;
  completed: boolean;
  lastListenedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListeningHistoryListPayload {
  items: ListeningHistoryEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface PlaybackProgressPayload {
  contentType: HistoryContentType;
  contentId: string;
  currentPositionSeconds: number;
  totalDurationSeconds: number;
}

export interface PlaybackProgressSnapshot extends PlaybackProgressPayload {
  completed: boolean;
  lastListenedAt: string;
}

export interface HistoryProgressUpdatedDetail extends PlaybackProgressSnapshot {
  contentType: HistoryContentType;
  contentId: string;
}
