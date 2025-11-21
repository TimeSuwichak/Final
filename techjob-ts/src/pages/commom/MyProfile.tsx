"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { departmentMap } from "@/Data/departmentMapping";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// โหลดข้อมูลจาก localStorage
const loadPersonnelFromStorage = () => {
  try {
    const stored = localStorage.getItem("techjob_personnel_data");
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading data:", error);
  }
  return [];
};

// ฟังก์ชัน Normalize ให้ข้อมูลมีรูปแบบเหมือนกันเสมอ
const normalizePerson = (p: any) => ({
  id: p.id,
  originalId: p.originalId || p.id,
  fname: p.fname || "",
  lname: p.lname || "",
  name: `${p.fname || ""} ${p.lname || ""}`.trim(),
  email: p.email || "",
  role: p.role || "user",
  position: p.position || "พนักงาน",
  department: p.department || "other",
  phone: p.phone || "",
  address: p.address || "",
  idCard: p.idCard || "",
  startDate: p.startDate || "",
  status: p.status || "available",
  urlImage: p.urlImage || p.avatarUrl || "",
  religion: p.religion || "",
  nationality: p.nationality || "",
});

export default function MyProfile() {
  const { user: currentUser } = useAuth();
  const [person, setPerson] = useState<any>(null);

  // โหลดข้อมูลผู้ใช้จาก localStorage หรือใช้ข้อมูลจาก AuthContext
  const loadPersonData = useCallback(() => {
    if (!currentUser) return;

    // 1) โหลดจาก localStorage ก่อน
    const stored = loadPersonnelFromStorage();
    const fromLocal = stored.find((p: any) => 
      p.email === currentUser.email || 
      String(p.originalId) === String(currentUser.id) ||
      String(p.id) === String(currentUser.id)
    );

    if (fromLocal) {
      setPerson(normalizePerson(fromLocal));
      return;
    }

    // 2) ถ้าไม่เจอใน localStorage ใช้ข้อมูลจาก AuthContext
    setPerson(normalizePerson(currentUser));
  }, [currentUser]);

  useEffect(() => {
    loadPersonData();

    const onStorageUpdate = () => {
      loadPersonData();
    };

    window.addEventListener("storage", onStorageUpdate);
    window.addEventListener("personnelDataChanged", onStorageUpdate);

    return () => {
      window.removeEventListener("storage", onStorageUpdate);
      window.removeEventListener("personnelDataChanged", onStorageUpdate);
    };
  }, [loadPersonData]);

  // UI โหลดข้อมูล
  if (person === null) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold">กำลังโหลดข้อมูล...</h2>
      </div>
    );
  }

  // UI แสดงข้อมูล
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ข้อมูลส่วนตัว</h1>
        <p className="text-muted-foreground mt-2">ดูและจัดการข้อมูลส่วนตัวของคุณ</p>
      </div>

      {/* กล่องแสดงรายละเอียดโปรไฟล์ */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary">
            <AvatarImage src={person.urlImage} />
            <AvatarFallback className="text-4xl">
              {person.fname?.[0] || "U"}
              {person.lname?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{person.fname} {person.lname}</CardTitle>
          <CardDescription className="text-lg">{person.position}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-6 bg-muted rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">แผนก</p>
                <p className="font-medium text-lg">{departmentMap[person.department] || person.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">ตำแหน่ง</p>
                <p className="font-medium text-lg">{person.position}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">อีเมล</p>
                <p className="font-medium text-lg">{person.email}</p>
              </div>
              {person.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">ที่อยู่</p>
                  <p className="font-medium text-lg">{person.address}</p>
                </div>
              )}
              {person.idCard && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">เลขบัตรประชาชน</p>
                  <p className="font-medium text-lg">{person.idCard}</p>
                </div>
              )}
              {person.religion && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ศาสนา</p>
                  <p className="font-medium text-lg">{person.religion}</p>
                </div>
              )}
              {person.nationality && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">สัญชาติ</p>
                  <p className="font-medium text-lg">{person.nationality}</p>
                </div>
              )}
              {person.phone && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">เบอร์โทรศัพท์</p>
                  <p className="font-medium text-lg">{person.phone}</p>
                </div>
              )}
              {person.startDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">วันที่เข้าทำงาน</p>
                  <p className="font-medium text-lg">
                    {new Date(person.startDate).toLocaleDateString('th-TH', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">สถานะ:</p>
                <span
                  className={`capitalize px-3 py-1 rounded-full text-sm font-medium ${
                    person.status === "available"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {person.status === "available" ? "พร้อมทำงาน" : "ไม่พร้อมทำงาน"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">บทบาท:</p>
                <span className="capitalize px-3 py-1 bg-secondary rounded-full text-sm font-medium">
                  {person.role}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

