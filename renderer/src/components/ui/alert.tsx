import React from "react"
import { cn } from "../../lib/utils"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "success" | "info"
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-background text-foreground border-border",
      destructive: "border-red-500/50 text-red-800 bg-red-50 dark:border-red-500 dark:text-red-300 dark:bg-red-950/30",
      warning: "border-yellow-500/50 text-yellow-800 bg-yellow-50 dark:border-yellow-500 dark:text-yellow-300 dark:bg-yellow-950/30",
      success: "border-green-500/50 text-green-800 bg-green-50 dark:border-green-500 dark:text-green-300 dark:bg-green-950/30",
      info: "border-blue-500/50 text-blue-800 bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:bg-blue-950/30",
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

export const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"