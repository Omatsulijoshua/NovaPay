import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import ReceiveMoney from './pages/ReceiveMoney';
import Transactions from './pages/Transactions';
import TransactionDetails from './pages/TransactionDetails';
import Profile from './pages/Profile';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminTransactions from './pages/admin/AdminTransactions';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthLayout>
                <Signup />
              </AuthLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthLayout>
                <ResetPassword />
              </AuthLayout>
            }
          />

          {/* Authenticated Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/send"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SendMoney />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receive"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ReceiveMoney />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Transactions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TransactionDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminOverview />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUserDetail />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminTransactions />
                </AdminLayout>
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
