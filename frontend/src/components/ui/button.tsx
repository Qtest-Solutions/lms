import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-90 active:opacity-80",
  secondary: "bg-white text-on-surface border border-outline-variant hover:bg-surface-container-highest dark:bg-surface-container dark:text-on-surface",
  ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-high",
  danger: "bg-error text-on-error hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-body-sm rounded-[var(--radius-md)]",
  md: "px-5 py-2.5 text-body-sm font-semibold rounded-[var(--radius-lg)]",
  lg: "px-6 py-3 text-body-lg font-semibold rounded-[var(--radius-lg)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";