import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { 
  LayoutDashboard, 
  Users, 
  ShirtIcon, 
  BarChart3,
  Receipt,
  Settings,
  DollarSign,
  Tags,
  AlertCircle,
  FileText,
  Keyboard,
  ChevronDown,
  ChevronRight,
  LogOut,
  User as UserIcon
} from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../contexts/AuthContext"
import KeyboardShortcutsHelp from "./common/KeyboardShortcutsHelp"

const navigation = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/orders", label: "Orders", icon: ShirtIcon },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/pickup", label: "Pickup", icon: Receipt },
  { path: "/services", label: "Services", icon: Tags },
  { 
    path: "/payments", 
    label: "Payments", 
    icon: DollarSign,
    subItems: [
      { path: "/payments", label: "All Payments" },
      { path: "/payments/outstanding", label: "Outstanding", icon: AlertCircle }
    ]
  },
  { path: "/expenses", label: "Expenses", icon: FileText },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings }
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [shortcutsOpened, setShortcutsOpened] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(["/payments"])

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout()
    }
  }

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    )
  }

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  return (
    <div className="w-72 bg-white border-r border-slate-200 h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <ShirtIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">FreshFold</h1>
            <p className="text-sm text-slate-500 font-medium">Laundry Management</p>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <div key={item.path}>
            {item.subItems ? (
              <div>
                <button
                  onClick={() => toggleExpanded(item.path)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive(item.path)
                      ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={cn(
                      "transition-colors",
                      isActive(item.path) ? "text-indigo-600" : "text-slate-500"
                    )} />
                    <span>{item.label}</span>
                  </div>
                  {expandedItems.includes(item.path) ? (
                    <ChevronDown size={16} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400" />
                  )}
                </button>
                
                {expandedItems.includes(item.path) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                          isActive(subItem.path)
                            ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        {subItem.icon && (
                          <subItem.icon size={16} className={cn(
                            "transition-colors",
                            isActive(subItem.path) ? "text-indigo-600" : "text-slate-400"
                          )} />
                        )}
                        <span>{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive(item.path)
                    ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={18} className={cn(
                  "transition-colors",
                  isActive(item.path) ? "text-indigo-600" : "text-slate-500"
                )} />
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {/* User Info */}
        {user && (
          <div className="px-3 py-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user.role?.name || "User"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={() => setShortcutsOpened(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all duration-200"
        >
          <Keyboard size={18} className="text-slate-500" />
          <span>Shortcuts</span>
        </button>
        
        <div className="px-3 py-2">
          <p className="text-xs text-slate-400 font-medium">Version 1.0.0</p>
        </div>
      </div>

      <KeyboardShortcutsHelp 
        opened={shortcutsOpened} 
        onClose={() => setShortcutsOpened(false)} 
      />
    </div>
  )
}