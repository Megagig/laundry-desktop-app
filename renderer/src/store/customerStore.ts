import { create } from "zustand"

interface Customer {
  id: number
  name: string
  phone: string
  address?: string | null
  notes?: string | null
  created_at: Date
}

interface CustomerState {
  // State
  customers: Customer[]
  selectedCustomer: Customer | null
  searchQuery: string
  isLoading: boolean
  error: string | null

  // Actions
  setCustomers: (customers: Customer[]) => void
  setSelectedCustomer: (customer: Customer | null) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // API actions
  fetchCustomers: () => Promise<void>
  fetchCustomerById: (id: number) => Promise<void>
  searchCustomerByPhone: (phone: string) => Promise<void>
  searchCustomerByName: (name: string) => Promise<void>
  createCustomer: (data: { name: string; phone: string; address?: string; notes?: string }) => Promise<Customer>
  updateCustomer: (id: number, data: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: number) => Promise<void>

  // Reset
  reset: () => void
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  // Initial state
  customers: [],
  selectedCustomer: null,
  searchQuery: "",
  isLoading: false,
  error: null,

  // Actions
  setCustomers: (customers) => set({ customers }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // API actions
  fetchCustomers: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.customer.getAll()
      if (result.success) {
        set({ customers: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchCustomerById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.customer.getById(id)
      if (result.success) {
        set({ selectedCustomer: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  searchCustomerByPhone: async (phone) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.customer.searchByPhone(phone)
      if (result.success) {
        set({ customers: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  searchCustomerByName: async (name) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.customer.searchByName(name)
      if (result.success) {
        set({ customers: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  createCustomer: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.customer.create(data)
      if (result.success) {
        // Refresh customer list
        await get().fetchCustomers()
        set({ isLoading: false })
        return result.data
      } else {
        set({ error: result.error, isLoading: false })
        throw new Error(result.error)
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateCustomer: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.customer.update({ id, ...data })
      if (result.success) {
        // Refresh customer list
        await get().fetchCustomers()
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

  deleteCustomer: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.customer.delete(id)
      if (result.success) {
        // Refresh customer list
        await get().fetchCustomers()
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

  // Reset
  reset: () => {
    set({
      customers: [],
      selectedCustomer: null,
      searchQuery: "",
      isLoading: false,
      error: null
    })
  }
}))
