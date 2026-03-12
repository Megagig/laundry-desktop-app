import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Plus, 
  Search, 
  Edit, 
  Eye,
  Phone,
  MapPin
} from "lucide-react"
import { useCustomerStore } from "../store"
import { 
  DataTable, 
  ErrorMessage
} from "../components/common"
import { CustomerForm } from "../components/forms"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { usePermission } from "../hooks/usePermission"
import { PERMISSIONS } from "../../../shared/types/permissions"
import ProtectedComponent from "../components/auth/ProtectedComponent"
import { formatDate } from "../lib/utils"
import type { Customer } from "../../../shared/types/customer.types"

export default function Customers() {
  const navigate = useNavigate()
  const {
    customers,
    isLoading,
    error,
    fetchCustomers
  } = useCustomerStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(undefined)

  // Permission checks
  const canCreateCustomer = usePermission(PERMISSIONS.CREATE_CUSTOMER)
  const canEditCustomer = usePermission(PERMISSIONS.EDIT_CUSTOMER)
  const canViewCustomer = usePermission(PERMISSIONS.VIEW_CUSTOMER)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  )

  const handleEdit = (customer: Customer) => {
    setSelectedCustomerId(customer.id)
    setIsFormOpen(true)
  }

  const handleView = (customer: Customer) => {
    navigate(`/customers/${customer.id}`)
  }

  const columns = [
    {
      key: "name",
      label: "Customer",
      render: (customer: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-slate-900">{customer.name}</div>
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <Phone size={12} />
              {customer.phone}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "contact",
      label: "Contact",
      render: (customer: Customer) => (
        <div className="space-y-1">
          <div className="text-sm text-slate-600 flex items-center gap-1">
            <Phone size={12} />
            {customer.phone}
          </div>
          {customer.address && (
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <MapPin size={12} />
              {customer.address}
            </div>
          )}
        </div>
      )
    },
    {
      key: "total_orders",
      label: "Orders",
      render: (customer: any) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-900">
            {customer.total_orders || 0}
          </div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
      )
    },
    {
      key: "total_spent",
      label: "Total Spent",
      render: (customer: any) => (
        <div className="text-right">
          <div className="font-medium text-slate-900">
            ₦{(customer.total_spent || 0).toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">Lifetime</div>
        </div>
      )
    },
    {
      key: "created_at",
      label: "Joined",
      render: (customer: Customer) => (
        <div className="text-sm text-slate-600">
          {formatDate(customer.created_at)}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: () => (
        <Badge 
          variant="success"
          className="bg-emerald-100 text-emerald-800"
        >
          Active
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (customer: Customer) => (
        <div className="flex items-center gap-1">
          <ProtectedComponent permission={PERMISSIONS.VIEW_CUSTOMER}>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleView(customer)
              }}
            >
              <Eye size={16} />
            </Button>
          </ProtectedComponent>
          <ProtectedComponent permission={PERMISSIONS.EDIT_CUSTOMER}>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(customer)
              }}
            >
              <Edit size={16} />
            </Button>
          </ProtectedComponent>
        </div>
      )
    }
  ]

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">Manage your customer database</p>
        </div>
        <ProtectedComponent permission={PERMISSIONS.CREATE_CUSTOMER}>
          <Button 
            onClick={() => {
              setSelectedCustomerId(undefined)
              setIsFormOpen(true)
            }} 
            className="gap-2"
          >
            <Plus size={16} />
            Add Customer
          </Button>
        </ProtectedComponent>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Customers</p>
                <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
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
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-900">
                  {customers.length}
                </p>
              </div>
              <Badge variant="success" className="bg-emerald-100 text-emerald-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">New This Month</p>
                <p className="text-2xl font-bold text-slate-900">
                  {customers.filter(c => {
                    const created = new Date(c.created_at)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Badge variant="info" className="bg-blue-100 text-blue-800">
                Recent
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Orders</p>
                <p className="text-2xl font-bold text-slate-900">
                  {customers.length > 0 
                    ? ((customers as any[]).reduce((sum, c) => sum + (c.total_orders || 0), 0) / customers.length).toFixed(1)
                    : '0'
                  }
                </p>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Per Customer
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <DataTable
        data={filteredCustomers}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No customers found"
        keyExtractor={(customer) => customer.id}
      />

      {/* Customer Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {selectedCustomerId ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <CustomerForm
              customerId={selectedCustomerId}
              onSuccess={() => {
                setIsFormOpen(false)
                setSelectedCustomerId(undefined)
                fetchCustomers()
              }}
              onCancel={() => {
                setIsFormOpen(false)
                setSelectedCustomerId(undefined)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}