import { Badge } from "@mantine/core"

type OrderStatus = "RECEIVED" | "WASHING" | "DRYING" | "IRONING" | "READY" | "COLLECTED"

interface StatusBadgeProps {
  status: OrderStatus
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}

const statusConfig: Record<OrderStatus, { color: string; label: string }> = {
  RECEIVED: { color: "blue", label: "Received" },
  WASHING: { color: "cyan", label: "Washing" },
  DRYING: { color: "yellow", label: "Drying" },
  IRONING: { color: "orange", label: "Ironing" },
  READY: { color: "green", label: "Ready" },
  COLLECTED: { color: "gray", label: "Collected" }
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: "gray", label: status }

  return (
    <Badge color={config.color} size={size} variant="light">
      {config.label}
    </Badge>
  )
}

// Payment status badge
interface PaymentStatusBadgeProps {
  isPaid: boolean
  balance: number
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}

export function PaymentStatusBadge({ isPaid, balance, size = "sm" }: PaymentStatusBadgeProps) {
  if (isPaid || balance === 0) {
    return (
      <Badge color="green" size={size} variant="light">
        Paid
      </Badge>
    )
  }

  return (
    <Badge color="red" size={size} variant="light">
      Unpaid (₦{balance.toLocaleString()})
    </Badge>
  )
}
