import { Card, Text, Group } from "@mantine/core"
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

export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
  trend,
  subtitle,
  onClick
}: StatCardProps) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
      onClick={onClick}
    >
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>
        {icon && (
          <div className={`text-${color}-600`}>
            {icon}
          </div>
        )}
      </Group>

      <Text size="xl" fw={700} className="mb-2">
        {value}
      </Text>

      {(trend || subtitle) && (
        <Group gap="xs">
          {trend && (
            <Group gap={4}>
              {trend.isPositive ? (
                <IconTrendingUp size={16} className="text-green-600" />
              ) : (
                <IconTrendingDown size={16} className="text-red-600" />
              )}
              <Text
                size="xs"
                c={trend.isPositive ? "green" : "red"}
                fw={500}
              >
                {Math.abs(trend.value)}%
              </Text>
            </Group>
          )}
          {subtitle && (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Group>
      )}
    </Card>
  )
}
