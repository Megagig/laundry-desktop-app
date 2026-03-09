import { useState } from "react"
import { Button, Group, Text, Card, TextInput, Select, NumberInput, Divider } from "@mantine/core"
import { 
  IconSearch, 
  IconCash, 
  IconPrinter,
  IconCheck
} from "@tabler/icons-react"
import { 
  LoadingSpinner, 
  EmptyState,
  StatusBadge
} from "../components/common"
import { useOrderStore } from "../store"

export default function Pickup() {
  const { updateOrderStatus } = useOrderStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<string>("order_number")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  // Payment state
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isCollecting, setIsCollecting] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a search term")
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setOrder(null)
    setOrderDetails(null)

    try {
      let result

      if (searchType === "order_number") {
        result = await window.api.order.getByNumber(searchQuery.trim())
      } else if (searchType === "phone") {
        // Search customer by phone, then get their latest order
        const customerResult = await window.api.customer.searchByPhone(searchQuery.trim())
        if (customerResult.success && customerResult.data.length > 0) {
          const customer = customerResult.data[0]
          const ordersResult = await window.api.customer.getOrderHistory(customer.id, 1)
          if (ordersResult.success && ordersResult.data.length > 0) {
            const orderId = ordersResult.data[0].id
            result = await window.api.order.getWithDetails(orderId)
          } else {
            setSearchError("No orders found for this customer")
            setIsSearching(false)
            return
          }
        } else {
          setSearchError("Customer not found")
          setIsSearching(false)
          return
        }
      } else {
        // Search by customer name
        const customerResult = await window.api.customer.searchByName(searchQuery.trim())
        if (customerResult.success && customerResult.data.length > 0) {
          const customer = customerResult.data[0]
          const ordersResult = await window.api.customer.getOrderHistory(customer.id, 1)
          if (ordersResult.success && ordersResult.data.length > 0) {
            const orderId = ordersResult.data[0].id
            result = await window.api.order.getWithDetails(orderId)
          } else {
            setSearchError("No orders found for this customer")
            setIsSearching(false)
            return
          }
        } else {
          setSearchError("Customer not found")
          setIsSearching(false)
          return
        }
      }

      if (result && result.success) {
        setOrder(result.data)
        setOrderDetails(result.data)
        setPaymentAmount(result.data.balance || 0)
      } else {
        setSearchError(result?.error || "Order not found")
      }
    } catch (error: any) {
      setSearchError(error.message || "Search failed")
    } finally {
      setIsSearching(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!order || paymentAmount <= 0) return

    setIsProcessingPayment(true)
    try {
      const result = await window.api.payment.record({
        order_id: order.id,
        amount: paymentAmount,
        method: paymentMethod,
        notes: "Payment on collection"
      })

      if (result.success) {
        // Refresh order details
        const updatedOrder = await window.api.order.getWithDetails(order.id)
        if (updatedOrder.success) {
          setOrder(updatedOrder.data)
          setOrderDetails(updatedOrder.data)
          setPaymentAmount(updatedOrder.data.balance || 0)
        }
      } else {
        setSearchError(result.error || "Payment failed")
      }
    } catch (error: any) {
      setSearchError(error.message || "Payment failed")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleMarkAsCollected = async () => {
    if (!order) return

    setIsCollecting(true)
    try {
      await updateOrderStatus(order.id, "COLLECTED")
      
      // Refresh order details
      const updatedOrder = await window.api.order.getWithDetails(order.id)
      if (updatedOrder.success) {
        setOrder(updatedOrder.data)
        setOrderDetails(updatedOrder.data)
      }
    } catch (error: any) {
      setSearchError(error.message || "Failed to mark as collected")
    } finally {
      setIsCollecting(false)
    }
  }

  const handlePrintReceipt = async () => {
    if (!order) return

    try {
      const result = await window.api.printer.printOrderReceipt(order.id, { preview: false })
      if (!result.success) {
        setSearchError(result.error || "Failed to print receipt")
      }
    } catch (error: any) {
      setSearchError(error.message || "Failed to print receipt")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Pickup / Collection</h1>
        <Text size="sm" c="dimmed">Search for orders ready for pickup</Text>
      </div>

      {/* Search Section */}
      <Card withBorder>
        <Text size="sm" fw={600} className="mb-3">Search Order</Text>
        
        <Group align="flex-end">
          <Select
            label="Search By"
            value={searchType}
            onChange={(value) => setSearchType(value || "order_number")}
            data={[
              { value: "order_number", label: "Order Number" },
              { value: "phone", label: "Phone Number" },
              { value: "name", label: "Customer Name" }
            ]}
            style={{ width: 180 }}
          />

          <TextInput
            label="Search"
            placeholder={
              searchType === "order_number" ? "Enter order number" :
              searchType === "phone" ? "Enter phone number" :
              "Enter customer name"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />

          <Button 
            leftSection={<IconSearch size={16} />}
            onClick={handleSearch}
            loading={isSearching}
          >
            Search
          </Button>
        </Group>

        {searchError && (
          <Text size="sm" c="red" className="mt-2">{searchError}</Text>
        )}
      </Card>

      {/* Order Display Section */}
      {isSearching ? (
        <LoadingSpinner />
      ) : order ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Details */}
          <Card withBorder>
            <Text size="lg" fw={600} className="mb-4">Order Details</Text>

            <div className="space-y-3">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Order Number:</Text>
                <Text size="sm" fw={600}>{order.order_number}</Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">Status:</Text>
                <StatusBadge status={order.status} />
              </Group>

              <Divider />

              <div>
                <Text size="sm" fw={600} className="mb-2">Customer</Text>
                <Text size="sm">{order.customer_name}</Text>
                <Text size="sm" c="dimmed">{order.customer_phone}</Text>
              </div>

              <Divider />

              <div>
                <Text size="sm" fw={600} className="mb-2">Items</Text>
                <div className="space-y-2">
                  {orderDetails?.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.service_name} × {item.quantity}</span>
                      <span>₦{item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Divider />

              <Group justify="space-between">
                <Text size="sm" c="dimmed">Pickup Date:</Text>
                <Text size="sm">{new Date(order.pickup_date).toLocaleDateString()}</Text>
              </Group>

              {order.notes && (
                <>
                  <Divider />
                  <div>
                    <Text size="sm" fw={600} className="mb-1">Notes:</Text>
                    <Text size="sm" c="dimmed">{order.notes}</Text>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Payment & Collection Section */}
          <div className="space-y-4">
            {/* Payment Summary */}
            <Card withBorder className={order.balance > 0 ? "bg-red-50" : "bg-green-50"}>
              <Text size="sm" fw={600} className="mb-3">Payment Summary</Text>

              <Group justify="space-between" className="mb-2">
                <Text size="sm">Total Amount:</Text>
                <Text size="sm" fw={600}>₦{order.total_amount.toLocaleString()}</Text>
              </Group>

              <Group justify="space-between" className="mb-2">
                <Text size="sm">Amount Paid:</Text>
                <Text size="sm">₦{order.amount_paid.toLocaleString()}</Text>
              </Group>

              <Divider className="my-3" />

              <Group justify="space-between">
                <Text size="lg" fw={700}>Balance Due:</Text>
                <Text 
                  size="xl" 
                  fw={700}
                  c={order.balance > 0 ? "red" : "green"}
                >
                  ₦{order.balance.toLocaleString()}
                </Text>
              </Group>
            </Card>

            {/* Payment Section */}
            {order.balance > 0 && order.status !== "COLLECTED" && (
              <Card withBorder>
                <Text size="sm" fw={600} className="mb-3">Record Payment</Text>

                <div className="space-y-3">
                  <NumberInput
                    label="Payment Amount"
                    value={paymentAmount}
                    onChange={(value) => setPaymentAmount(value as number || 0)}
                    min={0}
                    max={order.balance}
                    thousandSeparator=","
                    prefix="₦"
                  />

                  <Select
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={(value) => setPaymentMethod(value || "CASH")}
                    data={[
                      { value: "CASH", label: "Cash" },
                      { value: "CARD", label: "Card" },
                      { value: "BANK_TRANSFER", label: "Bank Transfer" },
                      { value: "MOBILE_MONEY", label: "Mobile Money" }
                    ]}
                  />

                  <Button
                    fullWidth
                    leftSection={<IconCash size={16} />}
                    onClick={handleRecordPayment}
                    loading={isProcessingPayment}
                    disabled={paymentAmount <= 0 || paymentAmount > order.balance}
                  >
                    Record Payment
                  </Button>
                </div>
              </Card>
            )}

            {/* Collection Actions */}
            <Card withBorder>
              <Text size="sm" fw={600} className="mb-3">Collection Actions</Text>

              <div className="space-y-2">
                {order.status !== "COLLECTED" && (
                  <Button
                    fullWidth
                    leftSection={<IconCheck size={16} />}
                    color="green"
                    onClick={handleMarkAsCollected}
                    loading={isCollecting}
                    disabled={order.status !== "READY"}
                  >
                    {order.status === "READY" ? "Mark as Collected" : "Order Not Ready"}
                  </Button>
                )}

                <Button
                  fullWidth
                  variant="light"
                  leftSection={<IconPrinter size={16} />}
                  onClick={handlePrintReceipt}
                >
                  Print Receipt
                </Button>

                {order.balance > 0 && (
                  <Text size="xs" c="orange" className="text-center mt-2">
                    ⚠️ Outstanding balance: ₦{order.balance.toLocaleString()}
                  </Text>
                )}

                {order.status === "COLLECTED" && (
                  <Text size="sm" c="green" className="text-center mt-2" fw={600}>
                    ✓ Order has been collected
                  </Text>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : !searchError ? (
        <EmptyState
          icon={<IconSearch size={48} />}
          title="Search for an order"
          message="Enter an order number, phone number, or customer name to begin"
        />
      ) : null}
    </div>
  )
}
