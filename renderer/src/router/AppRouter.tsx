import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "../layout/AppLayout"

import Dashboard from "../pages/Dashboard"
import Customers from "../pages/Customers"
import CustomerDetail from "../pages/CustomerDetail"
import Orders from "../pages/Orders"
import OrderDetail from "../pages/OrderDetail"
import CreateOrder from "../pages/CreateOrder"
import Pickup from "../pages/Pickup"
import Services from "../pages/Services"
import Payments from "../pages/Payments"
import OutstandingPayments from "../pages/OutstandingPayments"
import Expenses from "../pages/Expenses"
import Reports from "../pages/Reports"
import Settings from "../pages/Settings"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/new" element={<CreateOrder />} />
          <Route path="/pickup" element={<Pickup />} />
          <Route path="/services" element={<Services />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/outstanding" element={<OutstandingPayments />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}