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
// import Settings from "./pages/admin/Settings";
import UserDetail from "./pages/admin/UserDetail";
import UserDetailPage from "./pages/admin/UserDetailPage";
import CreateJobPage from "./pages/admin/CreateJobPage";
import JobViewPage from "./components/admin/JobViewPage";
import JobEditPage from "./components/admin/JobEditPage";

// USER
import UserDashboard from "./pages/user/UserDashboard";
import ReportProblem from "./pages/user/ReportProblem";
import UserWorks from "./pages/user/UserWorks";
import UserWorkOrderDetail from "./pages/user/UserWorkOrderDetail";

// LEADER
import LeaderDashboard from "./pages/leader/LeaderDashboard";
import LeaderWorks from "./pages/leader/LeaderWorks";
import TechnicianTracking from "./pages/leader/TechnicianTracking";
import WorkOrderDetail from "./pages/leader/WorkOrderDetail";
import LeaderReport from "./pages/leader/LeaderReport";

// EXECUTIVE
import ExDashboard from "./pages/executive/ExDashboard";

// COMMON
import Profile from "./pages/commom/Profile";
import MyProfile from "./pages/commom/MyProfile";
import Notification from "./pages/commom/Notification";
import Theme from "./pages/commom/Theme";
import System from "./pages/commom/System";
import Security from "./pages/commom/Security";
import Account from "./pages/commom/Account";

// CHAT
import AdminChatPage from "./pages/admin/chat/index";
import AdminChatRoomPage from "./pages/admin/chat/[chatId]";
import ChatPage from "./pages/chat/index";

// ROUTER CONFIGURATION
// การกำหนดเส้นทาง (Route) ทั้งหมดของเว็บไซต์
const router = createBrowserRouter([
  // Redirect หน้าแรกไปที่ Login
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },

  // 🟪 MAIN LAYOUT (Sidebar)
  // โครงสร้างหลักที่มี Sidebar อยู่ด้านซ้าย
  {
    path: "/",
    element: <Sidebar />,
    children: [
      // ──────── ADMIN SECTION (ส่วนของผู้ดูแลระบบ) ────────
      // เข้าถึงได้เฉพาะ Role: 'admin' เท่านั้น
      {
        path: "admin/admindashboard",
        element: (
          <ProtectedRoute
            allowedRoles={["admin"]} // กำหนดสิทธิ์ให้เข้าได้เฉพาะ admin
            element={<AdminDashboard />}
          />
        ),
      },
      {
        path: "admin/datauser",
        element: (
          <ProtectedRoute allowedRoles={["admin"]} element={<Datauser />} />
        ),
      },
      {
        path: "admin/user-detail/:id",
        element: (
          <ProtectedRoute
            allowedRoles={["admin"]}
            element={<UserDetailPage />}
          />
        ),
      },
      {
        path: "admin/workoders",
        element: (
          <ProtectedRoute allowedRoles={["admin"]} element={<WorkOders />} />
        ),
      },
      {
        path: "admin/material",
        element: (
          <ProtectedRoute allowedRoles={["admin"]} element={<MaterialPage />} />
        ),
      },
      {
        path: "admin/report",
        element: (
          <ProtectedRoute allowedRoles={["admin"]} element={<Report />} />
        ),
      },
      // {
      //   path: "admin/setting",
      //   element: (
      //     <ProtectedRoute allowedRoles={["admin"]} element={<Settings />} />
      //   ),
      // },
      {
        path: "admin/create-job",
        element: (
          <ProtectedRoute
            allowedRoles={["admin"]}
            element={<CreateJobPage />}
          />
        ),
      },
      {
        path: "admin/job/:jobId",
        element: (
          <ProtectedRoute allowedRoles={["admin"]} element={<JobViewPage />} />
        ),
      },
      {
        path: "admin/job/:jobId/edit",
        element: (
          <ProtectedRoute allowedRoles={["admin"]} element={<JobEditPage />} />
        ),
      },

      // ──────── USER ────────
      {
        path: "user/userdashboard",
        element: (
          <ProtectedRoute allowedRoles={["user"]} element={<UserDashboard />} />
        ),
      },
      {
        path: "user/report-problem",
        element: (
          <ProtectedRoute allowedRoles={["user"]} element={<ReportProblem />} />
        ),
      },
      {
        path: "user/userworks",
        element: (
          <ProtectedRoute allowedRoles={["user"]} element={<UserWorks />} />
        ),
      },
      {
        path: "user/works/:jobId",
        element: (
          <ProtectedRoute
            allowedRoles={["user"]}
            element={<UserWorkOrderDetail />}
          />
        ),
      },

      // LEADER
      {
        path: "leader/leaderdashboard",
        element: (
          <ProtectedRoute
            allowedRoles={["leader"]}
            element={<LeaderDashboard />}
          />
        ),
      },
      {
        path: "leader/leaderworks",
        element: (
          <ProtectedRoute allowedRoles={["leader"]} element={<LeaderWorks />} />
        ),
      },
      {
        path: "leader/tracking",
        element: (
          <ProtectedRoute
            allowedRoles={["leader"]}
            element={<TechnicianTracking />}
          />
        ),
      },
      {
        path: "leader/workorder/:jobId",
        element: (
          <ProtectedRoute
            allowedRoles={["leader"]}
            element={<WorkOrderDetail />}
          />
        ),
      },
      {
        path: "leader/report-problem",
        element: (
          <ProtectedRoute
            allowedRoles={["leader"]}
            element={<LeaderReport />}
          />
        ),
      },

      // ──────── EXECUTIVE ────────
      {
        path: "executive/exdashboard",
        element: (
          <ProtectedRoute
            allowedRoles={["executive"]}
            element={<ExDashboard />}
          />
        ),
      },

      // ──────── COMMON ────────
      { path: "account", element: <ProtectedRoute element={<Account />} /> },
      { path: "profile", element: <ProtectedRoute element={<Profile />} /> },
      {
        path: "my-profile",
        element: <ProtectedRoute element={<MyProfile />} />,
      },
      {
        path: "notification",
        element: <ProtectedRoute element={<Notification />} />,
      },
      { path: "security", element: <ProtectedRoute element={<Security />} /> },
      { path: "theme", element: <ProtectedRoute element={<Theme />} /> },
      { path: "system", element: <ProtectedRoute element={<System />} /> },
      { path: "user-detail/:userId", element: <UserDetailPage /> },

      // ──────── CHAT ────────
      // USER CHAT
      {
        path: "chat",
        element: (
          <ProtectedRoute
            allowedRoles={["user", "leader", "executive"]}
            element={<ChatPage />}
          />
        ),
      },

      // ADMIN CHAT
      {
        path: "admin/chat",
        element: (
          <ProtectedRoute
            allowedRoles={["admin"]}
            element={<AdminChatPage />}
          />
        ),
      },
      {
        path: "admin/chat/:chatId",
        element: (
          <ProtectedRoute
            allowedRoles={["admin"]}
            element={<AdminChatRoomPage />}
          />
        ),
      },
    ],
  },

  // 404 fallback
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;
