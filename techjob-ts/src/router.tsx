// src/router.tsx
import React from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import LoginPage from "./pages/LoginPage";

// COMPONENTS
import ProtectedRoute from "./components/ProtectedRoute";

// ADMIN

import AdminDashboard from "./pages/admin/AdminDashboard";
import Datauser from "./pages/admin/Datauser";
import Report from "./pages/admin/Report";
import WorkOders from "./pages/admin/WorkOders";
import MaterialPage from "./pages/admin/Material";
import Settings from "./pages/admin/Settings";
import UserDetail from "./pages/admin/UserDetail";
import UserDetailPage from "./pages/admin/UserDetailPage";

// USER
import UserDashboard from "./pages/user/UserDashboard";
import ReportProblem from "./pages/user/ReportProblem";
import UserWorks from "./pages/user/UserWorks";

// LEADER
import LeaderDashboard from "./pages/leader/LeaderDashboard";
import LeaderWorks from "./pages/leader/LeaderWorks";
import TechnicianTracking from "./pages/leader/TechnicianTracking";
import WorkOrderDetail from "./pages/leader/WorkOrderDetail";

// EXECUTIVE
import ExDashboard from "./pages/executive/ExDashboard";

// COMMON
import Profile from "./pages/commom/Profile";
import Notification from "./pages/commom/Notification";
import Theme from "./pages/commom/Theme";
import System from "./pages/commom/System";
import Security from "./pages/commom/Security";
import Account from "./pages/commom/Account";



// CHAT
import AdminChatPage from "./pages/admin/chat/index";
import AdminChatRoomPage from "./pages/admin/chat/[chatId]";
import ChatPage from "./pages/chat/index";

// ROUTER
const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },

  // 🟪 MAIN LAYOUT (Sidebar)
  {
    path: "/",
    element: <Sidebar />,
    children: [
      // ──────── ADMIN ────────
      {
        path: "admin/admindashboard",
        element: <ProtectedRoute allowedRoles={["admin"]} element={<AdminDashboard />} />,
      },
      {
        path: "admin/datauser",
        element: <ProtectedRoute allowedRoles={["admin"]} element={<Datauser />} />,
      },
      {
        path: "admin/user-detail/:id",
        element: <ProtectedRoute allowedRoles={["admin"]} element={<UserDetailPage />} />,
      },
      {
        path: "admin/workoders",
        element: <ProtectedRoute allowedRoles={["admin"]} element={<WorkOders />} />,
      },
      {
        path: "admin/material",
        element: <ProtectedRoute allowedRoles={["admin"]} element={<MaterialPage />} />,
      },
      {
        path: "admin/report",
        element: <ProtectedRoute allowedRoles={["admin"]} element={<Report />} />,
      },
      {
        path: "admin/setting",
        element: <ProtectedRoute allowedRoles={["admin"]} element={<Settings />} />,
      },

      // ──────── USER ────────
      {
        path: "user/userdashboard",
        element: <ProtectedRoute allowedRoles={["user"]} element={<UserDashboard />} />,
      },
      {
        path: "user/report-problem",
        element: <ProtectedRoute allowedRoles={["user"]} element={<ReportProblem />} />,
      },
      {
        path: "user/userworks",
        element: <ProtectedRoute allowedRoles={["user"]} element={<UserWorks />} />,
      },

      // LEADER
      {
        path: "leader/leaderdashboard",
        element: <ProtectedRoute allowedRoles={["leader"]} element={<LeaderDashboard />} />
      },
      {
        path: "leader/leaderworks",
        element: <ProtectedRoute allowedRoles={["leader"]} element={<LeaderWorks />} />
      },
      {
        path: "leader/tracking",
        element: <ProtectedRoute allowedRoles={["leader"]} element={<TechnicianTracking />} />
      },
      {
        path: "leader/workorder/:jobId",
        element: <ProtectedRoute allowedRoles={["leader"]} element={<WorkOrderDetail />} />
      },

      // ──────── EXECUTIVE ────────
      {
        path: "executive/exdashboard",
        element: <ProtectedRoute allowedRoles={["executive"]} element={<ExDashboard />} />,
      },

      // ──────── COMMON ────────
      { path: "account", element: <ProtectedRoute element={<Account />} /> },
      { path: "profile", element: <ProtectedRoute element={<Profile />} /> },
      { path: "notification", element: <ProtectedRoute element={<Notification />} /> },
      { path: "security", element: <ProtectedRoute element={<Security />} /> },
      { path: "theme", element: <ProtectedRoute element={<Theme />} /> },
      { path: "system", element: <ProtectedRoute element={<System />} /> },
      { path: "user-detail/:userId", element: <UserDetailPage /> },

      // ──────── CHAT ────────
      // USER CHAT
      {
        path: "chat",
        element: <ProtectedRoute allowedRoles={["user", "leader", "executive"]} element={<ChatPage />} />,
      },

      // ADMIN CHAT
      {
        path: "admin/chat",
        element: <ProtectedRoute allowedRoles={["admin"]} element={<AdminChatPage />} />,
      },
      {
        path: "admin/chat/:chatId",
        element: <ProtectedRoute allowedRoles={["admin"]} element={<AdminChatRoomPage />} />,
      },
    ],
  },

  // 404 fallback
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;