import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "../layout/AppLayout"

import Dashboard from "../pages/Dashboard"
import Customers from "../pages/Customers"
import Orders from "../pages/Orders"
import CreateOrder from "../pages/CreateOrder"
import Pickup from "../pages/Pickup"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<CreateOrder />} />
          <Route path="/pickup" element={<Pickup />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}