import type { PropsWithChildren, ReactNode } from "react";

import Link from "next/link";

import { Card } from "@/components/ui/card";

interface AuthShellProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <Card className="w-full max-w-xl space-y-8 p-8 md:p-10">
      <div className="space-y-4">
        <div className="inline-flex rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-highlight">
          {eyebrow}
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">{title}</h2>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
      <div className="border-t border-border/70 pt-5 text-sm text-muted-foreground">{footer}</div>
    </Card>
  );
}

export function AuthFooterLink({
  href,
  label,
  action,
}: {
  href: string;
  label: string;
  action: string;
}) {
  return (
    <p>
      {label}{" "}
      <Link className="font-medium text-primary transition hover:opacity-80" href={href}>
        {action}
      </Link>
    </p>
  );
}
