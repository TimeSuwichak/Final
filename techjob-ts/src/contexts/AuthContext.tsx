// src/contexts/AuthContext.tsx
// Context สำหรับจัดการระบบ Authentication (การเข้าสู่ระบบ/ออกจากระบบ)
// ทำหน้าที่:
// 1. ตรวจสอบสถานะการเข้าสู่ระบบ (Check Login Status)
// 2. เก็บข้อมูลผู้ใช้ปัจจุบัน (Current User)
// 3. จัดการฟังก์ชัน Login และ Logout

"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

// --- Import ข้อมูลผู้ใช้จำลอง (Mock Data) ---
import { user } from "@/Data/user";
import { leader } from "@/Data/leader";
import { admin } from "@/Data/admin";
import { executive } from "@/Data/executive";
import { showError } from "@/lib/sweetalert";

// รวมข้อมูลผู้ใช้ทุก Role ไว้ใน Array เดียวเพื่อความสะดวกในการค้นหา
const allUsers = [...user, ...leader, ...admin, ...executive];

// --- กำหนดโครงสร้างข้อมูลของ AuthContext ---
type AuthContextType = {
  user: any | null; // ข้อมูลผู้ใช้ที่ Login อยู่ (null = ยังไม่ Login)
  loading: boolean; // สถานะการโหลดข้อมูล (true = กำลังตรวจสอบ)
  login: (email: string, password: string) => boolean; // ฟังก์ชันเข้าสู่ระบบ
  logout: () => void; // ฟังก์ชันออกจากระบบ
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- AuthProvider Component ---
// ทำหน้าที่ให้บริการข้อมูล Auth แก่ Component ลูกๆ ในแอปพลิเคชัน
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State เก็บข้อมูลผู้ใช้ปัจจุบัน
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  // State เก็บสถานะการโหลด (เริ่มต้นเป็น true เพื่อรอตรวจสอบ Session)
  const [loading, setLoading] = useState<boolean>(true);

  // --- ฟังก์ชัน: อัปเดตข้อมูลผู้ใช้จาก LocalStorage ---
  // ใช้สำหรับซิงค์ข้อมูลเมื่อมีการแก้ไขโปรไฟล์ (เช่น เปลี่ยนชื่อ, รูปภาพ)
  const updateUserFromStorage = useCallback(() => {
    const savedUser = sessionStorage.getItem("user");
    if (!savedUser) return;

    try {
      const currentUserData = JSON.parse(savedUser);

      // โหลดข้อมูล personnel จาก localStorage (ข้อมูลกลางที่แก้ไขได้)
      const STORAGE_KEY = "techjob_personnel_data";
      const storedPersonnel = localStorage.getItem(STORAGE_KEY);

      if (storedPersonnel) {
        const personnelData = JSON.parse(storedPersonnel);

        // ค้นหาข้อมูล user ที่ตรงกับ ID ปัจจุบัน
        const updatedUserData = personnelData.find(
          (p: any) =>
            String(p.originalId) === String(currentUserData.id) ||
            (p.id && String(p.id) === String(currentUserData.id))
        );

        if (updatedUserData) {
          // ผสานข้อมูล (Merge) ข้อมูลเดิมกับข้อมูลใหม่
          const mergedUser = {
            ...updatedUserData,
            // คง ID เดิมไว้เพื่อป้องกันปัญหาความไม่เข้ากันของข้อมูล
            id: currentUserData.id,
            // ใช้ password เดิมถ้าไม่ได้แก้ไข
            password: updatedUserData.password || currentUserData.password,
            // ใช้ข้อมูลที่อัปเดตแล้ว
            fname: updatedUserData.fname || currentUserData.fname,
            lname: updatedUserData.lname || currentUserData.lname,
            avatarUrl:
              updatedUserData.urlImage ||
              updatedUserData.avatarUrl ||
              currentUserData.avatarUrl,
            department:
              updatedUserData.department || currentUserData.department,
            position: updatedUserData.position || currentUserData.position,
            phone: updatedUserData.phone || currentUserData.phone,
            address: updatedUserData.address || currentUserData.address,
          };

          // อัปเดตทั้ง State และ SessionStorage
          setCurrentUser(mergedUser);
          sessionStorage.setItem("user", JSON.stringify(mergedUser));
        }
      }
    } catch (error) {
      console.error("Error updating user from storage:", error);
    }
  }, []);

  // --- Effect: ตรวจสอบสถานะการ Login เมื่อเปิดหน้าเว็บ ---
  useEffect(() => {
    // ตรวจสอบว่ามีข้อมูล User ใน SessionStorage หรือไม่
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      // ถ้ามี -> Set User และอัปเดตข้อมูลล่าสุด
      setCurrentUser(JSON.parse(savedUser));
      updateUserFromStorage();
    }
    // จบการทำงานของ Loading (พร้อมแสดงผลหน้าเว็บ)
    setLoading(false);
  }, []);

  // --- Effect: ฟัง Event เมื่อมีการแก้ไขข้อมูล Personnel ---
  useEffect(() => {
    const handlePersonnelDataChanged = () => {
      updateUserFromStorage();
    };

    window.addEventListener("personnelDataChanged", handlePersonnelDataChanged);

    return () => {
      window.removeEventListener(
        "personnelDataChanged",
        handlePersonnelDataChanged
      );
    };
  }, [updateUserFromStorage]);

  // --- ฟังก์ชัน: เข้าสู่ระบบ (Login) ---
  const login = (email: string, password: string) => {
    // ค้นหา User จาก Mock Data ที่ตรงกับ Email และ Password
    const foundUser = allUsers.find(
      (person) => person.email === email && person.password === password
    );

    if (foundUser) {
      // ถ้าเจอ -> บันทึก Session และอัปเดต State
      sessionStorage.setItem("user", JSON.stringify(foundUser));
      setCurrentUser(foundUser);
      return true;
    } else {
      // ถ้าไม่เจอ -> แสดง Error
      showError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return false;
    }
  };

  // --- ฟังก์ชัน: ออกจากระบบ (Logout) ---
  const logout = () => {
    // ลบ Session และเคลียร์ State
    sessionStorage.removeItem("user");
    setCurrentUser(null);
  };

  // ค่าที่จะส่งให้ Component อื่นๆ ใช้งาน
  const value: AuthContextType = {
    user: currentUser,
    loading,
    login,
    logout,
  };

  // แสดง Loading Screen ระหว่างรอตรวจสอบ Session
  if (loading) {
    return <div className="min-h-screen w-full" />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Hook สำหรับเรียกใช้ AuthContext ---
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
