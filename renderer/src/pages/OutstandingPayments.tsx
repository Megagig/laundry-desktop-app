import { useState, useEffect } from "react"
import { Button, Group, Text, Card, Table, Modal, NumberInput, Select } from "@mantine/core"
import { IconRefresh, IconCash, IconAlertCircle } from "@tabler/icons-react"
import { LoadingSpinner, EmptyState, StatusBadge } from "../components/common"

export default function OutstandingPayments() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchOutstandingOrders()
  }, [])

  const fetchOutstandingOrders = async () => {
    setIsLoading(true)
    try {
      const result = await window.api.payment.getOutstanding()
      if (result.success) {
        setOrders(result.data)
      }
    } catch (error) {
      console.error("Error fetching outstanding orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordPayment = (order: any) => {
    setSelectedOrder(order)
    setPaymentAmount(order.balance)
    setPaymentModalOpen(true)
  }

  const handleSubmitPayment = async () => {
    if (!selectedOrder || paymentAmount <= 0) return

    setIsProcessing(true)
    try {
      const result = await window.api.payment.record({
        order_id: selectedOrder.id,
        amount: paymentAmount,
        method: paymentMethod,
        notes: "Payment recorded from Outstanding Payments page"
      })

      if (result.success) {
        setPaymentModalOpen(false)
        setSelectedOrder(null)
        setPaymentAmount(0)
        fetchOutstandingOrders()
      }
    } catch (error) {
      console.error("Error recording payment:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const totalOutstanding = orders.reduce((sum, o) => sum + o.balance, 0)

  if (isLoading && orders.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <h1 className="text-2xl font-bold">Outstanding Payments</h1>
          <Text size="sm" c="dimmed">Orders with pending balance</Text>
        </div>
        <Button
          leftSection={<IconRefresh size={16} />}
          onClick={fetchOutstandingOrders}
          loading={isLoading}
          variant="light"
        >
          Refresh
        </Button>
      </Group>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card withBorder className="bg-red-50">
          <Group>
            <IconAlertCircle size={32} className="text-red-600" />
            <div>
              <Text size="sm" c="dimmed">Total Outstanding</Text>
              <Text size="xl" fw={700} c="red">₦{totalOutstanding.toLocaleString()}</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder>
          <Group>
            <IconCash size={32} className="text-blue-600" />
            <div>
              <Text size="sm" c="dimmed">Orders with Balance</Text>
              <Text size="xl" fw={700}>{orders.length}</Text>
            </div>
          </Group>
        </Card>
      </div>

      {/* Outstanding Orders Table */}
      {orders.length === 0 ? (
        <EmptyState
          icon={<IconCash size={48} />}
          title="No outstanding payments"
          message="All orders have been fully paid"
        />
      ) : (
        <Card withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Order Number</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Total Amount</Table.Th>
                <Table.Th>Amount Paid</Table.Th>
                <Table.Th>Balance</Table.Th>
                <Table.Th>Pickup Date</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders.map((order) => (
                <Table.Tr key={order.id || order.order_id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>{order.order_number}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{order.customer_name}</Text>
                    <Text size="xs" c="dimmed">{order.customer_phone}</Text>
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge status={order.status || 'pending'} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">₦{order.total_amount.toLocaleString()}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">₦{order.amount_paid.toLocaleString()}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={700} c="red">
                      ₦{order.balance.toLocaleString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {new Date(order.pickup_date).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      leftSection={<IconCash size={14} />}
                      onClick={() => handleRecordPayment(order)}
                    >
                      Record Payment
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* Payment Modal */}
      <Modal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Payment"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <Card withBorder className="bg-gray-50">
              <Text size="sm" c="dimmed">Order Number</Text>
              <Text size="lg" fw={600}>{selectedOrder.order_number}</Text>
              <Text size="sm" c="dimmed" className="mt-2">Customer</Text>
              <Text size="sm">{selectedOrder.customer_name}</Text>
              <Text size="sm" c="dimmed" className="mt-2">Outstanding Balance</Text>
              <Text size="xl" fw={700} c="red">
                ₦{selectedOrder.balance.toLocaleString()}
              </Text>
            </Card>

            <NumberInput
              label="Payment Amount"
              value={paymentAmount}
              onChange={(value) => setPaymentAmount(value as number || 0)}
              min={0}
              max={selectedOrder.balance}
              thousandSeparator=","
              prefix="₦"
              required
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
              required
            />

            <Group justify="flex-end" gap="sm" className="mt-6">
              <Button
                variant="subtle"
                onClick={() => setPaymentModalOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitPayment}
                loading={isProcessing}
                disabled={paymentAmount <= 0 || paymentAmount > selectedOrder.balance}
                leftSection={<IconCash size={16} />}
              >
                Record Payment
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  )
}
