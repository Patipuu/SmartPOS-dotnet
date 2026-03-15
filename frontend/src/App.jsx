import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import CustomerPage from './pages/customer/CustomerPage'
import KitchenPage from './pages/kitchen/KitchenPage'
import CashierPage from './pages/cashier/CashierPage'
import AdminPage from './pages/admin/AdminPage'
import LoginPage from './pages/login/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/kitchen" element={<ProtectedRoute><KitchenPage /></ProtectedRoute>} />
        <Route path="/cashier" element={<ProtectedRoute><CashierPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App
