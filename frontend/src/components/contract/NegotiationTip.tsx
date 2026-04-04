"use client";

import { Lightbulb } from "lucide-react";

interface NegotiationTipProps {
  tip: string;
  clauseTitle?: string;
}

export function NegotiationTip({ tip, clauseTitle }: NegotiationTipProps) {
  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-blue-400 mb-1">
            {clauseTitle ? `Negotiation tip for "${clauseTitle}"` : "Negotiation Suggestion"}
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
        </div>
      </div>
    </div>
  );
}
