import { Alert } from "@mantine/core"
import { IconAlertCircle, IconX } from "@tabler/icons-react"

interface ErrorMessageProps {
  title?: string
  message: string
  onClose?: () => void
  variant?: "light" | "filled" | "outline"
}

export default function ErrorMessage({ 
  title = "Error", 
  message, 
  onClose,
  variant = "light"
}: ErrorMessageProps) {
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title={title}
      color="red"
      variant={variant}
      withCloseButton={!!onClose}
      onClose={onClose}
      className="mb-4"
    >
      {message}
    </Alert>
  )
}

// Inline error message for forms
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
      <IconX size={14} />
      <span>{message}</span>
    </div>
  )
}
