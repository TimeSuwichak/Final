// src/router.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Datauser from "./pages/admin/Datauser";
import Report from "./pages/admin/Report";
import WorkOders from "./pages/admin/WorkOders";
import MaterialPage from "./pages/admin/Material";
import Profile from "./pages/commom/Profile";
import Notification from "./pages/commom/Notification";
import Theme from "./pages/commom/Theme";
import System from "./pages/commom/System";
import Security from "./pages/commom/Security";
import Account from "./pages/commom/Account";
import Settings from "./pages/admin/Settings";
import UserDashboard from "./pages/user/UserDashboard";
import LeaderDashboard from "./pages/leader/LeaderDashboard";
import ReportProblem from "./pages/user/ReportProblem";
import ProtectedRoute from "./components/ProtectedRoute";
import UserDetail from "./pages/admin/UserDetail";
import ExDashboard from "./pages/executive/ExDashboard";
import UserWorks from "./pages/user/UserWorks";
import LeaderWorks from "./pages/leader/LeaderWorks";
import UserDetailPage from "./pages/admin/UserDetailPage";
import TechnicianTracking from "./pages/leader/TechnicianTracking";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },

  {
    path: "/",
    element: <Sidebar />,
    children: [
      // ──────── ADMIN ────────
      {
        path: "admin/admindashboard",
        element: <ProtectedRoute allowedRoles={["admin"]} element={<AdminDashboard />} />,
      },
      { path: "admin/datauser", element: <ProtectedRoute allowedRoles={["admin"]} element={<Datauser />} /> },
      { path: "admin/user-detail/:id", element: <ProtectedRoute allowedRoles={["admin"]} element={<UserDetail />} /> },
      { path: "admin/workoders", element: <ProtectedRoute allowedRoles={["admin"]} element={<WorkOders />} /> },
      { path: "admin/material", element: <ProtectedRoute allowedRoles={["admin"]} element={<MaterialPage />} /> },
      { path: "admin/report", element: <ProtectedRoute allowedRoles={["admin"]} element={<Report />} /> },
      { path: "admin/setting", element: <ProtectedRoute allowedRoles={["admin"]} element={<Settings />} /> },

      // ──────── USER ────────
      { path: "user/userdashboard", element: <ProtectedRoute allowedRoles={["user"]} element={<UserDashboard />} /> },
      { path: "user/report-problem", element: <ProtectedRoute allowedRoles={["user"]} element={<ReportProblem />} /> },
      { path: "user/userworks", element: <ProtectedRoute allowedRoles={["user"]} element={<UserWorks />} /> },

      // ──────── LEADER ────────
      { path: "leader/leaderdashboard", element: <ProtectedRoute allowedRoles={["leader"]} element={<LeaderDashboard />} /> },
      { path: "leader/leaderworks", element: <ProtectedRoute allowedRoles={["leader"]} element={<LeaderWorks/>} /> },
      { path: "leader/tracking", element: <ProtectedRoute allowedRoles={["leader"]} element={<TechnicianTracking />} /> },

      // ──────── Executive ────────
      { path: "executive/exdashboard", element: <ProtectedRoute allowedRoles={["executive"]} element={<ExDashboard />} /> },

      // ──────── COMMON SETTINGS ────────
      { path: "account", element: <ProtectedRoute element={<Account />} /> },
      { path: "profile", element: <ProtectedRoute element={<Profile />} /> },
      { path: "notification", element: <ProtectedRoute element={<Notification />} /> },
      { path: "security", element: <ProtectedRoute element={<Security />} /> },
      { path: "theme", element: <ProtectedRoute element={<Theme />} /> },
      { path: "system", element: <ProtectedRoute element={<System />} /> },
      { path: "user-detail/:userId", element: <UserDetailPage /> }
        

    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;
