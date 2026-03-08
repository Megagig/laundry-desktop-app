import { create } from "zustand"

// Types for cart items
interface CartItem {
  service_id: number
  service_name: string
  quantity: number
  price: number
  subtotal: number
}

// Types for order filters
interface OrderFilters {
  status?: string
  searchQuery?: string
  startDate?: string
  endDate?: string
}

interface OrderState {
  // Cart state
  cart: CartItem[]
  selectedCustomerId: number | null
  paymentType: string
  amountPaid: number
  pickupDate: string
  notes: string

  // Orders list state
  orders: any[]
  currentOrder: any | null
  filters: OrderFilters
  isLoading: boolean
  error: string | null

  // Cart actions
  addToCart: (item: Omit<CartItem, "subtotal">) => void
  updateCartItem: (serviceId: number, quantity: number) => void
  removeFromCart: (serviceId: number) => void
  clearCart: () => void
  
  // Order form actions
  setSelectedCustomer: (customerId: number | null) => void
  setPaymentType: (type: string) => void
  setAmountPaid: (amount: number) => void
  setPickupDate: (date: string) => void
  setNotes: (notes: string) => void
  
  // Computed values
  getCartTotal: () => number
  getCartBalance: () => number
  
  // Orders list actions
  setOrders: (orders: any[]) => void
  setCurrentOrder: (order: any | null) => void
  setFilters: (filters: Partial<OrderFilters>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // API actions
  fetchOrders: () => Promise<void>
  fetchOrderById: (id: number) => Promise<void>
  createOrder: () => Promise<any>
  updateOrderStatus: (orderId: number, status: string) => Promise<void>
  searchOrders: (query: string) => Promise<void>
  
  // Reset
  resetOrderForm: () => void
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Initial state
  cart: [],
  selectedCustomerId: null,
  paymentType: "FULL_PAYMENT",
  amountPaid: 0,
  pickupDate: "",
  notes: "",
  
  orders: [],
  currentOrder: null,
  filters: {},
  isLoading: false,
  error: null,

  // Cart actions
  addToCart: (item) => {
    const existingItem = get().cart.find(i => i.service_id === item.service_id)
    
    if (existingItem) {
      // Update quantity if item already exists
      set((state) => ({
        cart: state.cart.map(i =>
          i.service_id === item.service_id
            ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.price }
            : i
        )
      }))
    } else {
      // Add new item
      set((state) => ({
        cart: [...state.cart, { ...item, subtotal: item.quantity * item.price }]
      }))
    }
  },

  updateCartItem: (serviceId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(serviceId)
      return
    }
    
    set((state) => ({
      cart: state.cart.map(item =>
        item.service_id === serviceId
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      )
    }))
  },

  removeFromCart: (serviceId) => {
    set((state) => ({
      cart: state.cart.filter(item => item.service_id !== serviceId)
    }))
  },

  clearCart: () => {
    set({ cart: [] })
  },

  // Order form actions
  setSelectedCustomer: (customerId) => set({ selectedCustomerId: customerId }),
  setPaymentType: (type) => set({ paymentType: type }),
  setAmountPaid: (amount) => set({ amountPaid: amount }),
  setPickupDate: (date) => set({ pickupDate: date }),
  setNotes: (notes) => set({ notes: notes }),

  // Computed values
  getCartTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.subtotal, 0)
  },

  getCartBalance: () => {
    return get().getCartTotal() - get().amountPaid
  },

  // Orders list actions
  setOrders: (orders) => set({ orders }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // API actions
  fetchOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.order.getAll()
      if (result.success) {
        set({ orders: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.order.getWithDetails(id)
      if (result.success) {
        set({ currentOrder: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  createOrder: async () => {
    const state = get()
    
    if (!state.selectedCustomerId) {
      throw new Error("Please select a customer")
    }
    
    if (state.cart.length === 0) {
      throw new Error("Please add items to cart")
    }
    
    if (!state.pickupDate) {
      throw new Error("Please select pickup date")
    }

    set({ isLoading: true, error: null })
    
    try {
      const orderData = {
        customer_id: state.selectedCustomerId,
        items: state.cart.map(item => ({
          service_id: item.service_id,
          quantity: item.quantity
        })),
        payment_type: state.paymentType,
        amount_paid: state.amountPaid,
        pickup_date: state.pickupDate,
        notes: state.notes || undefined
      }

      const result = await window.api.order.create(orderData)
      
      if (result.success) {
        set({ isLoading: false })
        get().resetOrderForm()
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

  updateOrderStatus: async (orderId, status) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.order.updateStatus(orderId, status)
      if (result.success) {
        // Refresh orders list
        await get().fetchOrders()
        set({ isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  searchOrders: async (query) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.order.search(query)
      if (result.success) {
        set({ orders: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  // Reset
  resetOrderForm: () => {
    set({
      cart: [],
      selectedCustomerId: null,
      paymentType: "FULL_PAYMENT",
      amountPaid: 0,
      pickupDate: "",
      notes: ""
    })
  }
}))