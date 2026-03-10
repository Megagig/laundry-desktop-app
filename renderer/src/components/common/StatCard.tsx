import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { cn } from "../../lib/utils"

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
  sparklineData?: number[]
}

const colorClasses: Record<string, { bg: string; icon: string; accent: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", accent: "bg-blue-500" },
  green: { bg: "bg-emerald-50", icon: "text-emerald-600", accent: "bg-emerald-500" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", accent: "bg-orange-500" },
  red: { bg: "bg-red-50", icon: "text-red-600", accent: "bg-red-500" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", accent: "bg-purple-500" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", accent: "bg-indigo-500" },
}

export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
  trend,
  subtitle,
  onClick,
  sparklineData
}: StatCardProps) {
  const colors = colorClasses[color] || colorClasses.blue

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0 shadow-sm",
        onClick && "cursor-pointer hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-900">
                {value}
              </h3>
              {trend && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  trend.isPositive 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-red-100 text-red-700"
                )}>
                  {trend.isPositive ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              colors.bg
            )}>
              <div className={colors.icon}>
                {icon}
              </div>
            </div>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4">
            <div className="flex items-end gap-1 h-8">
              {sparklineData.map((value, index) => (
                <div
                  key={index}
                  className={cn("flex-1 rounded-sm", colors.accent)}
                  style={{
                    height: `${(value / Math.max(...sparklineData)) * 100}%`,
                    opacity: 0.7 + (index / sparklineData.length) * 0.3
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Accent line */}
        <div className={cn("absolute bottom-0 left-0 right-0 h-1", colors.accent)} />
      </CardContent>
    </Card>
  )
}