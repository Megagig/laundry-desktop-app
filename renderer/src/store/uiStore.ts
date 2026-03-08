import { create } from "zustand"

interface Modal {
  isOpen: boolean
  title?: string
  content?: any
  onConfirm?: () => void
  onCancel?: () => void
}

interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  message: string
  duration?: number
}

interface UIState {
  // Modal states
  customerModal: Modal
  orderModal: Modal
  serviceModal: Modal
  paymentModal: Modal
  expenseModal: Modal
  confirmDialog: Modal

  // Notifications
  notifications: Notification[]

  // Global loading
  isGlobalLoading: boolean

  // Sidebar
  isSidebarCollapsed: boolean

  // Theme
  theme: "light" | "dark"

  // Actions - Modals
  openCustomerModal: (data?: any) => void
  closeCustomerModal: () => void
  
  openOrderModal: (data?: any) => void
  closeOrderModal: () => void
  
  openServiceModal: (data?: any) => void
  closeServiceModal: () => void
  
  openPaymentModal: (data?: any) => void
  closePaymentModal: () => void
  
  openExpenseModal: (data?: any) => void
  closeExpenseModal: () => void
  
  openConfirmDialog: (title: string, message: string, onConfirm: () => void) => void
  closeConfirmDialog: () => void

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // Actions - Global loading
  setGlobalLoading: (loading: boolean) => void

  // Actions - Sidebar
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Actions - Theme
  setTheme: (theme: "light" | "dark") => void
  toggleTheme: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  customerModal: { isOpen: false },
  orderModal: { isOpen: false },
  serviceModal: { isOpen: false },
  paymentModal: { isOpen: false },
  expenseModal: { isOpen: false },
  confirmDialog: { isOpen: false },
  
  notifications: [],
  isGlobalLoading: false,
  isSidebarCollapsed: false,
  theme: "light",

  // Modal actions
  openCustomerModal: (data) => {
    set({
      customerModal: {
        isOpen: true,
        content: data
      }
    })
  },
  
  closeCustomerModal: () => {
    set({
      customerModal: { isOpen: false }
    })
  },

  openOrderModal: (data) => {
    set({
      orderModal: {
        isOpen: true,
        content: data
      }
    })
  },
  
  closeOrderModal: () => {
    set({
      orderModal: { isOpen: false }
    })
  },

  openServiceModal: (data) => {
    set({
      serviceModal: {
        isOpen: true,
        content: data
      }
    })
  },
  
  closeServiceModal: () => {
    set({
      serviceModal: { isOpen: false }
    })
  },

  openPaymentModal: (data) => {
    set({
      paymentModal: {
        isOpen: true,
        content: data
      }
    })
  },
  
  closePaymentModal: () => {
    set({
      paymentModal: { isOpen: false }
    })
  },

  openExpenseModal: (data) => {
    set({
      expenseModal: {
        isOpen: true,
        content: data
      }
    })
  },
  
  closeExpenseModal: () => {
    set({
      expenseModal: { isOpen: false }
    })
  },

  openConfirmDialog: (title, message, onConfirm) => {
    set({
      confirmDialog: {
        isOpen: true,
        title,
        content: message,
        onConfirm,
        onCancel: () => get().closeConfirmDialog()
      }
    })
  },
  
  closeConfirmDialog: () => {
    set({
      confirmDialog: { isOpen: false }
    })
  },

  // Notification actions
  addNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36)
    const newNotification = { ...notification, id }
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }))

    // Auto-remove after duration
    const duration = notification.duration || 5000
    setTimeout(() => {
      get().removeNotification(id)
    }, duration)
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },

  // Global loading
  setGlobalLoading: (loading) => {
    set({ isGlobalLoading: loading })
  },

  // Sidebar
  toggleSidebar: () => {
    set((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed
    }))
  },

  setSidebarCollapsed: (collapsed) => {
    set({ isSidebarCollapsed: collapsed })
  },

  // Theme
  setTheme: (theme) => {
    set({ theme })
    // Persist to localStorage
    localStorage.setItem("theme", theme)
  },

  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light"
    get().setTheme(newTheme)
  }
}))
