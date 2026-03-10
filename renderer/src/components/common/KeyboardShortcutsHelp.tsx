import { Modal, Text, Table, Badge } from "@mantine/core"
import { IconKeyboard } from "@tabler/icons-react"

interface KeyboardShortcutsHelpProps {
  opened: boolean
  onClose: () => void
}

export default function KeyboardShortcutsHelp({ opened, onClose }: KeyboardShortcutsHelpProps) {
  const shortcuts = [
    { keys: ["Ctrl", "N"], description: "Create New Order" },
    { keys: ["Ctrl", "H"], description: "Go to Dashboard" },
    { keys: ["Ctrl", "K"], description: "Go to Customers" },
    { keys: ["Ctrl", "O"], description: "Go to Orders" },
    { keys: ["Ctrl", "Shift", "P"], description: "Go to Pickup" },
    { keys: ["Ctrl", "F"], description: "Focus Search" },
    { keys: ["Ctrl", "P"], description: "Print (when available)" },
    { keys: ["ESC"], description: "Close Modal" },
  ]

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconKeyboard size={20} />
          <Text fw={600}>Keyboard Shortcuts</Text>
        </div>
      }
      size="md"
    >
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Shortcut</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {shortcuts.map((shortcut, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <div style={{ display: "flex", gap: "4px" }}>
                  {shortcut.keys.map((key, i) => (
                    <Badge key={i} variant="light" size="sm">
                      {key}
                    </Badge>
                  ))}
                </div>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{shortcut.description}</Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Text size="xs" c="dimmed" mt="md">
        Note: Use Cmd instead of Ctrl on macOS
      </Text>
    </Modal>
  )
}
