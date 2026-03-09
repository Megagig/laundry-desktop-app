import Sidebar from "../components/Sidebar"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"

export default function AppLayout({ children }: any) {
  useKeyboardShortcuts()

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  )
}