import React from "react";
import ReactDOM from "react-dom/client";
import {
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./App.css";

import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNavbar from "./components/admin/AdminNavbar";
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

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },

  // Layout ของ admin
  {
    path: "/admin",
    element: <AdminNavbar />, // ✅ ใช้ AdminNavbar เป็น Layout หลักของ ADMIN
    children: [
      {
        path: "AdminDashboard",
        element: <AdminDashboard />,
      },
      {
        path: "Datauser",
        element: <Datauser />,
      },
      {
        path: "Report",
        element: <Report />,
      },
      {
        path: "WorkOders",
        element:<WorkOders/>,
      },
            {
        path: "Material",
        element:<MaterialPage/>,
      },
      {
        path: "setting",
        element:<Settings/>
      },
      {
        path: "Account",
        element:<Account/>
      },
      {
        path: "Profile",
        element:<Profile/>
      },
      {
        path: "Notification",
        element:<Notification/>
      },
      {
        path: "Security",
        element:<Security/>
      },
      {
        path: "Theme",
        element:<Theme/>
      },
      {
        path : "System",
        element:<System/>
      }
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;