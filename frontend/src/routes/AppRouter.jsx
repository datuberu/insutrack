import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import LogInjectionPage from "../pages/LogInjectionPage";
import PreCheckPage from "../pages/PreCheckPage";
import HistoryPage from "../pages/HistoryPage";
import EditInjectionPage from "../pages/EditInjectionPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/log-injection"
          element={
            <ProtectedRoute>
              <LogInjectionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pre-check"
          element={
            <ProtectedRoute>
              <PreCheckPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-injection/:id"
          element={
            <ProtectedRoute>
              <EditInjectionPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}