import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProduitsPage from './pages/ProduitsPage';
import StockPage from './pages/StockPage';
import TransferPage from './pages/TransferPage';
import BonEntreePage from './pages/BonEntreePage';
import BonSortiePage from './pages/BonSortiePage';
import MouvementsPage from './pages/MouvementsPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/produits"
            element={
              <ProtectedRoute>
                <ProduitsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stocks"
            element={
              <ProtectedRoute>
                <StockPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bon-entree"
            element={
              <ProtectedRoute>
                <BonEntreePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bon-sortie"
            element={
              <ProtectedRoute>
                <BonSortiePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transferts"
            element={
              <ProtectedRoute>
                <TransferPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mouvements"
            element={
              <ProtectedRoute>
                <MouvementsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
