import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "gold", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-200 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none",
          variant === "gold" && "text-[#060D1F] shadow-lg shadow-[rgba(201,169,122,0.2)] hover:shadow-[rgba(201,169,122,0.35)] hover:scale-[1.02] active:scale-[0.98]",
          variant === "ghost" && "border border-[rgba(201,169,122,0.2)] text-[#C9A97A] hover:bg-[rgba(201,169,122,0.08)] hover:border-[rgba(201,169,122,0.4)] active:scale-[0.98]",
          variant === "danger" && "border border-red-700/30 text-red-400 hover:bg-red-900/20 hover:border-red-600/50 active:scale-[0.98]",
          size === "sm" && "px-3.5 py-1.5 text-xs",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-8 py-3.5 text-base",
          className
        )}
        style={variant === "gold" ? {
          background: "linear-gradient(135deg, #D4B483 0%, #C9A97A 50%, #B8924A 100%)",
        } : undefined}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
