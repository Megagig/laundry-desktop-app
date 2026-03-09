import { Link, useLocation } from "react-router-dom"
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
  IconFileInvoice
} from "@tabler/icons-react"

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

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-blue-400">LaundryOS</h1>
        <p className="text-xs text-gray-400 mt-1">Laundry Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive || isSubItemActive
                    ? "bg-blue-600 text-white" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
              
              {hasSubItems && (isActive || isSubItemActive) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSubActive = location.pathname === subItem.path
                    
                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm
                          ${isSubActive
                            ? "bg-blue-700 text-white" 
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }
                        `}
                      >
                        {SubIcon && <SubIcon size={16} />}
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
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-400 text-center">
          <p>CleanWave Laundry</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
