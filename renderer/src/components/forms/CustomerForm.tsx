import { useState, useEffect } from "react"
import { TextInput, Textarea, Button, Group } from "@mantine/core"
import { useCustomerStore } from "../../store"
import { InlineError } from "../common/ErrorMessage"

interface CustomerFormProps {
  customerId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CustomerForm({ customerId, onSuccess, onCancel }: CustomerFormProps) {
  const { createCustomer, updateCustomer, fetchCustomerById, selectedCustomer, isLoading } = useCustomerStore()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load customer data if editing
  useEffect(() => {
    if (customerId) {
      fetchCustomerById(customerId)
    }
  }, [customerId])

  useEffect(() => {
    if (selectedCustomer && customerId) {
      setFormData({
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        address: selectedCustomer.address || "",
        notes: selectedCustomer.notes || ""
      })
    }
  }, [selectedCustomer, customerId])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      if (customerId) {
        await updateCustomer(customerId, formData)
      } else {
        await createCustomer(formData)
      }
      
      // Reset form
      setFormData({ name: "", phone: "", address: "", notes: "" })
      setErrors({})
      
      onSuccess?.()
    } catch (error: any) {
      setErrors({ submit: error.message })
    }
  }

  const handleChange = (field: string, value: string) => {
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
        label="Customer Name"
        placeholder="Enter customer name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        error={errors.name}
        required
        disabled={isLoading}
      />

      <TextInput
        label="Phone Number"
        placeholder="e.g., 08012345678"
        value={formData.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
        error={errors.phone}
        required
        disabled={isLoading}
      />

      <TextInput
        label="Address"
        placeholder="Enter customer address (optional)"
        value={formData.address}
        onChange={(e) => handleChange("address", e.target.value)}
        disabled={isLoading}
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
          {customerId ? "Update Customer" : "Add Customer"}
        </Button>
      </Group>
    </form>
  )
}
