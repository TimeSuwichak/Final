"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

// --- ✨ [สำคัญ] Import ข้อมูลทุก Role เข้ามาให้ครบ ✨ ---
import { user } from "@/Data/user";
import { leader } from "@/Data/leader";
import { executive } from "@/Data/executive";
import { admin } from "@/Data/admin";

import { departmentMap } from "@/Data/departmentMapping";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// --- ✨ [สำคัญ] รวมข้อมูลทั้งหมดไว้ในที่เดียว นอก Component ✨ ---
const allPersonnel = [...user, ...leader, ...executive, ...admin];

// ฟังก์ชันสำหรับโหลดข้อมูลจาก Local Storage
const loadPersonnelFromStorage = () => {
  try {
    const stored = localStorage.getItem("techjob_personnel_data");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
  }
  return null;
};

// สร้างข้อมูลเริ่มต้นแบบ formatted
const initialFormattedPersonnel = allPersonnel.map((person, index) => {
  const fullName = `${person.fname} ${person.lname}`;
  return {
    id: `${person.department.slice(0, 4)}-${person.id}-${index}`,
    originalId: person.id,
    name: fullName,
    email: person.email,
    position: person.position,
    department: person.department,
    urlImage: person.avatarUrl,
    role: (person as any).role || "user",
    // เก็บข้อมูลเพิ่มเติมสำหรับแสดงในหน้า detail
    fname: person.fname,
    lname: person.lname,
    phone: person.phone,
    address: person.address,
    idCard: (person as any).idCard,
    startDate: (person as any).startDate,
    status: (person as any).status,
  };
});

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [person, setPerson] = useState<any>(null);
  const [dataVersion, setDataVersion] = useState(0); // เพิ่ม state เพื่อ force reload

  // ฟังก์ชันสำหรับโหลดและอัปเดตข้อมูล
  const loadPersonData = useCallback(() => {
    if (!userId) {
      setPerson(null);
      return;
    }

    // โหลดข้อมูลจาก Local Storage ก่อน
    const storedData = loadPersonnelFromStorage();
    console.log("🔍 [UserDetailPage] Loading user data for userId:", userId);
    console.log("📦 [UserDetailPage] Stored data from localStorage:", storedData);

    // ถ้ามีข้อมูลใน localStorage ให้ใช้ข้อมูลนั้นก่อน
    if (storedData && Array.isArray(storedData) && storedData.length > 0) {
      console.log("✅ [UserDetailPage] Using data from localStorage");
      // ค้นหาจาก localStorage โดยใช้ originalId
      const foundPerson = storedData.find((p: any) => String(p.originalId) === String(userId));

      if (foundPerson) {
        console.log("✅ [UserDetailPage] Found person in localStorage:", foundPerson);
        // อัปเดต state โดยตรงเพื่อให้ re-render เสมอ
        setPerson((prevPerson: any) => {
          // เปรียบเทียบข้อมูลเพื่อดูว่ามีการเปลี่ยนแปลงหรือไม่
          const prevStr = JSON.stringify(prevPerson);
          const foundStr = JSON.stringify(foundPerson);
          const isDifferent = !prevPerson || prevStr !== foundStr;

          // อัปเดต dataVersion ทุกครั้งเพื่อ force re-render
          setDataVersion(v => v + 1);

          if (isDifferent) {
            console.log("🔄 [UserDetailPage] Data changed, updating state");
            console.log("Old:", prevPerson);
            console.log("New:", foundPerson);
          } else {
            console.log("ℹ️ [UserDetailPage] Data unchanged, but still updating state");
          }

          // Return ข้อมูลใหม่เสมอเพื่อให้แน่ใจว่า state อัปเดต
          return foundPerson;
        });
        return;
      } else {
        console.log("❌ [UserDetailPage] Person not found in localStorage, userId:", userId);
        console.log("Available originalIds:", storedData.map((p: any) => p.originalId));
      }
    } else {
      console.log("⚠️ [UserDetailPage] No data in localStorage, using initial data");
    }

    // ถ้าไม่เจอใน localStorage ให้ค้นหาใน initialFormattedPersonnel
    const foundInInitial = initialFormattedPersonnel.find((p: any) => String(p.originalId) === String(userId));
    if (foundInInitial) {
      console.log("✅ [UserDetailPage] Found person in initial data:", foundInInitial);
      setPerson(foundInInitial);
      return;
    }

    // ถ้ายังไม่เจอ ให้ค้นหาใน mock data เป็นทางเลือกสุดท้าย
    const mockPerson = allPersonnel.find(p => String(p.id) === String(userId));
    if (mockPerson) {
      console.log("⚠️ [UserDetailPage] Using mock data as fallback:", mockPerson);
      const formattedPerson = {
        id: `${mockPerson.department.slice(0, 4)}-${mockPerson.id}-0`,
        originalId: mockPerson.id,
        name: `${mockPerson.fname} ${mockPerson.lname}`,
        email: mockPerson.email,
        position: mockPerson.position,
        department: mockPerson.department,
        urlImage: mockPerson.avatarUrl,
        role: (mockPerson as any).role || "user",
        fname: mockPerson.fname,
        lname: mockPerson.lname,
        phone: mockPerson.phone,
        address: mockPerson.address,
        idCard: (mockPerson as any).idCard,
        startDate: (mockPerson as any).startDate,
        status: (mockPerson as any).status,
      };
      setPerson(formattedPerson);
    } else {
      console.log("❌ [UserDetailPage] Person not found anywhere");
      setPerson(null);
    }
  }, [userId]);

  // Reset state เมื่อ userId เปลี่ยน
  useEffect(() => {
    setPerson(null);
    setDataVersion(0);
  }, [userId]);

  useEffect(() => {
    // โหลดข้อมูลครั้งแรก
    console.log("🚀 [UserDetailPage] Component mounted or userId changed, loading data...");
    loadPersonData();

    // Listen การเปลี่ยนแปลงใน Local Storage (จากหน้าอื่น)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "techjob_personnel_data") {
        console.log("📢 [UserDetailPage] Storage changed (from other tab), reloading...");
        loadPersonData();
      }
    };

    // Listen การเปลี่ยนแปลงใน Local Storage (จากหน้าปัจจุบัน)
    const handleCustomStorageChange = () => {
      console.log("📢 [UserDetailPage] Custom event fired, reloading...");
      // Force reload by resetting state first
      setPerson(null);
      setTimeout(() => {
        loadPersonData();
      }, 100);
    };

    // เพิ่ม interval เพื่อตรวจสอบการเปลี่ยนแปลงทุก 500ms
    const interval = setInterval(() => {
      loadPersonData();
    }, 500);

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", () => {
      console.log("👀 [UserDetailPage] Window focused, reloading...");
      loadPersonData();
    });
    window.addEventListener("personnelDataChanged", handleCustomStorageChange);

    // เพิ่ม visibilitychange event เพื่อ reload เมื่อกลับมาหน้านี้
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ [UserDetailPage] Page visible, reloading...");
        loadPersonData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", loadPersonData);
      window.removeEventListener("personnelDataChanged", handleCustomStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, loadPersonData]);

  if (person === null) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold">กำลังโหลดข้อมูล...</h2>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold">ไม่พบข้อมูลผู้ใช้</h2>
        <p className="text-muted-foreground">ไม่พบข้อมูลสำหรับ ID: {userId}</p>
        <Button asChild>
          <Link to="/admin/Datauser">กลับไปหน้ารายชื่อ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <Button asChild variant="outline">
        <Link to="/admin/Datauser">
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปหน้ารายชื่อ
        </Link>
      </Button>

      <Card key={`person-${userId}-${dataVersion}`} className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
            <AvatarImage src={person.urlImage || person.avatarUrl} />
            <AvatarFallback className="text-3xl">
              {(person.fname || person.name?.split(" ")[0] || "")[0]}{(person.lname || person.name?.split(" ").slice(1).join(" ") || "")[0]}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{person.fname && person.lname ? `${person.fname} ${person.lname}` : person.name}</CardTitle>
          <CardDescription className="text-lg">{person.position}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p><strong>แผนก:</strong> {departmentMap[person.department] || person.department}</p>
            <p><strong>Email:</strong> {person.email}</p>
            <p><strong>ตำแหน่ง:</strong> {person.position}</p>
            {person.phone && <p><strong>เบอร์โทรศัพท์:</strong> {person.phone}</p>}
            {person.address && <p><strong>ที่อยู่:</strong> {person.address}</p>}
            {person.idCard && <p><strong>เลขบัตรประชาชน:</strong> {person.idCard}</p>}
            {person.startDate && <p><strong>วันที่เริ่มงาน:</strong> {person.startDate}</p>}
            {person.status && (
              <p><strong>สถานะ:</strong>
                <span className={`capitalize px-2 py-1 rounded-full text-xs ml-2 ${person.status === "available"
                  ? "bg-green-400 text-gray-700"
                  : "bg-red-400 text-gray-200"
                  }`}>
                  {person.status}
                </span>
              </p>
            )}
            <p><strong>Role:</strong> <span className="capitalize px-2 py-1 bg-secondary rounded-full text-xs">{person.role || "user"}</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}