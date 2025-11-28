// src/components/ProtectedRoute.tsx
import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  element: JSX.Element;
}

export default function ProtectedRoute({
  allowedRoles = [],
  element,
}: ProtectedRouteProps) {
  // ดึงข้อมูล user และสถานะ loading จาก AuthContext
  const { user, loading } = useAuth();

  // 1. ถ้ากำลังโหลดข้อมูล User ให้แสดงหน้าว่างๆ รอไปก่อน
  if (loading) {
    return <div className="min-h-screen w-full bg-white" />;
  }

  // 2. ถ้ายังไม่ได้ Login (ไม่มีข้อมูล user) ให้ส่งกลับไปหน้า Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. ถ้ามีการกำหนด Role ที่อนุญาต (allowedRoles)
  // และ Role ของ User ปัจจุบัน ไม่อยู่ในรายชื่อที่อนุญาต
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // ส่งไปหน้า Unauthorized (ไม่มีสิทธิ์เข้าถึง)
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. ถ้าผ่านทุกเงื่อนไข ให้แสดงหน้านั้นๆ ได้เลย
  return element;
}
