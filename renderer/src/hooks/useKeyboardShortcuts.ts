import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      const isCtrlOrCmd = event.ctrlKey || event.metaKey

      // Ctrl+N: New Order
      if (isCtrlOrCmd && event.key === "n") {
        event.preventDefault()
        navigate("/orders/new")
      }

      // Ctrl+F: Focus search (if search input exists)
      if (isCtrlOrCmd && event.key === "f") {
        event.preventDefault()
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }

      // Ctrl+P: Print (if on order or pickup page)
      if (isCtrlOrCmd && event.key === "p") {
        event.preventDefault()
        // This will be handled by individual pages
        const printButton = document.querySelector('[data-print-button]') as HTMLButtonElement
        if (printButton) {
          printButton.click()
        }
      }

      // ESC: Close modals
      if (event.key === "Escape") {
        // Mantine modals handle this automatically
        // But we can add custom logic here if needed
      }

      // Ctrl+H: Go to Dashboard
      if (isCtrlOrCmd && event.key === "h") {
        event.preventDefault()
        navigate("/")
      }

      // Ctrl+K: Go to Customers
      if (isCtrlOrCmd && event.key === "k") {
        event.preventDefault()
        navigate("/customers")
      }

      // Ctrl+O: Go to Orders
      if (isCtrlOrCmd && event.key === "o") {
        event.preventDefault()
        navigate("/orders")
      }

      // Ctrl+Shift+P: Go to Pickup
      if (isCtrlOrCmd && event.shiftKey && event.key === "P") {
        event.preventDefault()
        navigate("/pickup")
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [navigate])
}
