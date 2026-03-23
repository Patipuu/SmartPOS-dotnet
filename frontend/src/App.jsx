import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import CustomerPage from './pages/customer/CustomerPage'
import KitchenPage from './pages/kitchen/KitchenPage'
import CashierPage from './pages/cashier/CashierPage'
import AdminPage from './pages/admin/AdminPage'
import LoginPage from './pages/login/LoginPage'
import AuthGuard from './components/AuthGuard'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route
          path="/kitchen"
          element={
            <AuthGuard allowedRoles={['Kitchen']}>
              <KitchenPage />
            </AuthGuard>
          }
        />
        <Route
          path="/cashier"
          element={
            <AuthGuard allowedRoles={['Cashier']}>
              <CashierPage />
            </AuthGuard>
          }
        />
        {/* Alias theo PRD */}
        <Route
          path="/pos"
          element={
            <AuthGuard allowedRoles={['Cashier']}>
              <CashierPage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthGuard allowedRoles={['Admin']}>
              <AdminPage />
            </AuthGuard>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
