import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPlanLabel(plan: string) {
  return plan === "paid" ? "Plano Pago" : "Plano Free";
}

export function formatProfileTypeLabel(type: string) {
  return type === "child" ? "Infantil" : "Adulto";
}
