import { API_BASE_URL } from "./constants";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health
  health: () => fetchAPI<{ status: string }>("/api/health"),

  // Contracts
  uploadContract: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${API_BASE_URL}/api/contracts/upload`, {
      method: "POST",
      body: form,
    }).then((r) => r.json());
  },

  analyzeContract: (contractId: string, contractType: string = "general") =>
    fetchAPI<{ contract: Contract; analysis: ContractAnalysis }>(
      "/api/contracts/analyze",
      {
        method: "POST",
        body: JSON.stringify({ contract_id: contractId, contract_type: contractType }),
      }
    ),

  compareContracts: (contractAId: string, contractBId: string) =>
    fetchAPI<ComparisonResult>("/api/contracts/compare", {
      method: "POST",
      body: JSON.stringify({ contract_a_id: contractAId, contract_b_id: contractBId }),
    }),

  listContracts: () =>
    fetchAPI<{ contracts: ContractSummary[]; total: number }>("/api/contracts"),

  getContract: (id: string) =>
    fetchAPI<{ contract: Contract; analysis: ContractAnalysis | null }>(
      `/api/contracts/${id}`
    ),

  // Clauses
  explainClause: (clauseText: string, context?: string, contractType?: string) =>
    fetchAPI<ExplainClauseResponse>("/api/clauses/explain", {
      method: "POST",
      body: JSON.stringify({
        clause_text: clauseText,
        context,
        contract_type: contractType || "general",
      }),
    }),

  assessClauseRisk: (clauseText: string, clauseType?: string, contractType?: string) =>
    fetchAPI<RiskAssessment>("/api/clauses/risk", {
      method: "POST",
      body: JSON.stringify({
        clause_text: clauseText,
        clause_type: clauseType || "other",
        contract_type: contractType || "general",
      }),
    }),

  // Templates
  checkTemplate: (contractId: string) =>
    fetchAPI<TemplateCheckResponse>(`/api/templates/check/${contractId}`),
};

// Types
export interface ContractSummary {
  id: string;
  filename: string;
  analyzed: boolean;
  contract_type: string;
}

export interface RiskAssessment {
  clause_id: string;
  risk_score: number;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  concern: string;
  recommendation: string;
  issue_description: string;
  why_risky: string;
  negotiation_suggestion: string;
}

export interface Clause {
  id: string;
  clause_type: string;
  title: string;
  text: string;
  page_number?: number;
  plain_english?: string;
  risk_assessment?: RiskAssessment;
}

export interface Contract {
  id: string;
  filename: string;
  contract_type: string;
  parties: string[];
  effective_date?: string;
  term?: string;
  governing_law?: string;
  clauses: Clause[];
  uploaded_at: string;
  analyzed: boolean;
}

export interface ContractAnalysis {
  contract_id: string;
  overall_risk_score: number;
  risk_distribution: { HIGH: number; MEDIUM: number; LOW: number };
  clause_risks: RiskAssessment[];
  missing_clauses: string[];
  key_concerns: string[];
  summary: string;
  analyzed_at: string;
}

export interface ComparisonResult {
  contract_a_id: string;
  contract_b_id: string;
  added_clauses: ClauseDiff[];
  removed_clauses: ClauseDiff[];
  modified_clauses: ClauseDiff[];
  ai_summary: string;
  more_favorable: string;
  key_changes: string[];
  compared_at: string;
}

export interface ClauseDiff {
  clause_type: string;
  title: string;
  change_type: "added" | "removed" | "modified";
  original_text?: string;
  new_text?: string;
  diff_summary: string;
}

export interface ExplainClauseResponse {
  plain_english: string;
  key_points: string[];
  implications: string;
}

export interface TemplateCheckResponse {
  contract_id: string;
  contract_type: string;
  missing_clauses: string[];
  present_clauses: string[];
  compliance_score: number;
  recommendations: string[];
}
