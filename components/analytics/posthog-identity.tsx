"use client";

import { useEffect, useRef } from "react";

import { usePathname } from "next/navigation";

import {
  captureAnalyticsEvent,
  identifyAnalyticsUser,
  onAnalyticsReady,
} from "@/lib/posthog-client";

interface SessionApiResponse {
  status: "success" | "error";
  data?: {
    authenticated: boolean;
    session: {
      family: {
        id: string;
        plan: string;
        authProvider: string;
        createdAt: string;
        requiresLegalAcceptance?: boolean | null;
      };
      profiles: Array<{
        id: string;
        type: string;
      }>;
      selectedProfile: {
        id: string;
        type: string;
      } | null;
    } | null;
  };
}

export function PostHogIdentity() {
  const pathname = usePathname();
  const identifiedFamilyId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function identifySession() {
      try {
        const response = await fetch("/api/session", {
          credentials: "include",
        });
        const payload = (await response.json()) as SessionApiResponse;
        const session = payload.data?.session;

        if (
          cancelled ||
          payload.status !== "success" ||
          !payload.data?.authenticated ||
          !session
        ) {
          return;
        }

        const familyId = session.family.id;

        if (!familyId || identifiedFamilyId.current === familyId) {
          return;
        }

        identifiedFamilyId.current = familyId;
        identifyAnalyticsUser(`family:${familyId}`, {
          plan: session.family.plan,
          auth_provider: session.family.authProvider,
          family_created_at: session.family.createdAt,
          profiles_count: session.profiles.length,
          selected_profile_type: session.selectedProfile?.type ?? null,
          requires_legal_acceptance: Boolean(session.family.requiresLegalAcceptance),
        });
        captureAnalyticsEvent("app_session_identified", {
          plan: session.family.plan,
          auth_provider: session.family.authProvider,
          profiles_count: session.profiles.length,
          selected_profile_type: session.selectedProfile?.type ?? null,
        });
      } catch {
        // Analytics must never block the product experience.
      }
    }

    const unsubscribe = onAnalyticsReady(() => {
      void identifySession();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [pathname]);

  return null;
}
