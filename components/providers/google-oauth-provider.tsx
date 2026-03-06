"use client";

import type { PropsWithChildren } from "react";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function AppGoogleOAuthProvider({ children }: PropsWithChildren) {
  const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();

  if (!clientId) {
    return <>{children}</>;
  }

  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
