import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "../contexts/AuthContext"
import { ToastProvider } from "../components/ui/toast"
import ProtectedRoute from "../components/auth/ProtectedRoute"
import AppLayout from "../layout/AppLayout"

import Login from "../pages/Login"
import Activation from "../pages/Activation"
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
import UserManagement from "../pages/UserManagement"
import RoleManagement from "../pages/RoleManagement"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
        <Routes>
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/activation"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Activation />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Customers />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CustomerDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Orders />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <OrderDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateOrder />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pickup"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Pickup />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Services />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Payments />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments/outstanding"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <OutstandingPayments />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Expenses />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <UserManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RoleManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}