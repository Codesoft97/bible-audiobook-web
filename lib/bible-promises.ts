export interface BiblePromise {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  promise: string;
  category: string;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BiblePromiseStreamPayload {
  audioUrl: string;
}
