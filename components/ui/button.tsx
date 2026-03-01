import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/50",
  secondary:
    "border border-highlight/25 bg-accent text-accent-foreground hover:border-highlight/40 hover:bg-highlight/12 focus-visible:ring-highlight/30",
  ghost:
    "bg-transparent text-foreground hover:bg-accent/85 hover:text-accent-foreground focus-visible:ring-highlight/25",
  danger:
    "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
  icon: "size-11",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, size = "default", variant = "primary", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
});
