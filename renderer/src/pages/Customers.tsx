import { useEffect, useState } from "react"
import { Button, Group, Text, Modal, ActionIcon } from "@mantine/core"
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
        <Text size="sm" fw={500}>{customer.name}</Text>
      )
    },
    {
      key: "phone",
      label: "Phone",
      render: (customer: any) => (
        <Text size="sm">{customer.phone}</Text>
      )
    },
    {
      key: "address",
      label: "Address",
      render: (customer: any) => (
        <Text size="sm" c="dimmed">{customer.address || "—"}</Text>
      )
    },
    {
      key: "created_at",
      label: "Registered",
      render: (customer: any) => (
        <Text size="sm">{new Date(customer.created_at).toLocaleDateString()}</Text>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (customer: any) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleViewCustomer(customer)}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => handleEditCustomer(customer)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDeleteClick(customer)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      )
    }
  ]

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <Text size="sm" c="dimmed">Manage your customer database</Text>
        </div>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={handleAddCustomer}
        >
          Add Customer
        </Button>
      </Group>

      {/* Search */}
      <SearchInput
        placeholder="Search by name or phone..."
        onSearch={handleSearch}
      />

      {/* Customer Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<IconSearch size={48} />}
          title={searchQuery ? "No customers found" : "No customers yet"}
          message={searchQuery ? "Try a different search term" : "Add your first customer to get started"}
          actionLabel={searchQuery ? undefined : "Add Customer"}
          onAction={searchQuery ? undefined : handleAddCustomer}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredCustomers}
          itemsPerPage={10}
          keyExtractor={(customer: any) => customer.id}
        />
      )}

      {/* Add/Edit Customer Modal */}
      <Modal
        opened={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedCustomer(null)
        }}
        title={selectedCustomer ? "Edit Customer" : "Add New Customer"}
        size="md"
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
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="bg-gray-50 p-4 rounded">
              <Text size="lg" fw={600} className="mb-2">{selectedCustomer.name}</Text>
              <Text size="sm" c="dimmed">Phone: {selectedCustomer.phone}</Text>
              {selectedCustomer.address && (
                <Text size="sm" c="dimmed">Address: {selectedCustomer.address}</Text>
              )}
              {selectedCustomer.notes && (
                <Text size="sm" c="dimmed" className="mt-2">Notes: {selectedCustomer.notes}</Text>
              )}
              <Text size="xs" c="dimmed" className="mt-2">
                Registered: {new Date(selectedCustomer.created_at).toLocaleDateString()}
              </Text>
            </div>

            {/* Order History */}
            <div>
              <Text size="sm" fw={600} className="mb-2">Recent Orders</Text>
              {loadingOrders ? (
                <LoadingSpinner />
              ) : customerOrders.length === 0 ? (
                <Text size="sm" c="dimmed">No orders yet</Text>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((order: any) => (
                    <div key={order.id} className="border rounded p-3">
                      <Group justify="space-between">
                        <div>
                          <Text size="sm" fw={500}>{order.order_number}</Text>
                          <Text size="xs" c="dimmed">
                            {new Date(order.created_at).toLocaleDateString()}
                          </Text>
                        </div>
                        <div className="text-right">
                          <Text size="sm" fw={500}>₦{order.total_amount.toLocaleString()}</Text>
                          <Text size="xs" c={order.balance > 0 ? "red" : "green"}>
                            {order.balance > 0 ? `Balance: ₦${order.balance}` : "Paid"}
                          </Text>
                        </div>
                      </Group>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() => {
                  setIsDetailOpen(false)
                  handleEditCustomer(selectedCustomer)
                }}
              >
                Edit Customer
              </Button>
            </Group>
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