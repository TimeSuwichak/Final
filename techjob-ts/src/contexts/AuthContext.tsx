// src/contexts/AuthContext.tsx
"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

// --- 1. IMPORT ข้อมูลผู้ใช้ทั้งหมดเข้ามา ---
import { user } from "@/Data/user";
import { leader } from "@/Data/leader";
import { admin } from "@/Data/admin";
import { executive } from "@/Data/executive";

// --- 2. รวมข้อมูลทุก Role ไว้ในถังเดียว เพื่อง่ายต่อการค้นหา ---
const allUsers = [...user, ...leader, ...admin, ...executive];

// --- 3. สร้าง "กล่อง" สำหรับเก็บข้อมูล Login ---
type AuthContextType = {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 4. สร้าง "ตัวจัดการ" ที่จะควบคุมข้อมูลในกล่อง (นี่คือสมองหลัก) ---
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State สำหรับเก็บข้อมูล user ที่ login อยู่
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  // State สำหรับบอกว่า "กำลังตรวจสอบข้อมูล Login อยู่หรือเปล่า?" (แก้จอกระพริบ)
  const [loading, setLoading] = useState<boolean>(true);

  // --- ฟังก์ชันสำหรับอัปเดตข้อมูล user จาก localStorage ---
  const updateUserFromStorage = useCallback(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    try {
      const currentUserData = JSON.parse(savedUser);

      // โหลดข้อมูล personnel จาก localStorage
      const STORAGE_KEY = "techjob_personnel_data";
      const storedPersonnel = localStorage.getItem(STORAGE_KEY);

      if (storedPersonnel) {
        const personnelData = JSON.parse(storedPersonnel);

        // ค้นหาข้อมูล user ที่ตรงกับ originalId หรือ id (แบบเข้มงวด)
        // ตัดการเช็ค email ออกเพื่อป้องกันการสวมรอยถ้า email ซ้ำ
        const updatedUserData = personnelData.find(
          (p: any) =>
            String(p.originalId) === String(currentUserData.id) ||
            (p.id && String(p.id) === String(currentUserData.id))
        );

        if (updatedUserData) {
          // อัปเดตข้อมูล user โดยคงข้อมูลบางอย่างไว้ (เช่น password)
          const mergedUser = {
            ...currentUserData,
            ...updatedUserData,
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

          // อัปเดตทั้ง state และ localStorage
          setCurrentUser(mergedUser);
          localStorage.setItem("user", JSON.stringify(mergedUser));
        }
      }
    } catch (error) {
      console.error("Error updating user from storage:", error);
    }
  }, []);

  // --- Logic: ตรวจสอบการ Login ค้างไว้ ตอนเปิดเว็บครั้งแรก ---
  useEffect(() => {
    // ลองเปิด "กระเป๋าเงิน" (localStorage) ดูว่ามีข้อมูล 'user' เก็บอยู่ไหม
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      // ถ้ามี -> เอาข้อมูลมาใช้เลย
      setCurrentUser(JSON.parse(savedUser));
      // อัปเดตข้อมูลจาก personnel storage ด้วย
      updateUserFromStorage();
    }
    // ไม่ว่าจะเจอหรือไม่เจอ ก็บอกว่า "ตรวจสอบเสร็จแล้ว!"
    setLoading(false);
  }, []); // `[]` หมายถึงให้โค้ดส่วนนี้ทำงานแค่ "ครั้งเดียว" ตอนเปิดเว็บ

  // --- ฟัง event เมื่อมีการอัปเดตข้อมูล personnel ---
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
  }, [updateUserFromStorage]); // ฟัง event ตลอดเวลา

  // --- ฟังก์ชันสำหรับ "เข้าสู่ระบบ" ---
  const login = (email: string, password: string) => {
    const foundUser = allUsers.find(
      (person) => person.email === email && person.password === password
    );

    if (foundUser) {
      // ถ้าเจอ -> บันทึกข้อมูลลง "กระเป๋าเงิน"
      localStorage.setItem("user", JSON.stringify(foundUser));
      // อัปเดต state ปัจจุบัน
      setCurrentUser(foundUser);
      return true;
    } else {
      // ถ้าไม่เจอ -> แจ้งเตือน
      alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return false;
    }
  };

  // --- ฟังก์ชันสำหรับ "ออกจากระบบ" ---
  const logout = () => {
    // เอาข้อมูลออกจาก "กระเป๋าเงิน"
    localStorage.removeItem("user");
    // เคลียร์ state ปัจจุบัน
    setCurrentUser(null);
  };

  // --- 5. ข้อมูลทั้งหมดที่จะส่งให้ Component อื่นๆ ใช้งาน ---
  const value: AuthContextType = {
    user: currentUser, // ข้อมูล user ที่ login อยู่
    loading, // สถานะ "กำลังตรวจสอบ"
    login, // ฟังก์ชัน login
    logout, // ฟังก์ชัน logout
  };

  // ถ้ายังตรวจสอบไม่เสร็จ ให้แสดงหน้าขาวๆ รอไปก่อน (กันจอกระพริบ)
  if (loading) {
    return <div className="min-h-screen w-full" />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- 6. สร้าง "ทางลัด" สำหรับเรียกใช้ข้อมูล ---
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
