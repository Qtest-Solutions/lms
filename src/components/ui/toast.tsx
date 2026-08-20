import { IconCheckCircle, IconAlertCircle, IconZap, IconX } from "@/lib/icons";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

const styles: Record<ToastType, { icon: typeof IconCheckCircle; iconColor: string; border: string }> = {
  success: {
    icon: IconCheckCircle,
    iconColor: "text-leaf-green",
    border: "border-leaf-green/30",
  },
  error: {
    icon: IconAlertCircle,
    iconColor: "text-error",
    border: "border-error/30",
  },
  info: {
    icon: IconZap,
    iconColor: "text-primary",
    border: "border-primary/30",
  },
};

export function Toast({ type, message, onClose }: ToastProps) {
  const { icon: Icon, iconColor, border } = styles[type];
  return (
    <div className={`flowmark-card border-l-4 ${border} p-4 pr-3 flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] shadow-card-hover`} role="status">
      <Icon size={20} className={`${iconColor} shrink-0 mt-0.5`} />
      <p className="flex-1 text-body-sm text-on-surface leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-[var(--radius-sm)] text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <IconX size={16} />
      </button>
    </div>
  );
}