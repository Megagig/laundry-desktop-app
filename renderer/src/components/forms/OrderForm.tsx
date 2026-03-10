import { useState, useEffect } from "react"
import { 
  TextInput, 
  NumberInput, 
  Select, 
  Button, 
  Group, 
  Text,
  Card,
  Divider,
  ActionIcon,
  Table
} from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { IconTrash, IconPlus, IconSearch } from "@tabler/icons-react"
import { useOrderStore, useServiceStore, useCustomerStore } from "../../store"
import { InlineError } from "../common/ErrorMessage"

interface OrderFormProps {
  onSuccess?: (order: any) => void
  onCancel?: () => void
}

export default function OrderForm({ onSuccess, onCancel }: OrderFormProps) {
  const {
    cart,
    selectedCustomerId,
    paymentType,
    amountPaid,
    pickupDate,
    notes,
    addToCart,
    updateCartItem,
    removeFromCart,
    setSelectedCustomer,
    setPaymentType,
    setAmountPaid,
    setPickupDate,
    setNotes,
    getCartTotal,
    getCartBalance,
    createOrder,
    resetOrderForm,
    isLoading
  } = useOrderStore()

  const { services, fetchServices } = useServiceStore()
  const { customers, searchCustomerByPhone } = useCustomerStore()

  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load services on mount
  useEffect(() => {
    fetchServices()
  }, [])

  // Calculate default pickup date (3 days from now)
  useEffect(() => {
    if (!pickupDate) {
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 3)
      setPickupDate(defaultDate.toISOString().split("T")[0])
    }
  }, [])

  const handleCustomerSearch = async () => {
    if (customerSearch.trim()) {
      await searchCustomerByPhone(customerSearch)
      // The results will be in the store, but we need to get them
      // For now, we'll handle this differently
    }
  }

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomer(customerId)
    setCustomerSearch("")
    if (errors.customer) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.customer
        return newErrors
      })
    }
  }

  const handleAddToCart = () => {
    if (!selectedService) {
      setErrors(prev => ({ ...prev, service: "Please select a service" }))
      return
    }

    const service = services.find(s => s.id === selectedService)
    if (!service) return

    addToCart({
      service_id: service.id,
      service_name: service.name,
      quantity,
      price: service.price
    })

    // Reset service selection
    setSelectedService(null)
    setQuantity(1)
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.service
      return newErrors
    })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedCustomerId) {
      newErrors.customer = "Please select a customer"
    }

    if (cart.length === 0) {
      newErrors.cart = "Please add at least one item"
    }

    if (!pickupDate) {
      newErrors.pickupDate = "Please select a pickup date"
    }

    if (amountPaid < 0) {
      newErrors.amountPaid = "Amount paid cannot be negative"
    }

    if (amountPaid > getCartTotal()) {
      newErrors.amountPaid = "Amount paid cannot exceed total"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent, shouldPrint = false) => {
    e.preventDefault()

    if (!validate()) return

    try {
      const order = await createOrder()
      
      // Print receipt if requested
      if (shouldPrint && order) {
        try {
          await window.api.printer.printOrderReceipt(order.id, { preview: false })
        } catch (printError) {
          console.error("Print error:", printError)
          // Don't fail the order creation if printing fails
        }
      }
      
      onSuccess?.(order)
    } catch (error: any) {
      setErrors({ submit: error.message })
    }
  }

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <Card withBorder>
        <Text size="sm" fw={600} className="mb-3">Customer Information</Text>
        
        {!selectedCustomerId ? (
          <div className="space-y-3">
            <Group>
              <TextInput
                placeholder="Search by phone number"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCustomerSearch()}
                className="flex-1"
              />
              <Button onClick={handleCustomerSearch} leftSection={<IconSearch size={16} />}>
                Search
              </Button>
            </Group>

            {customers.length > 0 && customerSearch && (
              <div className="border rounded p-2 space-y-2">
                {customers.map(customer => (
                  <div
                    key={customer.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => handleSelectCustomer(customer.id)}
                  >
                    <Text size="sm" fw={500}>{customer.name}</Text>
                    <Text size="xs" c="dimmed">{customer.phone}</Text>
                  </div>
                ))}
              </div>
            )}

            {errors.customer && <InlineError message={errors.customer} />}
          </div>
        ) : (
          <div className="bg-blue-50 p-3 rounded">
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={600}>{selectedCustomer?.name}</Text>
                <Text size="xs" c="dimmed">{selectedCustomer?.phone}</Text>
              </div>
              <Button size="xs" variant="subtle" onClick={() => setSelectedCustomer(null)}>
                Change
              </Button>
            </Group>
          </div>
        )}
      </Card>

      {/* Add Items */}
      <Card withBorder>
        <Text size="sm" fw={600} className="mb-3">Add Items</Text>
        
        <Group align="flex-end">
          <Select
            label="Service"
            placeholder="Select service"
            value={selectedService?.toString()}
            onChange={(value) => setSelectedService(value ? parseInt(value) : null)}
            data={services.map(s => ({
              value: s.id.toString(),
              label: `${s.name} - ₦${s.price.toLocaleString()}`
            }))}
            className="flex-1"
            searchable
          />

          <NumberInput
            label="Quantity"
            value={quantity}
            onChange={(value) => setQuantity(value as number || 1)}
            min={1}
            style={{ width: 100 }}
          />

          <Button onClick={handleAddToCart} leftSection={<IconPlus size={16} />}>
            Add
          </Button>
        </Group>

        {errors.service && <InlineError message={errors.service} />}
      </Card>

      {/* Cart */}
      {cart.length > 0 && (
        <Card withBorder>
          <Text size="sm" fw={600} className="mb-3">Order Items</Text>
          
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Service</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Subtotal</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {cart.map(item => (
                <Table.Tr key={item.service_id}>
                  <Table.Td>{item.service_name}</Table.Td>
                  <Table.Td>₦{item.price.toLocaleString()}</Table.Td>
                  <Table.Td>
                    <NumberInput
                      value={item.quantity}
                      onChange={(value) => updateCartItem(item.service_id, value as number || 1)}
                      min={1}
                      size="xs"
                      style={{ width: 70 }}
                    />
                  </Table.Td>
                  <Table.Td>₦{item.subtotal.toLocaleString()}</Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeFromCart(item.service_id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {errors.cart && <InlineError message={errors.cart} />}
        </Card>
      )}

      {/* Payment & Pickup */}
      <Card withBorder>
        <Text size="sm" fw={600} className="mb-3">Payment & Pickup Details</Text>
        
        <div className="space-y-4">
          <Select
            label="Payment Type"
            value={paymentType}
            onChange={(value) => setPaymentType(value || "FULL_PAYMENT")}
            data={[
              { value: "FULL_PAYMENT", label: "Full Payment" },
              { value: "ADVANCE_PAYMENT", label: "Advance Payment" },
              { value: "PAY_ON_COLLECTION", label: "Pay on Collection" }
            ]}
            required
          />

          <NumberInput
            label="Amount Paid"
            value={amountPaid}
            onChange={(value) => setAmountPaid(value as number || 0)}
            min={0}
            max={getCartTotal()}
            thousandSeparator=","
            prefix="₦"
            error={errors.amountPaid}
          />

          <DateInput
            label="Pickup Date"
            value={pickupDate ? new Date(pickupDate) : null}
            onChange={(value) => setPickupDate(value || "")}
            minDate={new Date()}
            required
            error={errors.pickupDate}
          />

          <TextInput
            label="Notes"
            placeholder="Special instructions (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </Card>

      {/* Order Summary */}
      {cart.length > 0 && (
        <Card withBorder className="bg-gray-50">
          <Text size="sm" fw={600} className="mb-3">Order Summary</Text>
          
          <div className="space-y-2">
            <Group justify="space-between">
              <Text size="sm">Total Amount:</Text>
              <Text size="sm" fw={600}>₦{getCartTotal().toLocaleString()}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Amount Paid:</Text>
              <Text size="sm">₦{amountPaid.toLocaleString()}</Text>
            </Group>
            <Divider />
            <Group justify="space-between">
              <Text size="sm" fw={700}>Balance:</Text>
              <Text size="lg" fw={700} c={getCartBalance() > 0 ? "red" : "green"}>
                ₦{getCartBalance().toLocaleString()}
              </Text>
            </Group>
          </div>
        </Card>
      )}

      {errors.submit && <InlineError message={errors.submit} />}

      <Group justify="flex-end" gap="sm">
        {onCancel && (
          <Button variant="subtle" onClick={() => { resetOrderForm(); onCancel(); }} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          loading={isLoading} 
          size="lg"
          onClick={(e) => handleSubmit(e, false)}
        >
          Save Order
        </Button>
        <Button 
          type="button"
          loading={isLoading} 
          size="lg"
          color="green"
          onClick={(e) => handleSubmit(e, true)}
        >
          Save & Print Receipt
        </Button>
      </Group>
    </form>
  )
}
