import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  compact?: boolean;
  priority?: boolean;
}

const LOGO_SRC = "/Logo%20Voz%20da%20palavra%20-%20SVG.svg";

export function Logo({ className, compact = false, priority = false }: LogoProps) {
  return (
    <div
      className={cn(
        "relative",
        compact ? "h-11 w-11" : "h-16 w-full max-w-[300px] sm:h-20",
        className,
      )}
    >
      <Image
        src={LOGO_SRC}
        alt="Voz da Palavra"
        fill
        priority={priority}
        unoptimized
        sizes={compact ? "44px" : "(max-width: 640px) 220px, 300px"}
        className={cn("object-contain", compact ? "object-center" : "object-left")}
      />
    </div>
  );
}
