import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "soft" | "secondary";
  size?: "sm" | "md";
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: "bg-surface-variant text-on-surface-variant",
  success: "bg-leaf-green/20 text-[#004d00] dark:text-leaf-green",
  warning: "bg-soft-peach/40 text-[#7a4a00] dark:text-soft-peach",
  error: "bg-error-container text-on-error-container",
  info: "bg-sky-tint/50 text-[#004e8c] dark:text-sky-tint",
  soft: "bg-primary/8 text-on-surface-variant",
  secondary: "bg-secondary-container text-on-secondary-container",
};

const sizeClasses: Record<string, string> = {
  sm: "px-2 py-0.5 text-label-caps",
  md: "px-3 py-1 text-label-caps",
};

export function Badge({ children, variant = "default", size = "sm", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-[var(--radius-full)] font-semibold ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}