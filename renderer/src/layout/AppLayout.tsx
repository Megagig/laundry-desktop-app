import Sidebar from "../components/Sidebar"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"

export default function AppLayout({ children }: any) {
  useKeyboardShortcuts()

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="w-full h-full px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}