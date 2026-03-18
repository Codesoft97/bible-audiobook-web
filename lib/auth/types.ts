export type AuthProvider = "local" | "google";
export type PlanType = "free" | "free_trial" | "paid";
export type ProfileType = "adult" | "child";

export interface Family {
  id: string;
  familyName: string;
  userName: string;
  email: string;
  plan: PlanType;
  authProvider: AuthProvider;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  familyId: string;
  name: string;
  type: ProfileType;
  createdAt: string;
  updatedAt: string;
}

export interface AppSession {
  family: Family;
  profiles: Profile[];
  selectedProfile: Profile | null;
}

export interface SessionTokens {
  token: string;
  refreshToken: string;
}

export interface ApiEnvelope<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export interface AuthResponse {
  family: Family;
  profiles?: Profile[];
  isNewFamily?: boolean;
}

