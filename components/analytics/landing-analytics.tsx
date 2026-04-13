"use client";

import { useEffect } from "react";

import { captureAnalyticsEvent, onAnalyticsReady } from "@/lib/posthog-client";

const SCROLL_DEPTHS = [25, 50, 75, 100] as const;

function normalizeLabel(value: string | null | undefined) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.slice(0, 80);
}

function getSection(element: Element) {
  const section = element.closest<HTMLElement>("section[id], header, footer");

  if (!section) {
    return "hero";
  }

  return section.id || section.tagName.toLowerCase();
}

function getSafeHref(element: Element) {
  if (!(element instanceof HTMLAnchorElement)) {
    return undefined;
  }

  if (element.protocol === "mailto:" || element.protocol === "tel:") {
    return element.protocol.replace(":", "");
  }

  if (element.origin === window.location.origin) {
    return `${element.pathname}${element.hash}`;
  }

  return element.origin;
}

function setupLandingAnalytics() {
  captureAnalyticsEvent("landing_view", {
    path: window.location.pathname,
    has_campaign_params: window.location.search.length > 0,
    referrer_host: document.referrer ? new URL(document.referrer).host : undefined,
  });

  function handleClick(event: MouseEvent) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const actionableElement = event.target.closest<HTMLElement>("a, button");

    if (!actionableElement) {
      return;
    }

    captureAnalyticsEvent("landing_click", {
      element_type: actionableElement.tagName.toLowerCase(),
      label: normalizeLabel(
        actionableElement.getAttribute("data-analytics-label") ??
          actionableElement.getAttribute("aria-label") ??
          actionableElement.textContent,
      ),
      href: getSafeHref(actionableElement),
      section: getSection(actionableElement),
    });
  }

  document.addEventListener("click", handleClick, true);

  const viewedSections = new Set<string>();
  const sectionObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) {
                return;
              }

              const section = entry.target.id;

              if (!section || viewedSections.has(section)) {
                return;
              }

              viewedSections.add(section);
              captureAnalyticsEvent("landing_section_view", { section });
            });
          },
          { threshold: 0.45 },
        )
      : null;

  document.querySelectorAll<HTMLElement>("section[id]").forEach((section) => {
    sectionObserver?.observe(section);
  });

  const reachedScrollDepths = new Set<number>();
  let animationFrame = 0;

  function captureScrollDepth() {
    const documentElement = document.documentElement;
    const scrollableHeight = documentElement.scrollHeight - window.innerHeight;
    const percentage =
      scrollableHeight <= 0
        ? 100
        : Math.round(
            ((window.scrollY + window.innerHeight) / documentElement.scrollHeight) * 100,
          );

    SCROLL_DEPTHS.forEach((depth) => {
      const requiredDepth = depth === 100 ? 95 : depth;

      if (percentage >= requiredDepth && !reachedScrollDepths.has(depth)) {
        reachedScrollDepths.add(depth);
        captureAnalyticsEvent("landing_scroll_depth", { depth });
      }
    });
  }

  function scheduleScrollDepthCapture() {
    if (animationFrame) {
      return;
    }

    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = 0;
      captureScrollDepth();
    });
  }

  scheduleScrollDepthCapture();
  window.addEventListener("scroll", scheduleScrollDepthCapture, { passive: true });
  window.addEventListener("resize", scheduleScrollDepthCapture);

  return () => {
    document.removeEventListener("click", handleClick, true);
    sectionObserver?.disconnect();
    window.removeEventListener("scroll", scheduleScrollDepthCapture);
    window.removeEventListener("resize", scheduleScrollDepthCapture);

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }
  };
}

export function LandingAnalytics() {
  useEffect(() => {
    let cleanupTracking: (() => void) | undefined;
    const unsubscribe = onAnalyticsReady(() => {
      if (cleanupTracking) {
        return;
      }

      cleanupTracking = setupLandingAnalytics();
    });

    return () => {
      unsubscribe();
      cleanupTracking?.();
    };
  }, []);

  return null;
}
