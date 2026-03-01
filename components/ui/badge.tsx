import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-highlight/25 bg-highlight/10 px-3 py-1 text-xs font-medium text-highlight",
        className,
      )}
    >
      {children}
    </span>
  );
}
