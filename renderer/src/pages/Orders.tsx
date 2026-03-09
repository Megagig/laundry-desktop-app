import { useEffect, useState } from "react"
import { Button, Group, Text, Modal, ActionIcon, Select } from "@mantine/core"
import { 
  IconPlus, 
  IconSearch, 
  IconEye,
  IconCash,
  IconPrinter
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { useOrderStore } from "../store"
import { 
  DataTable, 
  SearchInput, 
  LoadingSpinner, 
  ErrorMessage, 
  EmptyState,
  StatusBadge
} from "../components/common"

export default function Orders() {
  const navigate = useNavigate()
  const {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus
  } = useOrderStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
    setLoadingDetails(true)
    
    // Fetch full order details with items
    const result = await window.api.order.getWithDetails(order.id)
    if (result.success) {
      setOrderDetails(result.data)
    }
    setLoadingDetails(false)
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus)
    fetchOrders()
    
    // Refresh detail view if open
    if (selectedOrder && selectedOrder.id === orderId) {
      const result = await window.api.order.getWithDetails(orderId)
      if (result.success) {
        setOrderDetails(result.data)
        setSelectedOrder(result.data)
      }
    }
  }

  const columns = [
    {
      key: "order_number",
      label: "Order #",
      render: (order: any) => (
        <Text size="sm" fw={600}>{order.order_number}</Text>
      )
    },
    {
      key: "customer",
      label: "Customer",
      render: (order: any) => (
        <div>
          <Text size="sm" fw={500}>{order.customer_name || "N/A"}</Text>
          <Text size="xs" c="dimmed">{order.customer_phone || ""}</Text>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (order: any) => (
        <StatusBadge status={order.status} />
      )
    },
    {
      key: "total_amount",
      label: "Total",
      render: (order: any) => (
        <Text size="sm" fw={500}>₦{order.total_amount.toLocaleString()}</Text>
      )
    },
    {
      key: "balance",
      label: "Balance",
      render: (order: any) => (
        <Text 
          size="sm" 
          fw={500}
          c={order.balance > 0 ? "red" : "green"}
        >
          ₦{order.balance.toLocaleString()}
        </Text>
      )
    },
    {
      key: "pickup_date",
      label: "Pickup Date",
      render: (order: any) => (
        <Text size="sm">{new Date(order.pickup_date).toLocaleDateString()}</Text>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (order: any) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleViewOrder(order)}
          >
            <IconEye size={16} />
          </ActionIcon>
          {order.balance > 0 && (
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={() => {/* TODO: Open payment modal */}}
            >
              <IconCash size={16} />
            </ActionIcon>
          )}
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={async () => {
              try {
                await window.api.printer.printOrderReceipt(order.id, { preview: false })
              } catch (error) {
                console.error("Print error:", error)
              }
            }}
          >
            <IconPrinter size={16} />
          </ActionIcon>
        </Group>
      )
    }
  ]

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <Text size="sm" c="dimmed">Manage all customer orders</Text>
        </div>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate("/orders/new")}
        >
          New Order
        </Button>
      </Group>

      {/* Filters */}
      <Group>
        <SearchInput
          placeholder="Search by order # or customer..."
          onSearch={handleSearch}
        />
        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value || "ALL")}
          data={[
            { value: "ALL", label: "All Orders" },
            { value: "RECEIVED", label: "Received" },
            { value: "WASHING", label: "Washing" },
            { value: "DRYING", label: "Drying" },
            { value: "IRONING", label: "Ironing" },
            { value: "READY", label: "Ready" },
            { value: "COLLECTED", label: "Collected" }
          ]}
          style={{ width: 200 }}
        />
      </Group>

      {/* Orders Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<IconSearch size={48} />}
          title={searchQuery || statusFilter !== "ALL" ? "No orders found" : "No orders yet"}
          message={searchQuery || statusFilter !== "ALL" ? "Try adjusting your filters" : "Create your first order to get started"}
          actionLabel={searchQuery || statusFilter !== "ALL" ? undefined : "Create Order"}
          onAction={searchQuery || statusFilter !== "ALL" ? undefined : () => navigate("/orders/new")}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          itemsPerPage={15}
          keyExtractor={(order: any) => order.id}
        />
      )}

      {/* Order Detail Modal */}
      <Modal
        opened={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedOrder(null)
          setOrderDetails(null)
        }}
        title="Order Details"
        size="lg"
      >
        {loadingDetails ? (
          <LoadingSpinner />
        ) : orderDetails ? (
          <div className="space-y-4">
            {/* Order Info */}
            <div className="bg-gray-50 p-4 rounded">
              <Group justify="space-between" className="mb-2">
                <Text size="lg" fw={600}>{orderDetails.order_number}</Text>
                <StatusBadge status={orderDetails.status} />
              </Group>
              <Text size="sm" c="dimmed">
                Created: {new Date(orderDetails.created_at).toLocaleString()}
              </Text>
              <Text size="sm" c="dimmed">
                Pickup: {new Date(orderDetails.pickup_date).toLocaleDateString()}
              </Text>
            </div>

            {/* Customer Info */}
            <div>
              <Text size="sm" fw={600} className="mb-2">Customer</Text>
              <div className="bg-gray-50 p-3 rounded">
                <Text size="sm" fw={500}>{orderDetails.customer_name}</Text>
                <Text size="sm" c="dimmed">{orderDetails.customer_phone}</Text>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <Text size="sm" fw={600} className="mb-2">Items</Text>
              <div className="space-y-2">
                {orderDetails.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div>
                      <Text size="sm" fw={500}>{item.service_name}</Text>
                      <Text size="xs" c="dimmed">Qty: {item.quantity} × ₦{item.price.toLocaleString()}</Text>
                    </div>
                    <Text size="sm" fw={600}>₦{item.subtotal.toLocaleString()}</Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-blue-50 p-4 rounded">
              <Group justify="space-between" className="mb-2">
                <Text size="sm">Total Amount:</Text>
                <Text size="sm" fw={600}>₦{orderDetails.total_amount.toLocaleString()}</Text>
              </Group>
              <Group justify="space-between" className="mb-2">
                <Text size="sm">Amount Paid:</Text>
                <Text size="sm">₦{orderDetails.amount_paid.toLocaleString()}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={700}>Balance:</Text>
                <Text 
                  size="lg" 
                  fw={700}
                  c={orderDetails.balance > 0 ? "red" : "green"}
                >
                  ₦{orderDetails.balance.toLocaleString()}
                </Text>
              </Group>
            </div>

            {/* Status Update */}
            <div>
              <Text size="sm" fw={600} className="mb-2">Update Status</Text>
              <Select
                value={orderDetails.status}
                onChange={(value) => value && handleStatusChange(orderDetails.id, value)}
                data={[
                  { value: "RECEIVED", label: "Received" },
                  { value: "WASHING", label: "Washing" },
                  { value: "DRYING", label: "Drying" },
                  { value: "IRONING", label: "Ironing" },
                  { value: "READY", label: "Ready for Pickup" },
                  { value: "COLLECTED", label: "Collected" }
                ]}
              />
            </div>

            {/* Notes */}
            {orderDetails.notes && (
              <div>
                <Text size="sm" fw={600} className="mb-2">Notes</Text>
                <Text size="sm" className="bg-gray-50 p-3 rounded">{orderDetails.notes}</Text>
              </div>
            )}

            {/* Actions */}
            <Group justify="flex-end">
              {orderDetails.balance > 0 && (
                <Button
                  leftSection={<IconCash size={16} />}
                  variant="light"
                  color="green"
                  onClick={() => {/* TODO: Open payment modal */}}
                >
                  Record Payment
                </Button>
              )}
              <Button
                leftSection={<IconPrinter size={16} />}
                variant="light"
                onClick={async () => {
                  if (selectedOrder) {
                    try {
                      await window.api.printer.printOrderReceipt(selectedOrder.id, { preview: false })
                    } catch (error) {
                      console.error("Print error:", error)
                    }
                  }
                }}
              >
                Print Receipt
              </Button>
            </Group>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}