import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-2",
        {
          "bg-blue-600 hover:bg-blue-700 text-white": variant === "primary",
          "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700": variant === "secondary",
          "hover:bg-slate-800 text-slate-400 hover:text-white": variant === "ghost",
          "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30": variant === "danger",
        },
        {
          "text-xs px-3 py-1.5": size === "sm",
          "text-sm px-4 py-2": size === "md",
          "text-base px-6 py-3": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
