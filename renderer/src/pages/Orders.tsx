import { useEffect, useState } from "react"
import { Button, Text, Modal, ActionIcon, Select } from "@mantine/core"
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
        <Text size="md" fw={600} className="text-gray-900">{order.order_number}</Text>
      )
    },
    {
      key: "customer",
      label: "Customer",
      render: (order: any) => (
        <div>
          <Text size="md" fw={600} className="text-gray-900">{order.customer_name || "N/A"}</Text>
          <Text size="sm" className="text-gray-600">{order.customer_phone || ""}</Text>
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
        <Text size="md" fw={600} className="text-gray-900">₦{order.total_amount.toLocaleString()}</Text>
      )
    },
    {
      key: "balance",
      label: "Balance",
      render: (order: any) => (
        <Text 
          size="md" 
          fw={600}
          className={order.balance > 0 ? "text-red-600" : "text-green-600"}
        >
          ₦{order.balance.toLocaleString()}
        </Text>
      )
    },
    {
      key: "pickup_date",
      label: "Pickup Date",
      render: (order: any) => (
        <Text size="md" className="text-gray-700">{new Date(order.pickup_date).toLocaleDateString()}</Text>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (order: any) => (
        <div className="flex items-center gap-2">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="lg"
            onClick={() => handleViewOrder(order)}
          >
            <IconEye size={20} />
          </ActionIcon>
          {order.balance > 0 && (
            <ActionIcon
              variant="subtle"
              color="green"
              size="lg"
              onClick={() => {/* TODO: Open payment modal */}}
            >
              <IconCash size={20} />
            </ActionIcon>
          )}
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={async () => {
              try {
                await window.api.printer.printOrderReceipt(order.id, { preview: false })
              } catch (error) {
                console.error("Print error:", error)
              }
            }}
          >
            <IconPrinter size={20} />
          </ActionIcon>
        </div>
      )
    }
  ]

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders</h1>
          <Text className="text-lg text-gray-600">Manage all customer orders</Text>
        </div>
        <Button 
          size="lg"
          leftSection={<IconPlus size={20} />}
          onClick={() => navigate("/orders/new")}
          className="shadow-md"
        >
          New Order
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search by order # or customer..."
              onSearch={handleSearch}
            />
          </div>
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
            className="w-64"
            size="md"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12">
            <LoadingSpinner />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={<IconSearch size={64} />}
              title={searchQuery || statusFilter !== "ALL" ? "No orders found" : "No orders yet"}
              message={searchQuery || statusFilter !== "ALL" ? "Try adjusting your filters" : "Create your first order to get started"}
              actionLabel={searchQuery || statusFilter !== "ALL" ? undefined : "Create Order"}
              onAction={searchQuery || statusFilter !== "ALL" ? undefined : () => navigate("/orders/new")}
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredOrders}
            itemsPerPage={15}
            keyExtractor={(order: any) => order.id}
          />
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        opened={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedOrder(null)
          setOrderDetails(null)
        }}
        title={
          <Text className="text-2xl font-bold text-gray-900">Order Details</Text>
        }
        size="xl"
        padding="xl"
      >
        {loadingDetails ? (
          <LoadingSpinner />
        ) : orderDetails ? (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <Text className="text-2xl font-bold text-gray-900">{orderDetails.order_number}</Text>
                <StatusBadge status={orderDetails.status} />
              </div>
              <div className="space-y-1">
                <Text className="text-base text-gray-700">
                  Created: {new Date(orderDetails.created_at).toLocaleString()}
                </Text>
                <Text className="text-base text-gray-700">
                  Pickup: {new Date(orderDetails.pickup_date).toLocaleDateString()}
                </Text>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <Text className="text-lg font-bold text-gray-900 mb-3">Customer</Text>
              <div className="bg-gray-50 p-5 rounded-xl">
                <Text className="text-base font-semibold text-gray-900">{orderDetails.customer_name}</Text>
                <Text className="text-base text-gray-600 mt-1">{orderDetails.customer_phone}</Text>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <Text className="text-lg font-bold text-gray-900 mb-3">Items</Text>
              <div className="space-y-3">
                {orderDetails.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-5 rounded-xl">
                    <div>
                      <Text className="text-base font-semibold text-gray-900">{item.service_name}</Text>
                      <Text className="text-sm text-gray-600 mt-1">Qty: {item.quantity} × ₦{item.price.toLocaleString()}</Text>
                    </div>
                    <Text className="text-lg font-bold text-gray-900">₦{item.subtotal.toLocaleString()}</Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <Text className="text-base text-gray-700">Total Amount:</Text>
                <Text className="text-base font-semibold text-gray-900">₦{orderDetails.total_amount.toLocaleString()}</Text>
              </div>
              <div className="flex items-center justify-between mb-3">
                <Text className="text-base text-gray-700">Amount Paid:</Text>
                <Text className="text-base text-gray-900">₦{orderDetails.amount_paid.toLocaleString()}</Text>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                <Text className="text-lg font-bold text-gray-900">Balance:</Text>
                <Text 
                  className={`text-2xl font-bold ${orderDetails.balance > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  ₦{orderDetails.balance.toLocaleString()}
                </Text>
              </div>
            </div>

            {/* Status Update */}
            <div>
              <Text className="text-lg font-bold text-gray-900 mb-3">Update Status</Text>
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
                size="md"
              />
            </div>

            {/* Notes */}
            {orderDetails.notes && (
              <div>
                <Text className="text-lg font-bold text-gray-900 mb-3">Notes</Text>
                <Text className="text-base bg-gray-50 p-5 rounded-xl text-gray-700">{orderDetails.notes}</Text>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              {orderDetails.balance > 0 && (
                <Button
                  size="lg"
                  leftSection={<IconCash size={20} />}
                  variant="light"
                  color="green"
                  onClick={() => {/* TODO: Open payment modal */}}
                >
                  Record Payment
                </Button>
              )}
              <Button
                size="lg"
                leftSection={<IconPrinter size={20} />}
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
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}