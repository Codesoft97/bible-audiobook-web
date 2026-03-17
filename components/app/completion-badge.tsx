"use client";

import { CheckCircle2, Clock3 } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompletionBadgeProps {
  completed: boolean | null;
  className?: string;
  incompleteLabel?: string;
}

export function CompletionBadge({
  completed,
  className,
  incompleteLabel = "Nao concluido",
}: CompletionBadgeProps) {
  if (completed === null) {
    return null;
  }

  if (completed) {
    return (
      <Badge className={cn("border-success/30 bg-success/10 text-success", className)}>
        <CheckCircle2 className="mr-1 size-3.5" />
        Concluido
      </Badge>
    );
  }

  return (
    <Badge className={cn("border-border/60 bg-background/75 text-muted-foreground", className)}>
      <Clock3 className="mr-1 size-3.5" />
      {incompleteLabel}
    </Badge>
  );
}
