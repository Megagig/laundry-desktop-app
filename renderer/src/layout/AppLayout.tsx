import Sidebar from "../components/Sidebar"
import UserProfileDropdown from "../components/auth/UserProfileDropdown"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"

export default function AppLayout({ children }: any) {
  useKeyboardShortcuts()

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-end">
            <UserProfileDropdown />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="w-full h-full p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}