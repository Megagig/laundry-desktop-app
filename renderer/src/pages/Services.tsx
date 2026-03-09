import { useState, useEffect } from "react"
import { Button, Group, Text, Card, Modal, ActionIcon, Table } from "@mantine/core"
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
    <div className="space-y-6">
      <Group justify="space-between">
        <div>
          <h1 className="text-2xl font-bold">Services & Pricing</h1>
          <Text size="sm" c="dimmed">Manage your laundry services and pricing</Text>
        </div>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={handleAddNew}
        >
          Add Service
        </Button>
      </Group>

      {services.length === 0 ? (
        <EmptyState
          icon={<IconPlus size={48} />}
          title="No services yet"
          message="Add your first service to get started"
          actionLabel="Add Service"
          onAction={handleAddNew}
        />
      ) : (
        <Card withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Service Name</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {services.map((service) => (
                <Table.Tr key={service.id}>
                  <Table.Td>
                    <Text fw={500}>{service.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {service.category || "General"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={600}>₦{service.price.toLocaleString()}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {service.description || "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(service)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteClick(service)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <div className="mt-4 p-4 bg-gray-50 rounded">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Total Services: {services.length}
              </Text>
              <Text size="sm" fw={600}>
                Average Price: ₦
                {services.length > 0
                  ? Math.round(
                      services.reduce((sum, s) => sum + s.price, 0) / services.length
                    ).toLocaleString()
                  : 0}
              </Text>
            </Group>
          </div>
        </Card>
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
