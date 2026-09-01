import { cn } from "../../lib/utils";

export function Avatar({ src, alt, fallback, className, size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-surface-elevated",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-medium text-foreground-muted">
          {fallback}
        </span>
      )}
    </div>
  );
}
