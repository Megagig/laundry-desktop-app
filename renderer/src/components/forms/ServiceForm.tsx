import { useState, useEffect } from "react"
import { TextInput, NumberInput, Textarea, Select, Button, Group } from "@mantine/core"
import { useServiceStore } from "../../store"
import { InlineError } from "../common/ErrorMessage"

interface ServiceFormProps {
  service?: any
  onSuccess?: () => void
  onCancel?: () => void
}

const SERVICE_CATEGORIES = [
  { value: "Washing", label: "Washing" },
  { value: "Dry Cleaning", label: "Dry Cleaning" },
  { value: "Ironing", label: "Ironing" },
  { value: "Folding", label: "Folding" },
  { value: "Special Care", label: "Special Care" }
]

export default function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const { createService, updateService, isLoading } = useServiceStore()

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    category: "",
    description: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load service data if editing
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        price: service.price,
        category: service.category || "",
        description: service.description || ""
      })
    } else {
      setFormData({
        name: "",
        price: 0,
        category: "",
        description: ""
      })
    }
  }, [service])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required"
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      if (service) {
        await updateService(service.id, formData)
      } else {
        await createService(formData)
      }
      
      // Reset form
      setFormData({ name: "", price: 0, category: "", description: "" })
      setErrors({})
      
      onSuccess?.()
    } catch (error: any) {
      setErrors({ submit: error.message })
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
        label="Service Name"
        placeholder="e.g., Wash Shirt"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        error={errors.name}
        required
        disabled={isLoading}
      />

      <NumberInput
        label="Price (₦)"
        placeholder="Enter price"
        value={formData.price}
        onChange={(value) => handleChange("price", value || 0)}
        error={errors.price}
        min={0}
        required
        disabled={isLoading}
        thousandSeparator=","
      />

      <Select
        label="Category"
        placeholder="Select category"
        value={formData.category}
        onChange={(value) => handleChange("category", value || "")}
        data={SERVICE_CATEGORIES}
        disabled={isLoading}
        clearable
      />

      <Textarea
        label="Description"
        placeholder="Service description (optional)"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
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
          {service ? "Update Service" : "Add Service"}
        </Button>
      </Group>
    </form>
  )
}
