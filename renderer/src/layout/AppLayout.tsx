import Sidebar from "../components/Sidebar"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"

export default function AppLayout({ children }: any) {
  useKeyboardShortcuts()

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 p-10 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  )
}