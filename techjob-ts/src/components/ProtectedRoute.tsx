// src/components/ProtectedRoute.tsx
import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  element: JSX.Element;
}

export default function ProtectedRoute({ allowedRoles = [], element }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    // ป้องกันหน้าขาวกระพริบ
    return <div className="min-h-screen w-full bg-white" />;
  }

  if (!user) {
    // ถ้ายังไม่ login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // ถ้ามี role แต่ไม่ตรง
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
}
