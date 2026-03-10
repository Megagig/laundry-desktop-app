import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Grid, List, DollarSign, Clock } from "lucide-react"
import { 
  LoadingSpinner, 
  EmptyState
} from "../components/common"
import { ServiceForm } from "../components/forms"
import { useServiceStore } from "../store"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { formatCurrency } from "../lib/utils"

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  const serviceIcons: Record<string, string> = {
    'wash': '🧺',
    'dry': '🌪️',
    'iron': '👔',
    'fold': '📦',
    'starch': '✨',
    'express': '⚡',
    'delicate': '🌸',
    'default': '👕'
  }

  const getServiceIcon = (serviceName: string) => {
    const key = serviceName.toLowerCase()
    return serviceIcons[key] || serviceIcons.default
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Services</h1>
          <p className="text-slate-600 mt-1">Manage your laundry services and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </Button>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus size={16} />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Services</p>
                <p className="text-2xl font-bold text-slate-900">{services.length}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Price</p>
                <p className="text-2xl font-bold text-slate-900">
                  {services.length > 0 
                    ? formatCurrency(services.reduce((sum, s) => sum + s.price, 0) / services.length)
                    : '₦0.00'
                  }
                </p>
              </div>
              <Badge variant="success" className="bg-emerald-100 text-emerald-800">
                Per Item
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Express Services</p>
                <p className="text-2xl font-bold text-slate-900">
                  {services.filter(s => s.name.toLowerCase().includes('express')).length}
                </p>
              </div>
              <Badge variant="warning" className="bg-amber-100 text-amber-800">
                Fast
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Display */}
      {services.length === 0 ? (
        <Card className="p-12">
          <EmptyState message="No services available. Add your first service to get started." />
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getServiceIcon(service.name)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <p className="text-sm text-slate-500 mt-1">{service.category || 'General'}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(service)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <DollarSign size={14} />
                          <span>Price</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock size={14} />
                          <span>Turnaround</span>
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          Standard
                        </span>
                      </div>
                      
                      {service.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Service</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Description</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-xl">
                              {getServiceIcon(service.name)}
                            </div>
                            <div className="font-medium text-slate-900">{service.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{service.category || 'General'}</td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">
                            {formatCurrency(service.price)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                          {service.description || 'No description'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(service)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Service Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {selectedService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <ServiceForm
              service={selectedService}
              onSuccess={() => {
                setIsFormOpen(false)
                setSelectedService(null)
                fetchServices()
              }}
              onCancel={() => {
                setIsFormOpen(false)
                setSelectedService(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Service</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete "{serviceToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  setServiceToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}