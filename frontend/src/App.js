import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MessengerRoutes from './pages/MessengerRoutes';
import MessengerDeliveries from './pages/MessengerDeliveries';
import ProofCapture from './pages/ProofCapture';
import CoordinatorMessengers from './pages/CoordinatorMessengers';
import BillsManagement from './pages/BillsManagement';
import DeliveryTracking from './pages/DeliveryTracking';
import VerifyDeliveries from './pages/VerifyDeliveries';
import Reporting from './pages/Reporting';

// Styles
import './styles/globals.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Messenger Routes */}
            <Route
              path="/messenger/routes"
              element={
                <PrivateRoute requiredRole="messenger">
                  <MessengerRoutes />
                </PrivateRoute>
              }
            />
            <Route
              path="/messenger/deliveries"
              element={
                <PrivateRoute requiredRole="messenger">
                  <MessengerDeliveries />
                </PrivateRoute>
              }
            />
            <Route
              path="/messenger/proof"
              element={
                <PrivateRoute requiredRole="messenger">
                  <ProofCapture />
                </PrivateRoute>
              }
            />

            {/* Coordinator Routes */}
            <Route
              path="/coordinator/messengers"
              element={
                <PrivateRoute requiredRole="coordinator">
                  <CoordinatorMessengers />
                </PrivateRoute>
              }
            />
            <Route
              path="/coordinator/bills"
              element={
                <PrivateRoute requiredRole="coordinator">
                  <BillsManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/coordinator/tracking"
              element={
                <PrivateRoute requiredRole="coordinator">
                  <DeliveryTracking />
                </PrivateRoute>
              }
            />
            <Route
              path="/coordinator/verification"
              element={
                <PrivateRoute requiredRole="coordinator">
                  <VerifyDeliveries />
                </PrivateRoute>
              }
            />
            <Route
              path="/coordinator/reports"
              element={
                <PrivateRoute requiredRole="coordinator">
                  <Reporting />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
