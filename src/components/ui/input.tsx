import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-label-caps text-on-surface-variant">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-[var(--radius-lg)] border border-outline-variant outline-none transition-all duration-200 placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary text-body-sm ${className}`}
        {...props}
      />
      {error && <span className="text-error text-body-sm mt-0.5">{error}</span>}
    </div>
  )
);
Input.displayName = "Input";