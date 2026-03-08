import { create } from "zustand"

interface Service {
  id: number
  name: string
  price: number
  description?: string | null
  category?: string | null
}

interface ServiceState {
  // State
  services: Service[]
  selectedService: Service | null
  isLoading: boolean
  error: string | null

  // Actions
  setServices: (services: Service[]) => void
  setSelectedService: (service: Service | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // API actions
  fetchServices: () => Promise<void>
  fetchServiceById: (id: number) => Promise<void>
  fetchServicesByCategory: (category: string) => Promise<void>
  createService: (data: { name: string; price: number; description?: string; category?: string }) => Promise<void>
  updateService: (id: number, data: Partial<Service>) => Promise<void>
  deleteService: (id: number) => Promise<void>

  // Helpers
  getServiceById: (id: number) => Service | undefined
  getServicesByCategory: (category: string) => Service[]
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  // Initial state
  services: [],
  selectedService: null,
  isLoading: false,
  error: null,

  // Actions
  setServices: (services) => set({ services }),
  setSelectedService: (service) => set({ selectedService: service }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // API actions
  fetchServices: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.service.getAll()
      if (result.success) {
        set({ services: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchServiceById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.service.getById(id)
      if (result.success) {
        set({ selectedService: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchServicesByCategory: async (category) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.service.getByCategory(category)
      if (result.success) {
        set({ services: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  createService: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.service.create(data)
      if (result.success) {
        // Refresh services list
        await get().fetchServices()
        set({ isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
        throw new Error(result.error)
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateService: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.service.update({ id, ...data })
      if (result.success) {
        // Refresh services list
        await get().fetchServices()
        set({ isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
        throw new Error(result.error)
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteService: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.service.delete(id)
      if (result.success) {
        // Refresh services list
        await get().fetchServices()
        set({ isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
        throw new Error(result.error)
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Helpers
  getServiceById: (id) => {
    return get().services.find(s => s.id === id)
  },

  getServicesByCategory: (category) => {
    return get().services.filter(s => s.category === category)
  }
}))
