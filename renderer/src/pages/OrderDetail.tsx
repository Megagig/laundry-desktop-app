import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Printer, Phone, Calendar } from "lucide-react"
import { useOrderStore } from "../store"
import { LoadingSpinner, ErrorMessage, StatusBadge } from "../components/common"
import { OrderForm } from "../components/forms"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { formatCurrency, formatDate } from "../lib/utils"
import type { OrderWithDetails } from "../../../shared/types/order.types"

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { orders, isLoading, error, fetchOrders } = useOrderStore()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  useEffect(() => {
    if (orders.length === 0) {
      fetchOrders()
    }
  }, [])

  useEffect(() => {
    if (id && orders.length > 0) {
      const foundOrder = orders.find(o => o.id === parseInt(id)) as OrderWithDetails
      setOrder(foundOrder || null)
    }
  }, [id, orders])

  const handlePrintReceipt = async () => {
    if (!order) return
    
    try {
      const result = await window.api.printer.printOrderReceipt(order.id)
      if (result.success) {
        console.log('Receipt printed successfully')
      } else {
        console.error('Failed to print receipt:', result.error)
      }
    } catch (error) {
      console.error('Error printing receipt:', error)
    }
  }

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

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/orders')}>
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Order Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">The order you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/orders')} className="mt-4">
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/orders')}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Order #{order.order_number}</h1>
            <p className="text-slate-600 mt-1">Order details and information</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePrintReceipt} className="gap-2">
            <Printer size={16} />
            Print Receipt
          </Button>
          <Button onClick={() => setIsEditFormOpen(true)} className="gap-2">
            <Edit size={16} />
            Edit Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <StatusBadge status={order.status} size="lg" />
                <div className="text-right">
                  <p className="text-sm text-slate-600">Created</p>
                  <p className="font-medium">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{item.service_name}</p>
                      <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-sm text-slate-600">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-slate-500 text-center py-4">No items found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-slate-900">{order.customer_name}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <Phone size={12} />
                  {order.customer_phone}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/customers/${order.customer_id}`)}
                className="w-full"
              >
                View Customer Profile
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Amount Paid:</span>
                <span className="font-medium text-green-600">{formatCurrency(order.amount_paid)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Balance:</span>
                <span className={`font-bold ${order.amount_paid >= order.total_amount ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(order.total_amount - order.amount_paid)}
                </span>
              </div>
            </CardContent>
          </Card>

              {/* Pickup Information */}
          <Card>
            <CardHeader>
              <CardTitle>Pickup Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Pickup Date</p>
                  <p className="font-medium">{formatDate(order.pickup_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Order Modal */}
      {isEditFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              Edit Order #{order?.order_number}
            </h2>
            <OrderForm
              onSuccess={() => {
                setIsEditFormOpen(false)
                fetchOrders()
              }}
              onCancel={() => setIsEditFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}