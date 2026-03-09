import { useNavigate } from "react-router-dom"
import { Button, Group, Text } from "@mantine/core"
import { IconArrowLeft } from "@tabler/icons-react"
import { OrderForm } from "../components/forms"

export default function CreateOrder() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    // Navigate to orders list after successful creation
    navigate("/orders")
  }

  const handleCancel = () => {
    navigate("/orders")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Group>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </Button>
      </Group>

      <div>
        <h1 className="text-2xl font-bold">Create New Order</h1>
        <Text size="sm" c="dimmed">Fill in the details to create a new order</Text>
      </div>

      {/* Order Form */}
      <div className="max-w-4xl">
        <OrderForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
