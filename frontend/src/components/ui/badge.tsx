import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "high" | "medium" | "low" | "outline";
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border",
        {
          "bg-slate-800 text-slate-300 border-slate-700": variant === "default",
          "bg-red-500/15 text-red-400 border-red-500/30": variant === "high",
          "bg-amber-500/15 text-amber-400 border-amber-500/30": variant === "medium",
          "bg-green-500/15 text-green-400 border-green-500/30": variant === "low",
          "bg-transparent text-slate-400 border-slate-700": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
