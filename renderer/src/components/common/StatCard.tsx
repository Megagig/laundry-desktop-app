import { Text } from "@mantine/core"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  color?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  onClick?: () => void
}

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
  green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-100" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-100" },
  red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-100" },
}

export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
  trend,
  subtitle,
  onClick
}: StatCardProps) {
  const colors = colorClasses[color] || colorClasses.blue

  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-200 p-8
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:shadow-xl hover:-translate-y-1" : "shadow-md hover:shadow-lg"}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <Text size="md" className="text-gray-600 font-semibold mb-2 uppercase tracking-wide">
            {title}
          </Text>
        </div>
        {icon && (
          <div className={`${colors.bg} ${colors.icon} p-4 rounded-xl border ${colors.border} shadow-sm`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mb-3">
        <Text className="text-4xl font-bold text-gray-900">
          {value}
        </Text>
      </div>

      {(trend || subtitle) && (
        <div className="flex items-center gap-3 mt-4">
          {trend && (
            <div className="flex items-center gap-1.5">
              {trend.isPositive ? (
                <IconTrendingUp size={18} className="text-green-600" />
              ) : (
                <IconTrendingDown size={18} className="text-red-600" />
              )}
              <Text
                size="sm"
                className={`font-semibold ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {Math.abs(trend.value)}%
              </Text>
            </div>
          )}
          {subtitle && (
            <Text size="sm" className="text-gray-500 font-medium">
              {subtitle}
            </Text>
          )}
        </div>
      )}
    </div>
  )
}
