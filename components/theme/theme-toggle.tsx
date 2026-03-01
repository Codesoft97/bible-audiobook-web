"use client";

import { useEffect, useState } from "react";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button type="button" variant="secondary" size="icon" aria-label="Alternar tema">
        <span className="size-4" aria-hidden="true" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label="Alternar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
    </Button>
  );
}
