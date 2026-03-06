export type HistoryContentType =
  | "bible"
  | "character-journey"
  | "parable"
  | "teaching";

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
