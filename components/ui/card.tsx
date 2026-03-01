import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends PropsWithChildren {
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn("surface rounded-[28px] p-6", className)}>{children}</div>;
}

