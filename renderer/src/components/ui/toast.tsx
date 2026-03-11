import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  showSuccess: (title: string, message: string) => void
  showError: (title: string, message: string) => void
  showWarning: (title: string, message: string) => void
  showInfo: (title: string, message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 5000)
  }, [removeToast])

  const showSuccess = useCallback((title: string, message: string) => {
    showToast({ type: 'success', title, message, duration: 3000 })
  }, [showToast])

  const showError = useCallback((title: string, message: string) => {
    showToast({ type: 'error', title, message, duration: 5000 })
  }, [showToast])

  const showWarning = useCallback((title: string, message: string) => {
    showToast({ type: 'warning', title, message, duration: 4000 })
  }, [showToast])

  const showInfo = useCallback((title: string, message: string) => {
    showToast({ type: 'info', title, message, duration: 3000 })
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-16 right-16 z-[9999] space-y-4 w-80">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const colors = {
    success: 'bg-white border-green-200 text-green-900 shadow-green-100',
    error: 'bg-white border-red-200 text-red-900 shadow-red-100',
    warning: 'bg-white border-yellow-200 text-yellow-900 shadow-yellow-100',
    info: 'bg-white border-blue-200 text-blue-900 shadow-blue-100'
  }

  const borderColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-blue-500'
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }

  const Icon = icons[toast.type]

  return (
    <div className={`
      w-full max-w-md mx-auto shadow-2xl rounded-lg pointer-events-auto border backdrop-blur-sm
      ${colors[toast.type]} ${borderColors[toast.type]}
      animate-in slide-in-from-right-full duration-300
      transform transition-all hover:scale-[1.02]
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconColors[toast.type]}`} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-semibold">
              {toast.title}
            </p>
            <p className="mt-1 text-sm opacity-90">
              {toast.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full p-1 hover:bg-white/20 transition-colors"
              onClick={() => onRemove(toast.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}