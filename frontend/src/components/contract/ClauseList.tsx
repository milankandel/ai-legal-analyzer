"use client";

import { useState } from "react";
import { Clause } from "@/lib/api";
import { ClauseCard } from "./ClauseCard";
import { cn } from "@/lib/utils";

interface ClauseListProps {
  clauses: Clause[];
  filter?: "ALL" | "HIGH" | "MEDIUM" | "LOW";
}

const FILTERS = ["ALL", "HIGH", "MEDIUM", "LOW"] as const;

export function ClauseList({ clauses }: ClauseListProps) {
  const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>("ALL");

  const filtered = clauses.filter((c) => {
    if (activeFilter === "ALL") return true;
    return c.risk_assessment?.risk_level?.toUpperCase() === activeFilter;
  });

  const counts = {
    ALL: clauses.length,
    HIGH: clauses.filter((c) => c.risk_assessment?.risk_level?.toUpperCase() === "HIGH").length,
    MEDIUM: clauses.filter((c) => c.risk_assessment?.risk_level?.toUpperCase() === "MEDIUM").length,
    LOW: clauses.filter((c) => c.risk_assessment?.risk_level?.toUpperCase() === "LOW").length,
  };

  const filterColors: Record<string, string> = {
    ALL: "text-slate-400 border-slate-700 hover:border-slate-500",
    HIGH: "text-red-400 border-red-500/30 hover:border-red-500/60",
    MEDIUM: "text-amber-400 border-amber-500/30 hover:border-amber-500/60",
    LOW: "text-green-400 border-green-500/30 hover:border-green-500/60",
  };

  const activeFilterColors: Record<string, string> = {
    ALL: "bg-slate-700 text-white border-slate-600",
    HIGH: "bg-red-500/20 text-red-400 border-red-500/40",
    MEDIUM: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    LOW: "bg-green-500/20 text-green-400 border-green-500/40",
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
              activeFilter === f ? activeFilterColors[f] : filterColors[f]
            )}
          >
            {f}
            <span className="bg-white/10 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Clauses */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            No {activeFilter !== "ALL" ? activeFilter.toLowerCase() + " risk" : ""} clauses found
          </p>
        ) : (
          filtered.map((clause) => (
            <ClauseCard
              key={clause.id}
              clause={clause}
              defaultExpanded={clause.risk_assessment?.risk_level?.toUpperCase() === "HIGH"}
            />
          ))
        )}
      </div>
    </div>
  );
}
