import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "outline"
  size?: "sm" | "md" | "lg"
}

const statusConfig: Record<string, { variant: any; className: string }> = {
  // Order statuses
  pending: { variant: "warning", className: "bg-amber-100 text-amber-800 border-amber-200" },
  processing: { variant: "info", className: "bg-blue-100 text-blue-800 border-blue-200" },
  ready: { variant: "success", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  delivered: { variant: "success", className: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { variant: "destructive", className: "bg-red-100 text-red-800 border-red-200" },
  
  // Payment statuses
  paid: { variant: "success", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  unpaid: { variant: "warning", className: "bg-amber-100 text-amber-800 border-amber-200" },
  partial: { variant: "info", className: "bg-blue-100 text-blue-800 border-blue-200" },
  overdue: { variant: "destructive", className: "bg-red-100 text-red-800 border-red-200" },
  
  // General statuses
  active: { variant: "success", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  inactive: { variant: "secondary", className: "bg-slate-100 text-slate-800 border-slate-200" },
  draft: { variant: "secondary", className: "bg-slate-100 text-slate-800 border-slate-200" },
}

export default function StatusBadge({ 
  status, 
  variant = "default",
  size = "md" 
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_')
  const config = statusConfig[normalizedStatus] || statusConfig.draft

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  }

  return (
    <Badge
      variant={variant === "outline" ? "outline" : config.variant}
      className={cn(
        "font-medium capitalize border",
        variant === "outline" ? "bg-transparent" : config.className,
        sizeClasses[size]
      )}
    >
      {status}
    </Badge>
  )
}

// Alias for payment-specific status badge
export const PaymentStatusBadge = StatusBadge