"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, Info } from "lucide-react";
import { Clause } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { NegotiationTip } from "./NegotiationTip";
import { cn, formatClauseType, getRiskBgColor } from "@/lib/utils";

interface ClauseCardProps {
  clause: Clause;
  defaultExpanded?: boolean;
}

export function ClauseCard({ clause, defaultExpanded = false }: ClauseCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const risk = clause.risk_assessment;
  const riskLevel = risk?.risk_level?.toUpperCase() || "LOW";

  const badgeVariant =
    riskLevel === "HIGH" ? "high" : riskLevel === "MEDIUM" ? "medium" : "low";

  return (
    <div
      className={cn(
        "border rounded-xl overflow-hidden transition-all",
        getRiskBgColor(riskLevel)
      )}
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={badgeVariant}>
              {riskLevel}
            </Badge>
            {risk && (
              <span className="text-xs font-bold" style={{
                color: riskLevel === "HIGH" ? "#ef4444" : riskLevel === "MEDIUM" ? "#f59e0b" : "#22c55e"
              }}>
                {risk.risk_score.toFixed(1)}/10
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{clause.title}</p>
            <p className="text-xs text-slate-400">{formatClauseType(clause.clause_type)}</p>
          </div>
        </div>
        {risk?.concern && (
          <p className="hidden sm:block text-xs text-slate-400 max-w-xs truncate flex-1">
            {risk.concern}
          </p>
        )}
        <div className="shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Plain English */}
          {clause.plain_english && (
            <div className="bg-slate-800/60 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">Plain English</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{clause.plain_english}</p>
            </div>
          )}

          {/* Original clause text */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Original Text</p>
            <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-900/60 rounded p-3 border border-slate-800">
              {clause.text}
            </p>
          </div>

          {/* Risk details */}
          {risk && (
            <div className="space-y-3">
              {risk.why_risky && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1">Why This Is Risky</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{risk.why_risky}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Negotiation tip */}
              {risk.negotiation_suggestion && (
                <NegotiationTip
                  tip={risk.negotiation_suggestion}
                  clauseTitle={clause.title}
                />
              )}
            </div>
          )}

          {clause.page_number && (
            <p className="text-xs text-slate-600">Page {clause.page_number}</p>
          )}
        </div>
      )}
    </div>
  );
}
