export const FEEDBACK_CATEGORIES = [
  "bug",
  "melhoria",
  "funcionalidade nova",
  "comentario geral",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export interface Feedback {
  id: string;
  profileId: string;
  category: FeedbackCategory;
  description: string;
  createdAt: string;
  updatedAt: string;
}
