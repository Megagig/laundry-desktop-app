import { Modal, Button, Group, Text } from "@mantine/core"
import { IconAlertTriangle } from "@tabler/icons-react"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "red",
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <Modal
      opened={isOpen}
      onClose={onCancel}
      title={
        <div className="flex items-center gap-2">
          <IconAlertTriangle size={20} className="text-yellow-600" />
          <span className="font-semibold">{title}</span>
        </div>
      }
      centered
      size="sm"
    >
      <Text size="sm" className="mb-6">
        {message}
      </Text>

      <Group justify="flex-end" gap="sm">
        <Button 
          variant="subtle" 
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button 
          color={confirmColor} 
          onClick={onConfirm}
          loading={isLoading}
        >
          {confirmText}
        </Button>
      </Group>
    </Modal>
  )
}
