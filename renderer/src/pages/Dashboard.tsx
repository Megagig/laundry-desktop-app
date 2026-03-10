import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  RefreshCw, 
  Plus, 
  Receipt, 
  Users, 
  DollarSign, 
  AlertCircle,
  TrendingUp,
  Clock,
  Eye
} from "lucide-react"
import { useReportStore, useOrderStore } from "../store"
import { LoadingSpinner, ErrorMessage, StatusBadge } from "../components/common"
import StatCard from "../components/common/StatCard"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from "../lib/utils"

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

  if (isLoading && !dashboardMetrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  // Sample data for charts
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
  ]

  const statusData = [
    { name: 'Pending', value: dashboardMetrics?.pending_orders || 0, color: '#f59e0b' },
    { name: 'Processing', value: dashboardMetrics?.processing_orders || 0, color: '#3b82f6' },
    { name: 'Ready', value: dashboardMetrics?.ready_orders || 0, color: '#10b981' },
    { name: 'Delivered', value: dashboardMetrics?.delivered_orders || 0, color: '#6b7280' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button onClick={() => navigate('/orders/new')} className="gap-2">
            <Plus size={16} />
            New Order
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboardMetrics?.total_revenue || 0)}
          icon={<DollarSign size={24} />}
          color="green"
          trend={{ value: 12.5, isPositive: true }}
          sparklineData={[4000, 3000, 5000, 4500, 6000, 5500]}
          onClick={() => navigate('/reports')}
        />
        <StatCard
          title="Total Orders"
          value={dashboardMetrics?.total_orders || 0}
          icon={<Receipt size={24} />}
          color="blue"
          trend={{ value: 8.2, isPositive: true }}
          sparklineData={[20, 25, 30, 28, 35, 32]}
          onClick={() => navigate('/orders')}
        />
        <StatCard
          title="Active Customers"
          value={dashboardMetrics?.total_customers || 0}
          icon={<Users size={24} />}
          color="purple"
          trend={{ value: 3.1, isPositive: true }}
          onClick={() => navigate('/customers')}
        />
        <StatCard
          title="Pending Pickups"
          value={dashboardMetrics?.pending_pickups || 0}
          icon={<Clock size={24} />}
          color="orange"
          subtitle="Ready for pickup"
          onClick={() => navigate('/pickup')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-600" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `₦${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Pending Pickups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-slate-900">#{order.order_number}</p>
                          <p className="text-sm text-slate-500">{order.customer_name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} size="sm" />
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Pickups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle size={20} className="text-orange-500" />
              Pending Pickups
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/pickup')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.filter(order => order.status === 'ready').length > 0 ? (
                recentOrders
                  .filter(order => order.status === 'ready')
                  .slice(0, 5)
                  .map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-slate-900">#{order.order_number}</p>
                            <p className="text-sm text-slate-500">{order.customer_name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {formatDate(order.pickup_date)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center text-slate-500 py-8">No pending pickups</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}