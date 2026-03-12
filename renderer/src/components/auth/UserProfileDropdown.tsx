import { useState, useRef, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui"
import { 
  User, 
  Settings, 
  Lock, 
  LogOut, 
  ChevronDown,
  Shield,
  Clock
} from "lucide-react"
import ChangePasswordModal from "./ChangePasswordModal"

export default function UserProfileDropdown() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout()
    }
    setIsOpen(false)
  }

  const handleChangePassword = () => {
    setShowChangePassword(true)
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 h-auto"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.role?.name || "User"}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{user.role?.name || "User"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Info */}
            {user.lastLoginAt && (
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Last login: {new Date(user.lastLoginAt).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Lock className="w-4 h-4 text-gray-400" />
                <span>Change Password</span>
              </button>

              <button
                onClick={() => {
                  // Navigate to settings if needed
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Account Settings</span>
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  )
}