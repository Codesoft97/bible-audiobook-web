export interface BiblePromise {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  promise: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface BiblePromiseStreamPayload {
  audioUrl: string;
}
