import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "../layout/AppLayout"

import Dashboard from "../pages/Dashboard"
import Customers from "../pages/Customers"
import Orders from "../pages/Orders"
import CreateOrder from "../pages/CreateOrder"
import Pickup from "../pages/Pickup"
import Services from "../pages/Services"

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
          <Route path="/services" element={<Services />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}