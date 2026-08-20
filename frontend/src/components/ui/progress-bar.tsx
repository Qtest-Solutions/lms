interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({ value, max = 100, size = "md", showLabel = false, className = "" }: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 rounded-[var(--radius-full)] bg-surface-variant overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="h-full rounded-[var(--radius-full)] bg-leaf-green transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="font-label-caps text-on-surface-variant whitespace-nowrap">{percentage}%</span>
      )}
    </div>
  );
}