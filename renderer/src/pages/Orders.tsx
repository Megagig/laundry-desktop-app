import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Plus, 
  Search, 
  Eye,
  DollarSign,
  Printer,
  Filter
} from "lucide-react"
import { useOrderStore } from "../store"
import { 
  DataTable, 
  ErrorMessage,
  StatusBadge
} from "../components/common"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { formatCurrency, formatDate } from "../lib/utils"

export default function Orders() {
  const navigate = useNavigate()
  const {
    orders,
    isLoading,
    error,
    fetchOrders
  } = useOrderStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

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
    
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const columns = [
    {
      key: "order_number",
      label: "Order #",
      render: (order: any) => (
        <div className="font-medium text-slate-900">#{order.order_number}</div>
      )
    },
    {
      key: "customer_name",
      label: "Customer",
      render: (order: any) => (
        <div>
          <div className="font-medium text-slate-900">{order.customer_name}</div>
          <div className="text-sm text-slate-500">{order.customer_phone}</div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (order: any) => <StatusBadge status={order.status} />
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (order: any) => (
        <div className="font-medium text-slate-900">
          {formatCurrency(order.total_amount)}
        </div>
      )
    },
    {
      key: "pickup_date",
      label: "Pickup Date",
      render: (order: any) => (
        <div className="text-sm text-slate-600">
          {formatDate(order.pickup_date)}
        </div>
      )
    },
    {
      key: "created_at",
      label: "Created",
      render: (order: any) => (
        <div className="text-sm text-slate-600">
          {formatDate(order.created_at)}
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (order: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/orders/${order.id}`)
            }}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              // Handle payment
            }}
          >
            <DollarSign size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              // Handle print
            }}
          >
            <Printer size={16} />
          </Button>
        </div>
      )
    }
  ]

  const statusOptions = [
    { value: "ALL", label: "All Orders" },
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "READY", label: "Ready" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" }
  ]

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-600 mt-1">Manage and track all customer orders</p>
        </div>
        <Button onClick={() => navigate('/orders/new')} className="gap-2">
          <Plus size={16} />
          New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                All Time
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-slate-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <Badge variant="warning" className="bg-amber-100 text-amber-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ready</p>
                <p className="text-2xl font-bold text-slate-900">
                  {orders.filter(o => o.status === 'ready').length}
                </p>
              </div>
              <Badge variant="success" className="bg-emerald-100 text-emerald-800">
                Pickup
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Revenue</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(orders.reduce((sum, o) => sum + o.total_amount, 0))}
                </p>
              </div>
              <Badge variant="success" className="bg-green-100 text-green-800">
                Total
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search orders or customers..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <DataTable
        data={filteredOrders}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No orders found"
        keyExtractor={(order) => order.id}
        onRowClick={(order) => navigate(`/orders/${order.id}`)}
      />
    </div>
  )
}