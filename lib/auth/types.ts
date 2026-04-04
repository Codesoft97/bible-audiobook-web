export type AuthProvider = "local" | "google";
export type PlanType = "free" | "paid";
export type ProfileType = "adult" | "child";

export interface FamilyLegalAcceptance {
  acceptedAt: string;
  termsVersion: string;
  policyVersion: string;
  source: string;
  locale: string;
}

export interface RequiredLegalDocuments {
  termsVersion: string;
  policyVersion: string;
}

export interface Family {
  id: string;
  familyName: string;
  userName: string;
  email: string;
  plan: PlanType;
  authProvider: AuthProvider;
  legalAcceptance?: FamilyLegalAcceptance | null;
  requiresLegalAcceptance?: boolean;
  requiredLegalDocuments?: RequiredLegalDocuments | null;
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

