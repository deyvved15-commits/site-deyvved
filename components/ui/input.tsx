import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className="text-[10px] tracking-[3px] uppercase text-[rgba(201,169,122,0.7)] font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-200",
            "placeholder-[rgba(255,255,255,0.2)]",
            "border focus:ring-2 focus:ring-[rgba(201,169,122,0.15)]",
            error
              ? "bg-[rgba(239,68,68,0.05)] border-red-500/40 focus:border-red-400/60"
              : "bg-[rgba(255,255,255,0.04)] border-[rgba(201,169,122,0.18)] focus:border-[rgba(201,169,122,0.5)] focus:bg-[rgba(255,255,255,0.06)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export { Input };
