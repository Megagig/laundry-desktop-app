import { Link } from "react-router-dom"

export default function Sidebar() {
  return (
    <div className="w-60 bg-gray-900 text-white h-screen p-5 space-y-4">
      <h1 className="text-xl font-bold">LaundryOS</h1>

      <nav className="flex flex-col space-y-2">
        <Link to="/">Dashboard</Link>
        <Link to="/customers">Customers</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/reports">Reports</Link>
      </nav>
    </div>
  )
}