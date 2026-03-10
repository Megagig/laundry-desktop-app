import { useState, useEffect } from "react"
import { Button, Group, Text, Modal, ActionIcon, Table } from "@mantine/core"
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react"
import { 
  LoadingSpinner, 
  EmptyState,
  ConfirmDialog
} from "../components/common"
import { ServiceForm } from "../components/forms"
import { useServiceStore } from "../store"

export default function Services() {
  const { 
    services, 
    isLoading, 
    fetchServices, 
    deleteService 
  } = useServiceStore()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<any>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const handleAddNew = () => {
    setSelectedService(null)
    setIsFormOpen(true)
  }

  const handleEdit = (service: any) => {
    setSelectedService(service)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (service: any) => {
    setServiceToDelete(service)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      await deleteService(serviceToDelete.id)
      setDeleteConfirmOpen(false)
      setServiceToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedService(null)
    fetchServices()
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setSelectedService(null)
  }

  if (isLoading && services.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Services & Pricing</h1>
          <Text className="text-lg text-gray-600">Manage your laundry services and pricing</Text>
        </div>
        <Button 
          size="lg"
          leftSection={<IconPlus size={20} />}
          onClick={handleAddNew}
        >
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={<IconPlus size={48} />}
          title="No services yet"
          message="Add your first service to get started"
          actionLabel="Add Service"
          onAction={handleAddNew}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md">
          <div className="p-8">
            <Table highlightOnHover className="text-base">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className="text-base font-semibold">Service Name</Table.Th>
                  <Table.Th className="text-base font-semibold">Category</Table.Th>
                  <Table.Th className="text-base font-semibold">Price</Table.Th>
                  <Table.Th className="text-base font-semibold">Description</Table.Th>
                  <Table.Th style={{ width: 120 }} className="text-base font-semibold">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {services.map((service) => (
                  <Table.Tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <Table.Td>
                      <Text size="md" fw={600}>{service.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="md" className="text-gray-600">
                        {service.category || "General"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="md" fw={700} className="text-green-600">₦{service.price.toLocaleString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="md" className="text-gray-600" lineClamp={1}>
                        {service.description || "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          size="lg"
                          onClick={() => handleEdit(service)}
                        >
                          <IconEdit size={20} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="lg"
                          onClick={() => handleDeleteClick(service)}
                        >
                          <IconTrash size={20} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>

          <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-t border-gray-200 rounded-b-2xl">
            <Group justify="space-between">
              <Text size="lg" className="text-gray-700 font-semibold">
                Total Services: {services.length}
              </Text>
              <Text size="lg" fw={700} className="text-gray-900">
                Average Price: ₦
                {services.length > 0
                  ? Math.round(
                      services.reduce((sum, s) => sum + s.price, 0) / services.length
                    ).toLocaleString()
                  : 0}
              </Text>
            </Group>
          </div>
        </div>
      )}

      <Modal
        opened={isFormOpen}
        onClose={handleFormCancel}
        title={selectedService ? "Edit Service" : "Add New Service"}
        size="md"
      >
        <ServiceForm
          service={selectedService}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  )
}
