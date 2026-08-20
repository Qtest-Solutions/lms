import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", glass = false, onClick }: CardProps) {
  const base = glass ? "flowmark-card-glass" : "flowmark-card";
  const interactive = onClick ? "cursor-pointer hover:shadow-card-hover transition-shadow duration-200" : "";

  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      {children}
    </div>
  );
}