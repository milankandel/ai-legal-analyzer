"use client";

import { getScoreColor } from "@/lib/utils";

interface RiskGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function RiskGauge({ score, size = "md", showLabel = true }: RiskGaugeProps) {
  const color = getScoreColor(score);
  const label = score >= 7 ? "HIGH RISK" : score >= 4 ? "MEDIUM RISK" : "LOW RISK";

  const sizes = {
    sm: { r: 36, strokeWidth: 6, viewBox: 100, fontSize: "text-xl" },
    md: { r: 56, strokeWidth: 8, viewBox: 140, fontSize: "text-3xl" },
    lg: { r: 76, strokeWidth: 10, viewBox: 180, fontSize: "text-4xl" },
  };

  const { r, strokeWidth, viewBox, fontSize } = sizes[size];
  const cx = viewBox / 2;
  const cy = viewBox / 2;
  const circumference = 2 * Math.PI * r;
  // Use 75% of the circle (270 degrees) as the gauge arc
  const arcLength = circumference * 0.75;
  const filled = (score / 10) * arcLength;
  const gap = arcLength - filled;
  // Start at 135deg (bottom-left), go clockwise
  const rotation = 135;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: viewBox, height: viewBox }}>
        <svg
          width={viewBox}
          height={viewBox}
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          className="rotate-0"
        >
          {/* Background arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />
          {/* Filled arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 8px ${color}60)`, transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-bold`} style={{ color }}>
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500 font-medium">/10</span>
        </div>
      </div>
      {showLabel && (
        <div
          className="text-xs font-bold tracking-wider px-3 py-1 rounded-full border"
          style={{
            color,
            borderColor: `${color}40`,
            backgroundColor: `${color}15`,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
