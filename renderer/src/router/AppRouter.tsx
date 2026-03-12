import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "../contexts/AuthContext"
import { ToastProvider } from "../components/ui/toast"
import StartupCheck from "../components/startup/StartupCheck"
import ProtectedRoute from "../components/auth/ProtectedRoute"
import RequirePermission from "../components/auth/RequirePermission"
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
import AuditLogs from "../pages/AuditLogs"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Startup route - handles all initial security checks */}
          <Route path="/" element={<StartupCheck><div /></StartupCheck>} />
          
          {/* Public Routes - Wrapped in AuthProvider for optional auth context */}
          <Route path="/login" element={
            <AuthProvider>
              <Login />
            </AuthProvider>
          } />
          <Route path="/activation" element={
            <AuthProvider>
              <Activation />
            </AuthProvider>
          } />

          {/* Protected Routes - Wrapped in AuthProvider after startup */}
          <Route path="/*" element={
            <AuthProvider>
              <Routes>
                {/* Dashboard */}
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
                
                {/* Customer Management Routes */}
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="view_customer">
                          <Customers />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers/:id"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="view_customer">
                          <CustomerDetail />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Order Management Routes */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="view_order">
                          <Orders />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="view_order">
                          <OrderDetail />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/new"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="create_order">
                          <CreateOrder />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pickup"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="update_order_status">
                          <Pickup />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Service Management Routes */}
                <Route
                  path="/services"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="view_services">
                          <Services />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Payment Routes */}
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="view_payment">
                          <Payments />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments/outstanding"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="view_outstanding_payments">
                          <OutstandingPayments />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Expense Routes */}
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="view_expense">
                          <Expenses />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Reports Routes */}
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="view_reports">
                          <Reports />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* User Management Routes (Admin Only) */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="manage_users">
                          <UserManagement />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="manage_roles">
                          <RoleManagement />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Audit Logs (Admin/Manager Only) */}
                <Route
                  path="/audit-logs"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RequirePermission permission="view_audit_logs">
                          <AuditLogs />
                        </RequirePermission>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Settings Route */}
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
          } />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}