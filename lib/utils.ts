import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPlanLabel(plan: string) {
  if (plan === "paid") {
    return "Plano Pago";
  }

  return "Plano Free";
}

export function formatProfileTypeLabel(type: string) {
  return type === "child" ? "Infantil" : "Adulto";
}
