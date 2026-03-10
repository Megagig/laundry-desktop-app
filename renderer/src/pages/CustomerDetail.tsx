import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Phone, MapPin, Calendar, Plus, Eye } from "lucide-react"
import { useCustomerStore, useOrderStore } from "../store"
import { LoadingSpinner, ErrorMessage, StatusBadge } from "../components/common"
import { CustomerForm } from "../components/forms"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { formatCurrency, formatDate } from "../lib/utils"
import type { Customer } from "../../../shared/types/customer.types"

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { customers, isLoading, error, fetchCustomers } = useCustomerStore()
  const { orders, fetchOrders } = useOrderStore()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<any[]>([])
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers()
    }
    if (orders.length === 0) {
      fetchOrders()
    }
  }, [])

  useEffect(() => {
    if (id && customers.length > 0) {
      const foundCustomer = customers.find(c => c.id === parseInt(id))
      setCustomer(foundCustomer || null)
    }
  }, [id, customers])

  useEffect(() => {
    if (customer && orders.length > 0) {
      const filteredOrders = orders.filter(order => order.customer_id === customer.id)
      setCustomerOrders(filteredOrders)
    }
  }, [customer, orders])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/customers')}>
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Customer Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">The customer you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/customers')} className="mt-4">
              Back to Customers
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalSpent = customerOrders.reduce((sum, order) => sum + order.total_amount, 0)
  const totalPaid = customerOrders.reduce((sum, order) => sum + order.amount_paid, 0)
  const outstandingBalance = totalSpent - totalPaid

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/customers')}>
            <ArrowLeft size={16} />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{customer.name}</h1>
              <p className="text-slate-600 mt-1">Customer since {formatDate(customer.created_at)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/orders/new?customer=${customer.id}`)} 
            className="gap-2"
          >
            <Plus size={16} />
            New Order
          </Button>
          <Button onClick={() => setIsEditFormOpen(true)} className="gap-2">
            <Edit size={16} />
            Edit Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Phone Number</p>
                  <p className="font-medium text-slate-900">{customer.phone}</p>
                </div>
              </div>
              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Address</p>
                    <p className="font-medium text-slate-900">{customer.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Customer Since</p>
                  <p className="font-medium text-slate-900">{formatDate(customer.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{customer.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
                View All Orders
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerOrders.length > 0 ? (
                  customerOrders
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium text-slate-900">#{order.order_number}</p>
                              <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
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
                  <p className="text-center text-slate-500 py-8">No orders found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{customerOrders.length}</p>
                <p className="text-sm text-blue-700">Total Orders</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSpent)}</p>
                <p className="text-sm text-green-700">Total Spent</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalPaid)}</p>
                <p className="text-sm text-purple-700">Total Paid</p>
              </div>
              {outstandingBalance > 0 && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(outstandingBalance)}</p>
                  <p className="text-sm text-red-700">Outstanding Balance</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant="success"
                className="bg-emerald-100 text-emerald-800 w-full justify-center py-2"
              >
                Active Customer
              </Badge>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate(`/orders/new?customer=${customer.id}`)}
              >
                <Plus size={16} />
                Create New Order
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => setIsEditFormOpen(true)}
              >
                <Edit size={16} />
                Edit Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {isEditFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Edit Customer
            </h2>
            <CustomerForm
              customerId={customer?.id}
              onSuccess={() => {
                setIsEditFormOpen(false)
                fetchCustomers()
              }}
              onCancel={() => setIsEditFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}