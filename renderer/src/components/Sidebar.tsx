import { Link, useLocation } from "react-router-dom"
import { 
  IconDashboard, 
  IconUsers, 
  IconShirt, 
  IconReportAnalytics,
  IconReceipt,
  IconSettings,
  IconCash
} from "@tabler/icons-react"

const navigation = [
  { path: "/", label: "Dashboard", icon: IconDashboard },
  { path: "/orders", label: "Orders", icon: IconShirt },
  { path: "/customers", label: "Customers", icon: IconUsers },
  { path: "/pickup", label: "Pickup", icon: IconReceipt },
  { path: "/payments", label: "Payments", icon: IconCash },
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
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
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
