import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPlanLabel(plan: string) {
  if (plan === "paid") {
    return "Plano Pago";
  }

  if (plan === "free_trial") {
    return "Periodo de Teste";
  }

  return "Plano Free";
}

export function formatProfileTypeLabel(type: string) {
  return type === "child" ? "Infantil" : "Adulto";
}
