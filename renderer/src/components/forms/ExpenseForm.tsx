import { useState } from "react"
import { TextInput, NumberInput, Select, Textarea, Button, Group } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { InlineError } from "../common/ErrorMessage"

interface ExpenseFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const EXPENSE_CATEGORIES = [
  { value: "DETERGENT", label: "Detergent" },
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "FUEL", label: "Fuel" },
  { value: "STAFF_SALARY", label: "Staff Salary" },
  { value: "MACHINE_REPAIR", label: "Machine Repair" },
  { value: "RENT", label: "Rent" },
  { value: "WATER", label: "Water" },
  { value: "OTHER", label: "Other" }
]

export default function ExpenseForm({ onSuccess, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    amount: 0,
    category: "",
    date: new Date(),
    notes: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Expense title is required"
    }

    if (formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }

    if (!formData.category) {
      newErrors.category = "Please select a category"
    }

    if (!formData.date) {
      newErrors.date = "Please select a date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      const result = await window.api.expense.create({
        title: formData.title,
        amount: formData.amount,
        category: formData.category,
        date: formData.date.toISOString().split("T")[0],
        notes: formData.notes || undefined
      })

      if (result.success) {
        // Reset form
        setFormData({
          title: "",
          amount: 0,
          category: "",
          date: new Date(),
          notes: ""
        })
        setErrors({})
        onSuccess?.()
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
      <TextInput
        label="Expense Title"
        placeholder="e.g., Detergent Purchase"
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
        error={errors.title}
        required
        disabled={isLoading}
      />

      <NumberInput
        label="Amount (₦)"
        placeholder="Enter amount"
        value={formData.amount}
        onChange={(value) => handleChange("amount", value || 0)}
        error={errors.amount}
        min={0}
        required
        disabled={isLoading}
        thousandSeparator=","
        prefix="₦"
      />

      <Select
        label="Category"
        placeholder="Select category"
        value={formData.category}
        onChange={(value) => handleChange("category", value || "")}
        data={EXPENSE_CATEGORIES}
        error={errors.category}
        required
        disabled={isLoading}
      />

      <DateInput
        label="Date"
        placeholder="Select date"
        value={formData.date}
        onChange={(value) => handleChange("date", value || new Date())}
        error={errors.date}
        required
        disabled={isLoading}
        maxDate={new Date()}
      />

      <Textarea
        label="Notes"
        placeholder="Additional notes (optional)"
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        minRows={3}
        disabled={isLoading}
      />

      {errors.submit && <InlineError message={errors.submit} />}

      <Group justify="flex-end" gap="sm">
        {onCancel && (
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          Add Expense
        </Button>
      </Group>
    </form>
  )
}
