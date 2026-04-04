import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(level: string): string {
  switch (level?.toUpperCase()) {
    case "HIGH":
      return "text-red-400";
    case "MEDIUM":
      return "text-amber-400";
    case "LOW":
      return "text-green-400";
    default:
      return "text-slate-400";
  }
}

export function getRiskBgColor(level: string): string {
  switch (level?.toUpperCase()) {
    case "HIGH":
      return "bg-red-500/10 border-red-500/30";
    case "MEDIUM":
      return "bg-amber-500/10 border-amber-500/30";
    case "LOW":
      return "bg-green-500/10 border-green-500/30";
    default:
      return "bg-slate-500/10 border-slate-500/30";
  }
}

export function getRiskHexColor(level: string): string {
  switch (level?.toUpperCase()) {
    case "HIGH":
      return "#ef4444";
    case "MEDIUM":
      return "#f59e0b";
    case "LOW":
      return "#22c55e";
    default:
      return "#94a3b8";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 7) return "#ef4444";
  if (score >= 4) return "#f59e0b";
  return "#22c55e";
}

export function formatClauseType(type: string): string {
  return type
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function truncate(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
