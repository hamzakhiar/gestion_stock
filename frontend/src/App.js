import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProduitsPage from "./pages/ProduitsPage";
import StockPage from "./pages/StockPage";
import TransferPage from "./pages/TransferPage";
import BonEntreePage from "./pages/BonEntreePage";
import BonSortiePage from "./pages/BonSortiePage";
import MouvementsPage from "./pages/MouvementsPage";
import DemandeReapprovisionnementPage from "./pages/DemandeReapprovisionnementPage";
import UsersPage from "./pages/UsersPage";

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && <Navbar />}
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
          path="/demandes-reapprovisionnement"
          element={
            <ProtectedRoute>
              <DemandeReapprovisionnementPage />
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
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
