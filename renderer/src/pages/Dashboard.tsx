import { useEffect, useState } from "react"
import { Button, Text, Table, Badge, ActionIcon } from "@mantine/core"
import { 
  IconRefresh, 
  IconPlus, 
  IconReceipt, 
  IconUsers, 
  IconCash, 
  IconAlertCircle,
  IconTrendingUp,
  IconEye
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { useReportStore, useOrderStore } from "../store"
import { StatCard, LoadingSpinner, ErrorMessage, StatusBadge, EmptyState } from "../components/common"

export default function Dashboard() {
  const navigate = useNavigate()
  const { 
    dashboardMetrics, 
    isLoading, 
    error,
    refreshDashboard 
  } = useReportStore()

  const { orders, fetchOrders } = useOrderStore()
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    await refreshDashboard()
    await fetchOrders()
  }

  useEffect(() => {
    // Get 5 most recent orders
    if (orders.length > 0) {
      const sorted = [...orders].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setRecentOrders(sorted.slice(0, 5))
    }
  }, [orders])

  const handleRefresh = async () => {
    await loadDashboardData()
  }

  const pendingPickups = orders.filter(o => o.status === "READY")

  if (isLoading && !dashboardMetrics) {
    return <LoadingSpinner fullScreen />
  }

  if (error && !dashboardMetrics) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <Text className="text-lg text-gray-600">Welcome back! Here's what's happening today.</Text>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            size="lg"
            leftSection={<IconPlus size={20} />}
            onClick={() => navigate("/orders/new")}
            className="shadow-md"
          >
            New Order
          </Button>
          <ActionIcon 
            variant="light" 
            size="xl"
            onClick={handleRefresh}
            loading={isLoading}
            className="shadow-md"
          >
            <IconRefresh size={22} />
          </ActionIcon>
        </div>
      </div>

      {/* Primary Metrics */}
      <div>
        <Text className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Today's Overview</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            title="Orders Today"
            value={dashboardMetrics?.total_orders_today || 0}
            icon={<IconReceipt size={28} />}
            color="blue"
          />
          <StatCard
            title="Revenue Today"
            value={`₦${(dashboardMetrics?.revenue_today || 0).toLocaleString()}`}
            icon={<IconCash size={28} />}
            color="green"
          />
          <StatCard
            title="Outstanding Payments"
            value={`₦${(dashboardMetrics?.outstanding_payments || 0).toLocaleString()}`}
            icon={<IconAlertCircle size={28} />}
            color="red"
          />
          <StatCard
            title="Ready for Pickup"
            value={dashboardMetrics?.orders_ready_for_pickup || 0}
            icon={<IconUsers size={28} />}
            color="orange"
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <div>
        <Text className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Business Metrics</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatCard
            title="Total Customers"
            value={dashboardMetrics?.total_customers || 0}
            icon={<IconUsers size={28} />}
            color="purple"
          />
          <StatCard
            title="Orders In Progress"
            value={dashboardMetrics?.orders_in_progress || 0}
            icon={<IconTrendingUp size={28} />}
            color="indigo"
          />
        </div>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Widget */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md">
          <div className="flex items-center justify-between p-8 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">Recent Orders</Text>
            <Button 
              variant="subtle" 
              size="sm"
              onClick={() => navigate("/orders")}
            >
              View All
            </Button>
          </div>

          <div className="p-8">
            {recentOrders.length === 0 ? (
              <EmptyState
                icon={<IconReceipt size={56} />}
                title="No orders yet"
                message="Create your first order to get started"
                actionLabel="Create Order"
                onAction={() => navigate("/orders/new")}
              />
            ) : (
              <Table className="text-base">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className="text-base font-semibold">Order #</Table.Th>
                    <Table.Th className="text-base font-semibold">Status</Table.Th>
                    <Table.Th className="text-base font-semibold">Amount</Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {recentOrders.map(order => (
                    <Table.Tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <Table.Td>
                        <Text size="md" fw={600}>{order.order_number}</Text>
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge status={order.status} />
                      </Table.Td>
                      <Table.Td>
                        <Text size="md" className="font-semibold">₦{order.total_amount.toLocaleString()}</Text>
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon 
                          variant="subtle" 
                          size="lg"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <IconEye size={20} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </div>
        </div>

        {/* Pending Pickups Widget */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md">
          <div className="flex items-center justify-between p-8 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">Pending Pickups</Text>
            <Badge color="orange" variant="light" size="xl" className="text-base px-4 py-2">
              {pendingPickups.length}
            </Badge>
          </div>

          <div className="p-8">
            {pendingPickups.length === 0 ? (
              <EmptyState
                icon={<IconUsers size={56} />}
                title="No pending pickups"
                message="All orders have been collected"
              />
            ) : (
              <Table className="text-base">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className="text-base font-semibold">Order #</Table.Th>
                    <Table.Th className="text-base font-semibold">Pickup Date</Table.Th>
                    <Table.Th className="text-base font-semibold">Balance</Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {pendingPickups.slice(0, 5).map(order => (
                    <Table.Tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <Table.Td>
                        <Text size="md" fw={600}>{order.order_number}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="md" className="text-gray-600 font-medium">
                          {new Date(order.pickup_date).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text 
                          size="md" 
                          className={`font-semibold ${order.balance > 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          ₦{order.balance.toLocaleString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon 
                          variant="subtle" 
                          size="lg"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <IconEye size={20} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8 shadow-md">
        <Text className="text-xl font-bold text-gray-900 mb-6">Quick Actions</Text>
        <div className="flex flex-wrap gap-4">
          <Button 
            size="lg"
            leftSection={<IconPlus size={20} />}
            onClick={() => navigate("/orders/new")}
          >
            New Order
          </Button>
          <Button 
            size="lg"
            variant="light"
            leftSection={<IconUsers size={20} />}
            onClick={() => navigate("/customers")}
          >
            Manage Customers
          </Button>
          <Button 
            size="lg"
            variant="light"
            leftSection={<IconReceipt size={20} />}
            onClick={() => navigate("/orders")}
          >
            View All Orders
          </Button>
        </div>
      </div>
    </div>
  )
}
