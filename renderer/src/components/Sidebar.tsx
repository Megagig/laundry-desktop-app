import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { 
  IconDashboard, 
  IconUsers, 
  IconShirt, 
  IconReportAnalytics,
  IconReceipt,
  IconSettings,
  IconCash,
  IconTags,
  IconAlertCircle,
  IconFileInvoice,
  IconKeyboard
} from "@tabler/icons-react"
import KeyboardShortcutsHelp from "./common/KeyboardShortcutsHelp"

const navigation = [
  { path: "/", label: "Dashboard", icon: IconDashboard },
  { path: "/orders", label: "Orders", icon: IconShirt },
  { path: "/customers", label: "Customers", icon: IconUsers },
  { path: "/pickup", label: "Pickup", icon: IconReceipt },
  { path: "/services", label: "Services", icon: IconTags },
  { 
    path: "/payments", 
    label: "Payments", 
    icon: IconCash,
    subItems: [
      { path: "/payments", label: "All Payments" },
      { path: "/payments/outstanding", label: "Outstanding", icon: IconAlertCircle }
    ]
  },
  { path: "/expenses", label: "Expenses", icon: IconFileInvoice },
  { path: "/reports", label: "Reports", icon: IconReportAnalytics },
  { path: "/settings", label: "Settings", icon: IconSettings }
]

export default function Sidebar() {
  const location = useLocation()
  const [shortcutsOpened, setShortcutsOpened] = useState(false)

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <IconShirt size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">FreshFold</h1>
            <p className="text-xs text-gray-500">Laundry & Dry Clean</p>
          </div>
        </div>
      </div>

      {/* Navigation - Spread items evenly across available space */}
      <nav className="flex-1 px-3 py-8 flex flex-col justify-evenly overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isSubItemActive = hasSubItems && item.subItems.some(sub => location.pathname === sub.path)

          return (
            <div key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200
                  ${isActive || isSubItemActive
                    ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" 
                    : "text-gray-700 hover:bg-gray-50 font-medium"
                  }
                `}
              >
                <Icon size={24} className={isActive || isSubItemActive ? "text-blue-600" : "text-gray-500"} />
                <span className="text-base">{item.label}</span>
              </Link>
              
              {hasSubItems && (isActive || isSubItemActive) && (
                <div className="ml-12 mt-2 space-y-2">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSubActive = location.pathname === subItem.path
                    
                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-base
                          ${isSubActive
                            ? "bg-blue-100 text-blue-700 font-semibold" 
                            : "text-gray-600 hover:bg-gray-50"
                          }
                        `}
                      >
                        {SubIcon && <SubIcon size={20} />}
                        <span>{subItem.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-gray-100 space-y-3">
        <button
          onClick={() => setShortcutsOpened(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200 text-base font-medium"
        >
          <IconKeyboard size={20} />
          <span>Shortcuts</span>
        </button>
        
        <div className="text-center py-3">
          <p className="font-bold text-gray-800 text-base">CleanWave Laundry</p>
          <p className="text-xs text-gray-500 mt-1">v1.0.0</p>
        </div>
      </div>

      <KeyboardShortcutsHelp opened={shortcutsOpened} onClose={() => setShortcutsOpened(false)} />
    </div>
  )
}
