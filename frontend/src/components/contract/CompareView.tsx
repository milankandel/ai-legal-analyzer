"use client";

import { ComparisonResult, ClauseDiff } from "@/lib/api";
import { cn, formatClauseType } from "@/lib/utils";
import { Plus, Minus, ArrowLeftRight, ThumbsUp, ThumbsDown } from "lucide-react";

interface CompareViewProps {
  result: ComparisonResult;
  contractAName?: string;
  contractBName?: string;
}

function DiffItem({ diff }: { diff: ClauseDiff }) {
  const styles = {
    added: { icon: Plus, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", label: "ADDED" },
    removed: { icon: Minus, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "REMOVED" },
    modified: { icon: ArrowLeftRight, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "CHANGED" },
  };

  const style = styles[diff.change_type];
  const Icon = style.icon;

  return (
    <div className={cn("border rounded-lg p-4 space-y-3", style.bg)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", style.color)} />
        <span className={cn("text-xs font-bold", style.color)}>{style.label}</span>
        <span className="text-sm font-semibold text-white">{diff.title}</span>
        <span className="text-xs text-slate-500">{formatClauseType(diff.clause_type)}</span>
      </div>
      <p className="text-xs text-slate-400">{diff.diff_summary}</p>
      {diff.change_type === "modified" && (
        <div className="grid grid-cols-2 gap-3">
          {diff.original_text && (
            <div>
              <p className="text-xs font-semibold text-red-400 mb-1">Contract A</p>
              <p className="text-xs text-slate-400 bg-red-500/5 rounded p-2 line-clamp-3 font-mono">
                {diff.original_text}
              </p>
            </div>
          )}
          {diff.new_text && (
            <div>
              <p className="text-xs font-semibold text-green-400 mb-1">Contract B</p>
              <p className="text-xs text-slate-400 bg-green-500/5 rounded p-2 line-clamp-3 font-mono">
                {diff.new_text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CompareView({ result, contractAName = "Contract A", contractBName = "Contract B" }: CompareViewProps) {
  const totalChanges = result.added_clauses.length + result.removed_clauses.length + result.modified_clauses.length;

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      {result.ai_summary && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-400 mb-3">AI Analysis Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{result.ai_summary}</p>

          {result.more_favorable && (
            <div className="mt-4 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-green-400" />
              <p className="text-sm font-medium text-green-400">
                {result.more_favorable === "contract_b" ? contractBName : contractAName} is more favorable
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{result.added_clauses.length}</p>
          <p className="text-xs text-slate-400 mt-1">Added Clauses</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{result.removed_clauses.length}</p>
          <p className="text-xs text-slate-400 mt-1">Removed Clauses</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{result.modified_clauses.length}</p>
          <p className="text-xs text-slate-400 mt-1">Modified Clauses</p>
        </div>
      </div>

      {/* Key changes */}
      {result.key_changes?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Key Changes</h3>
          <ul className="space-y-2">
            {result.key_changes.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                {change}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All diffs */}
      {totalChanges > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white mb-3">All Changes ({totalChanges})</h3>
          {[...result.added_clauses, ...result.modified_clauses, ...result.removed_clauses].map((diff, i) => (
            <DiffItem key={i} diff={diff} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          No differences found between the contracts
        </div>
      )}
    </div>
  );
}
