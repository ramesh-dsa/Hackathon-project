import { cn } from "../../lib/utils";

export function Badge({ children, className, variant = "default" }) {
  const variants = {
    default: "bg-surface-elevated text-foreground",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    error: "bg-error-soft text-error",
    info: "bg-info-soft text-info",
    brand: "bg-primary-soft text-primary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
