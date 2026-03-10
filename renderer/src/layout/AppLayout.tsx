import Sidebar from "../components/Sidebar"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"

export default function AppLayout({ children }: any) {
  useKeyboardShortcuts()

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="w-full h-full p-8">
          {children}
        </div>
      </main>
    </div>
  )
}