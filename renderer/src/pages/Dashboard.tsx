import { useEffect, useState } from "react"
import { Button, Text, Badge } from "@mantine/core"
import { 
  IconRefresh, 
  IconPlus, 
  IconReceipt, 
  IconUsers, 
  IconCash, 
  IconAlertCircle,
  IconTrendingUp,
  IconClock
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { useReportStore, useOrderStore } from "../store"
import { LoadingSpinner, ErrorMessage, StatusBadge } from "../components/common"
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

  // Prepare chart data
  const statusData = [
    { name: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, color: '#fbbf24' },
    { name: 'In Progress', value: orders.filter(o => o.status === 'IN_PROGRESS').length, color: '#3b82f6' },
    { name: 'Ready', value: orders.filter(o => o.status === 'READY').length, color: '#f97316' },
    { name: 'Collected', value: orders.filter(o => o.status === 'COLLECTED').length, color: '#10b981' },
  ].filter(item => item.value > 0)

  // Revenue trend (last 7 days mock data - you can replace with real data)
  const revenueTrend = [
    { day: 'Mon', revenue: 45000 },
    { day: 'Tue', revenue: 52000 },
    { day: 'Wed', revenue: 48000 },
    { day: 'Thu', revenue: 61000 },
    { day: 'Fri', revenue: 55000 },
    { day: 'Sat', revenue: 67000 },
    { day: 'Sun', revenue: 58000 },
  ]

  if (isLoading && !dashboardMetrics) {
    return <LoadingSpinner fullScreen />
  }

  if (error && !dashboardMetrics) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Text className="text-base text-gray-600 mt-1">Welcome back! Here's what's happening today.</Text>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            size="md"
            leftSection={<IconRefresh size={18} />}
            onClick={handleRefresh}
            loading={isLoading}
            variant="light"
          >
            Refresh
          </Button>
          <Button 
            size="md"
            leftSection={<IconPlus size={18} />}
            onClick={() => navigate("/orders/new")}
          >
            New Order
          </Button>
        </div>
      </div>

      {/* Top Stats Row - 4 Cards */}
      <div className="grid grid-cols-4 gap-5">
        {/* Orders Today */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <IconReceipt size={24} className="text-blue-600" />
            </div>
            <Badge color="blue" variant="light" size="sm">Today</Badge>
          </div>
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {dashboardMetrics?.total_orders_today || 0}
          </Text>
          <Text size="sm" className="text-gray-600">Orders Today</Text>
        </div>

        {/* Revenue Today */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <IconCash size={24} className="text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <IconTrendingUp size={16} />
              <Text size="xs" fw={600}>+12%</Text>
            </div>
          </div>
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            ₦{(dashboardMetrics?.revenue_today || 0).toLocaleString()}
          </Text>
          <Text size="sm" className="text-gray-600">Revenue Today</Text>
        </div>

        {/* Outstanding */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <IconAlertCircle size={24} className="text-red-600" />
            </div>
            <Badge color="red" variant="light" size="sm">Pending</Badge>
          </div>
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            ₦{(dashboardMetrics?.outstanding_payments || 0).toLocaleString()}
          </Text>
          <Text size="sm" className="text-gray-600">Outstanding</Text>
        </div>

        {/* Ready for Pickup */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <IconClock size={24} className="text-orange-600" />
            </div>
            <Badge color="orange" variant="light" size="sm">Ready</Badge>
          </div>
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {dashboardMetrics?.orders_ready_for_pickup || 0}
          </Text>
          <Text size="sm" className="text-gray-600">Ready for Pickup</Text>
        </div>
      </div>

      {/* Main Content - 3 Column Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left Column - Revenue Chart (6 cols) */}
        <div className="col-span-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <Text className="text-lg font-bold text-gray-900">Revenue Trend</Text>
            <Text size="sm" className="text-gray-500">Last 7 Days</Text>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Middle Column - Order Status (3 cols) */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-6">Order Status</Text>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <Text size="sm" className="text-gray-700">{item.name}</Text>
                    </div>
                    <Text size="sm" fw={600}>{item.value}</Text>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Text size="sm" className="text-gray-500 text-center py-8">No orders yet</Text>
          )}
        </div>

        {/* Right Column - Quick Stats (3 cols) */}
        <div className="col-span-3 space-y-5">
          {/* Total Customers */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white rounded-lg">
                <IconUsers size={20} className="text-purple-600" />
              </div>
            </div>
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              {dashboardMetrics?.total_customers || 0}
            </Text>
            <Text size="sm" className="text-gray-700 font-medium">Total Customers</Text>
          </div>

          {/* Orders In Progress */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white rounded-lg">
                <IconTrendingUp size={20} className="text-indigo-600" />
              </div>
            </div>
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              {dashboardMetrics?.orders_in_progress || 0}
            </Text>
            <Text size="sm" className="text-gray-700 font-medium">In Progress</Text>
          </div>
        </div>
      </div>

      {/* Bottom Row - Recent Orders & Pending Pickups */}
      <div className="grid grid-cols-2 gap-5">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">Recent Orders</Text>
            <Button 
              variant="subtle" 
              size="xs"
              onClick={() => navigate("/orders")}
            >
              View All
            </Button>
          </div>

          <div className="p-5">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <IconReceipt size={40} className="text-gray-300 mx-auto mb-3" />
                <Text size="sm" className="text-gray-500 mb-3">No orders yet</Text>
                <Button size="sm" onClick={() => navigate("/orders/new")}>Create Order</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map(order => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconReceipt size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <Text size="sm" fw={700} className="mb-1">{order.order_number}</Text>
                        <Text size="xs" className="text-gray-600">{order.customer_name}</Text>
                      </div>
                    </div>
                    <div className="text-right">
                      <Text size="sm" fw={700} className="mb-1">₦{order.total_amount.toLocaleString()}</Text>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Pickups */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">Pending Pickups</Text>
            <Badge color="orange" variant="light" size="md">
              {pendingPickups.length}
            </Badge>
          </div>

          <div className="p-5">
            {pendingPickups.length === 0 ? (
              <div className="text-center py-8">
                <IconUsers size={40} className="text-gray-300 mx-auto mb-3" />
                <Text size="sm" className="text-gray-500">All orders collected</Text>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingPickups.slice(0, 5).map(order => (
                  <div 
                    key={order.id} 
                    className="p-4 bg-orange-50 rounded-lg border border-orange-100 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Text size="sm" fw={700}>{order.order_number}</Text>
                      <Text 
                        size="sm" 
                        fw={700}
                        className={order.balance > 0 ? "text-red-600" : "text-green-600"}
                      >
                        ₦{order.balance.toLocaleString()}
                      </Text>
                    </div>
                    <Text size="xs" className="text-gray-600">
                      Pickup: {new Date(order.pickup_date).toLocaleDateString()}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
