import { cn } from "../../lib/utils";
import { Button } from "./button";

export function EmptyState({ title, description, actionText, onAction, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-lg bg-surface-card", className)}>
      <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-foreground-secondary max-w-sm">{description}</p>
      {actionText && (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}

export function LoadingState({ text = "Loading...", className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-sm text-foreground-muted">{text}</p>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, onRetry, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-error-soft rounded-lg", className)}>
      <h3 className="text-lg font-semibold text-error">{title}</h3>
      {description && <p className="mt-1 text-sm text-foreground-secondary max-w-sm">{description}</p>}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-6 border-error text-error hover:bg-error hover:text-white">
          Try Again
        </Button>
      )}
    </div>
  );
}
