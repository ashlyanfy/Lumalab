import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-[rgba(8,80,135,0.16)] bg-white/80 px-4 text-sm text-brand-900 placeholder:text-slate-400 transition focus-visible:outline-none focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-400/15",
          className,
        )}
        {...props}
      />
    );
  },
);
