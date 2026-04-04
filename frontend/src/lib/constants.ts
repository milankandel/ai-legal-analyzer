export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const RISK_LEVELS = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;

export const CLAUSE_TYPES = [
  "indemnification",
  "limitation_of_liability",
  "non_compete",
  "termination",
  "IP_ownership",
  "payment",
  "confidentiality",
  "dispute_resolution",
  "governing_law",
  "force_majeure",
] as const;

export const CONTRACT_TYPES = [
  { value: "saas", label: "SaaS / Software Subscription" },
  { value: "employment", label: "Employment Agreement" },
  { value: "nda", label: "Non-Disclosure Agreement" },
  { value: "partnership", label: "Partnership Agreement" },
  { value: "vendor", label: "Vendor / Supplier Agreement" },
  { value: "general", label: "General Contract" },
] as const;

export const LEGAL_DISCLAIMER =
  "This analysis is for informational purposes only and does not constitute legal advice. " +
  "Always consult a qualified attorney before signing any legal agreement.";

export const RISK_GAUGE_THRESHOLDS = {
  LOW: { min: 1, max: 3.9 },
  MEDIUM: { min: 4, max: 6.9 },
  HIGH: { min: 7, max: 10 },
};
