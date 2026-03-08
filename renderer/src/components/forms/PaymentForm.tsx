import { useState } from "react"
import { NumberInput, Select, Textarea, Button, Group, Text } from "@mantine/core"
import { InlineError } from "../common/ErrorMessage"

interface PaymentFormProps {
  orderId: number
  orderNumber: string
  totalAmount: number
  amountPaid: number
  balance: number
  onSuccess?: (payment: any) => void
  onCancel?: () => void
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_MONEY", label: "Mobile Money" }
]

export default function PaymentForm({
  orderId,
  orderNumber,
  totalAmount,
  amountPaid,
  balance,
  onSuccess,
  onCancel
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: balance,
    method: "CASH",
    notes: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }

    if (formData.amount > balance) {
      newErrors.amount = `Amount cannot exceed balance of ₦${balance.toLocaleString()}`
    }

    if (!formData.method) {
      newErrors.method = "Please select a payment method"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      const result = await window.api.payment.record({
        order_id: orderId,
        amount: formData.amount,
        method: formData.method,
        notes: formData.notes || undefined
      })

      if (result.success) {
        onSuccess?.(result.data)
      } else {
        setErrors({ submit: result.error })
      }
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <Text size="sm" c="dimmed">Order Number:</Text>
          <Text size="sm" fw={600}>{orderNumber}</Text>
        </div>
        <div className="flex justify-between">
          <Text size="sm" c="dimmed">Total Amount:</Text>
          <Text size="sm">₦{totalAmount.toLocaleString()}</Text>
        </div>
        <div className="flex justify-between">
          <Text size="sm" c="dimmed">Amount Paid:</Text>
          <Text size="sm">₦{amountPaid.toLocaleString()}</Text>
        </div>
        <div className="flex justify-between border-t pt-2">
          <Text size="sm" fw={600}>Balance Due:</Text>
          <Text size="sm" fw={700} c="red">₦{balance.toLocaleString()}</Text>
        </div>
      </div>

      <NumberInput
        label="Payment Amount"
        placeholder="Enter amount"
        value={formData.amount}
        onChange={(value) => handleChange("amount", value || 0)}
        error={errors.amount}
        min={0}
        max={balance}
        required
        disabled={isLoading}
        thousandSeparator=","
        prefix="₦"
      />

      <Select
        label="Payment Method"
        placeholder="Select payment method"
        value={formData.method}
        onChange={(value) => handleChange("method", value || "CASH")}
        data={PAYMENT_METHODS}
        error={errors.method}
        required
        disabled={isLoading}
      />

      <Textarea
        label="Notes"
        placeholder="Payment notes (optional)"
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        minRows={2}
        disabled={isLoading}
      />

      {/* New Balance Preview */}
      {formData.amount > 0 && formData.amount <= balance && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <Text size="sm" c="dimmed" className="mb-1">New Balance After Payment:</Text>
          <Text size="lg" fw={700} c="blue">
            ₦{(balance - formData.amount).toLocaleString()}
          </Text>
        </div>
      )}

      {errors.submit && <InlineError message={errors.submit} />}

      <Group justify="flex-end" gap="sm">
        {onCancel && (
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isLoading} color="green">
          Record Payment
        </Button>
      </Group>
    </form>
  )
}
