import { useNavigate } from "react-router-dom"
import { Button, Text } from "@mantine/core"
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button
          variant="subtle"
          size="lg"
          leftSection={<IconArrowLeft size={20} />}
          onClick={() => navigate("/orders")}
          className="mb-6"
        >
          Back to Orders
        </Button>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Order</h1>
        <Text className="text-lg text-gray-600">Fill in the details to create a new order</Text>
      </div>

      {/* Order Form */}
      <div className="max-w-5xl">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
          <OrderForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}
