import { Text, Button } from "@mantine/core"
import { IconInbox } from "@tabler/icons-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title = "No data found",
  message,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
      <div className="text-gray-400 mb-4">
        {icon || <IconInbox size={64} stroke={1.5} />}
      </div>
      
      <Text size="lg" fw={600} className="mb-2 text-gray-700">
        {title}
      </Text>
      
      <Text size="sm" c="dimmed" className="mb-6 text-center max-w-md">
        {message}
      </Text>

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="light">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
