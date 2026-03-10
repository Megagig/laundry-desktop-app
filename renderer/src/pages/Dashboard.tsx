import { useEffect, useState } from "react"
import { Button, Text, Badge, ActionIcon } from "@mantine/core"
import { 
  IconRefresh, 
  IconPlus, 
  IconReceipt, 
  IconUsers, 
  IconCash, 
  IconAlertCircle,
  IconTrendingUp
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
    <div className="space-y-8">
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

      {/* Primary Metrics - Full Width 4 Columns */}
      <div>
        <Text className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Today's Overview</Text>
        <div className="grid grid-cols-4 gap-6">
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

      {/* Secondary Metrics - Full Width 2 Columns */}
      <div>
        <Text className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Business Metrics</Text>
        <div className="grid grid-cols-2 gap-6">
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

      {/* Widgets Row - 2 Column Layout (Full Width) */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Orders Widget - Left Column */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">Recent Orders</Text>
            <Button 
              variant="subtle" 
              size="sm"
              onClick={() => navigate("/orders")}
            >
              View All
            </Button>
          </div>

          <div className="p-6">
            {recentOrders.length === 0 ? (
              <EmptyState
                icon={<IconReceipt size={48} />}
                title="No orders yet"
                message="Create your first order to get started"
                actionLabel="Create Order"
                onAction={() => navigate("/orders/new")}
              />
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="flex-1">
                      <Text size="lg" fw={700} className="mb-2">{order.order_number}</Text>
                      <StatusBadge status={order.status} />
                    </div>
                    <Text className="text-xl font-bold text-gray-900">₦{order.total_amount.toLocaleString()}</Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Pending Pickups + Quick Actions */}
        <div className="space-y-6">
          {/* Pending Pickups Widget */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">Pending Pickups</Text>
              <Badge color="orange" variant="light" size="lg" className="text-base px-3 py-1">
                {pendingPickups.length}
              </Badge>
            </div>

            <div className="p-6">
              {pendingPickups.length === 0 ? (
                <EmptyState
                  icon={<IconUsers size={48} />}
                  title="No pending pickups"
                  message="All orders collected"
                />
              ) : (
                <div className="space-y-3">
                  {pendingPickups.slice(0, 3).map(order => (
                    <div 
                      key={order.id} 
                      className="p-5 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <Text size="lg" fw={700} className="mb-2">{order.order_number}</Text>
                      <Text size="md" className="text-gray-600 mb-2">
                        {new Date(order.pickup_date).toLocaleDateString()}
                      </Text>
                      <Text 
                        size="lg" 
                        fw={700}
                        className={order.balance > 0 ? "text-red-600" : "text-green-600"}
                      >
                        ₦{order.balance.toLocaleString()}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 shadow-md">
            <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>
            <div className="space-y-3">
              <Button 
                fullWidth
                size="lg"
                leftSection={<IconPlus size={20} />}
                onClick={() => navigate("/orders/new")}
              >
                New Order
              </Button>
              <Button 
                fullWidth
                size="lg"
                variant="light"
                leftSection={<IconUsers size={20} />}
                onClick={() => navigate("/customers")}
              >
                Customers
              </Button>
              <Button 
                fullWidth
                size="lg"
                variant="light"
                leftSection={<IconReceipt size={20} />}
                onClick={() => navigate("/pickup")}
              >
                Pickup
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
