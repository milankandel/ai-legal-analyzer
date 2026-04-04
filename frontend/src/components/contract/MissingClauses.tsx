"use client";

import { AlertCircle } from "lucide-react";

interface MissingClausesProps {
  missingClauses: string[];
}

export function MissingClauses({ missingClauses }: MissingClausesProps) {
  if (!missingClauses || missingClauses.length === 0) {
    return (
      <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-400">All standard clauses present</p>
          <p className="text-xs text-slate-400 mt-0.5">
            This contract contains all expected clauses for its type.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <p className="text-sm font-medium text-amber-400">
          {missingClauses.length} important clause{missingClauses.length > 1 ? "s" : ""} missing
        </p>
      </div>
      {missingClauses.map((clause, index) => {
        // clause may be "ClauseName — description" format
        const parts = clause.split(" — ");
        const title = parts[0];
        const description = parts[1];

        return (
          <div
            key={index}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-amber-400">!</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-300">{title}</p>
                {description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
