import { useEffect, useState } from "react"
import { Button, Text, Modal, ActionIcon, Badge } from "@mantine/core"
import { 
  IconPlus, 
  IconSearch, 
  IconEdit, 
  IconTrash, 
  IconEye
} from "@tabler/icons-react"
import { useCustomerStore } from "../store"
import { 
  DataTable, 
  SearchInput, 
  LoadingSpinner, 
  ErrorMessage, 
  EmptyState,
  ConfirmDialog 
} from "../components/common"
import { CustomerForm } from "../components/forms"

export default function Customers() {
  const {
    customers,
    isLoading,
    error,
    fetchCustomers,
    deleteCustomer
  } = useCustomerStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [customerOrders, setCustomerOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

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

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setIsFormOpen(true)
  }

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setIsFormOpen(true)
  }

  const handleViewCustomer = async (customer: any) => {
    setSelectedCustomer(customer)
    setIsDetailOpen(true)
    setLoadingOrders(true)
    
    // Fetch customer order history
    const result = await window.api.customer.getOrderHistory(customer.id, 10)
    if (result.success) {
      setCustomerOrders(result.data)
    }
    setLoadingOrders(false)
  }

  const handleDeleteClick = (customer: any) => {
    setSelectedCustomer(customer)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedCustomer) {
      await deleteCustomer(selectedCustomer.id)
      setIsDeleteOpen(false)
      setSelectedCustomer(null)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedCustomer(null)
    fetchCustomers()
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (customer: any) => (
        <Text size="md" fw={600} className="text-gray-900">{customer.name}</Text>
      )
    },
    {
      key: "phone",
      label: "Phone",
      render: (customer: any) => (
        <Text size="md" className="text-gray-700 font-medium">{customer.phone}</Text>
      )
    },
    {
      key: "address",
      label: "Address",
      render: (customer: any) => (
        <Text size="md" className="text-gray-600">{customer.address || "—"}</Text>
      )
    },
    {
      key: "created_at",
      label: "Registered",
      render: (customer: any) => (
        <Text size="md" className="text-gray-600">{new Date(customer.created_at).toLocaleDateString()}</Text>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (customer: any) => (
        <div className="flex items-center gap-2">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="lg"
            onClick={() => handleViewCustomer(customer)}
          >
            <IconEye size={20} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={() => handleEditCustomer(customer)}
          >
            <IconEdit size={20} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            size="lg"
            onClick={() => handleDeleteClick(customer)}
          >
            <IconTrash size={20} />
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customers</h1>
          <Text className="text-lg text-gray-600">Manage your customer database</Text>
        </div>
        <Button 
          size="lg"
          leftSection={<IconPlus size={20} />}
          onClick={handleAddCustomer}
          className="shadow-md"
        >
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
        <SearchInput
          placeholder="Search by name or phone..."
          onSearch={handleSearch}
        />
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12">
            <LoadingSpinner />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={<IconSearch size={64} />}
              title={searchQuery ? "No customers found" : "No customers yet"}
              message={searchQuery ? "Try a different search term" : "Add your first customer to get started"}
              actionLabel={searchQuery ? undefined : "Add Customer"}
              onAction={searchQuery ? undefined : handleAddCustomer}
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredCustomers}
            itemsPerPage={10}
            keyExtractor={(customer: any) => customer.id}
          />
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      <Modal
        opened={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedCustomer(null)
        }}
        title={
          <Text className="text-2xl font-bold text-gray-900">
            {selectedCustomer ? "Edit Customer" : "Add New Customer"}
          </Text>
        }
        size="lg"
        padding="xl"
      >
        <CustomerForm
          customerId={selectedCustomer?.id}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsFormOpen(false)
            setSelectedCustomer(null)
          }}
        />
      </Modal>

      {/* Customer Detail Modal */}
      <Modal
        opened={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedCustomer(null)
          setCustomerOrders([])
        }}
        title={
          <Text className="text-2xl font-bold text-gray-900">Customer Details</Text>
        }
        size="xl"
        padding="xl"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <Text className="text-2xl font-bold text-gray-900 mb-4">{selectedCustomer.name}</Text>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Text className="text-base font-semibold text-gray-700">Phone:</Text>
                  <Text className="text-base text-gray-900">{selectedCustomer.phone}</Text>
                </div>
                {selectedCustomer.address && (
                  <div className="flex items-center gap-2">
                    <Text className="text-base font-semibold text-gray-700">Address:</Text>
                    <Text className="text-base text-gray-900">{selectedCustomer.address}</Text>
                  </div>
                )}
                {selectedCustomer.notes && (
                  <div className="mt-3">
                    <Text className="text-base font-semibold text-gray-700 mb-1">Notes:</Text>
                    <Text className="text-base text-gray-700">{selectedCustomer.notes}</Text>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4">
                  <Text className="text-sm font-medium text-gray-600">Registered:</Text>
                  <Badge variant="light" size="lg">
                    {new Date(selectedCustomer.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div>
              <Text className="text-xl font-bold text-gray-900 mb-4">Recent Orders</Text>
              {loadingOrders ? (
                <LoadingSpinner />
              ) : customerOrders.length === 0 ? (
                <Text className="text-base text-gray-600">No orders yet</Text>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((order: any) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <Text className="text-lg font-semibold text-gray-900">{order.order_number}</Text>
                          <Text className="text-sm text-gray-600 mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                          </Text>
                        </div>
                        <div className="text-right">
                          <Text className="text-lg font-bold text-gray-900">₦{order.total_amount.toLocaleString()}</Text>
                          <Text className={`text-sm font-semibold mt-1 ${order.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                            {order.balance > 0 ? `Balance: ₦${order.balance.toLocaleString()}` : "Paid"}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                size="lg"
                variant="light"
                onClick={() => {
                  setIsDetailOpen(false)
                  handleEditCustomer(selectedCustomer)
                }}
              >
                Edit Customer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onCancel={() => {
          setIsDeleteOpen(false)
          setSelectedCustomer(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete ${selectedCustomer?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  )
}
