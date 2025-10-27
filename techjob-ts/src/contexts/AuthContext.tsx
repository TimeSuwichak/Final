// src/contexts/AuthContext.tsx
"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';

// --- 1. IMPORT ข้อมูลผู้ใช้ทั้งหมดเข้ามา ---
import { user } from '@/data/user';
import { leader } from '@/data/leader';
import { admin } from '@/data/admin';
import { executive } from '@/data/executive';

// --- 2. รวมข้อมูลทุก Role ไว้ในถังเดียว เพื่อง่ายต่อการค้นหา ---
const allUsers = [...user, ...leader, ...admin, ...executive]; 

// --- 3. สร้าง "กล่อง" สำหรับเก็บข้อมูล Login ---
const AuthContext = createContext(null);

// --- 4. สร้าง "ตัวจัดการ" ที่จะควบคุมข้อมูลในกล่อง (นี่คือสมองหลัก) ---
export const AuthProvider = ({ children }) => {
    // State สำหรับเก็บข้อมูล user ที่ login อยู่
    const [currentUser, setCurrentUser] = useState(null);
    // State สำหรับบอกว่า "กำลังตรวจสอบข้อมูล Login อยู่หรือเปล่า?" (แก้จอกระพริบ)
    const [loading, setLoading] = useState(true);

    // --- Logic: ตรวจสอบการ Login ค้างไว้ ตอนเปิดเว็บครั้งแรก ---
    useEffect(() => {
        // ลองเปิด "กระเป๋าเงิน" (localStorage) ดูว่ามีข้อมูล 'user' เก็บอยู่ไหม
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            // ถ้ามี -> เอาข้อมูลมาใช้เลย
            setCurrentUser(JSON.parse(savedUser));
        }
        // ไม่ว่าจะเจอหรือไม่เจอ ก็บอกว่า "ตรวจสอบเสร็จแล้ว!"
        setLoading(false); 
    }, []); // `[]` หมายถึงให้โค้ดส่วนนี้ทำงานแค่ "ครั้งเดียว" ตอนเปิดเว็บ

    // --- ฟังก์ชันสำหรับ "เข้าสู่ระบบ" ---
    const login = (email: string, password: string) => {
        const foundUser = allUsers.find(
            person => person.email === email && person.password === password
        );

        if (foundUser) {
            // ถ้าเจอ -> บันทึกข้อมูลลง "กระเป๋าเงิน"
            localStorage.setItem('user', JSON.stringify(foundUser));
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
        localStorage.removeItem('user');
        // เคลียร์ state ปัจจุบัน
        setCurrentUser(null);
    };

    // --- 5. ข้อมูลทั้งหมดที่จะส่งให้ Component อื่นๆ ใช้งาน ---
    const value = { 
        user: currentUser, // ข้อมูล user ที่ login อยู่
        loading,           // สถานะ "กำลังตรวจสอบ"
        login,             // ฟังก์ชัน login
        logout             // ฟังก์ชัน logout
    };

    // ถ้ายังตรวจสอบไม่เสร็จ ให้แสดงหน้าขาวๆ รอไปก่อน (กันจอกระพริบ)
    if (loading) {
        return <div className="min-h-screen w-full" />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// --- 6. สร้าง "ทางลัด" สำหรับเรียกใช้ข้อมูล ---
export const useAuth = () => {
    return useContext(AuthContext);
};