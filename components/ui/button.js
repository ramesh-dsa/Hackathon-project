import { cn } from "../../lib/utils";

/**
 * Reusable Button component mapped to the new Graphite + Copper design system
 * Accessible-by-default, supports variants and sizes without CVA.
 */
export function Button({ 
  className, 
  variant = "primary", 
  size = "medium", 
  as: Component = "button",
  children, 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
    secondary: "bg-surface-elevated text-foreground hover:bg-surface-hover",
    outline: "border border-border text-foreground hover:bg-surface-hover",
    ghost: "text-foreground hover:bg-surface-hover",
    destructive: "bg-error text-white hover:bg-error/90",
  };

  const sizes = {
    small: "h-8 px-3 text-xs",
    medium: "h-10 py-2 px-4",
    large: "h-12 px-8 text-base",
  };

  return (
    <Component
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
