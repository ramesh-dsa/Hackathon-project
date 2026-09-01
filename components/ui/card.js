import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-surface-card text-foreground shadow-card", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, as: Component = "h3", ...props }) {
  return (
    <Component
      className={cn("text-xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-sm text-foreground-secondary", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  );
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}
