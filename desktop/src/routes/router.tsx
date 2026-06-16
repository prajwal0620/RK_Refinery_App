import { createHashRouter, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import LoginPage from "../pages/LoginPage";
import AppLayout from "../layouts/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import BillingPage from "../pages/BillingPage";
import BillsPage from "../pages/BillsPage";
import ReportsPage from "../pages/ReportsPage";
import SettingsPage from "../pages/SettingsPage";

function hasToken() {
  return !!(localStorage.getItem("rk_token") || sessionStorage.getItem("rk_token"));
}

const RequireAuth = ({ children }: { children: ReactNode }) => {
  if (!hasToken()) return <Navigate to="/login" replace />;
  return children;
};

export const router = createHashRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/billing", element: <BillingPage /> },
      { path: "/bills", element: <BillsPage /> },
      { path: "/reports", element: <ReportsPage /> },
      { path: "/settings", element: <SettingsPage /> }
    ],
  },
]);