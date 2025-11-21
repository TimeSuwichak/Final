"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

import { user } from "@/Data/user";
import { leader } from "@/Data/leader";
import { executive } from "@/Data/executive";
import { admin } from "@/Data/admin";

import { departmentMap } from "@/Data/departmentMapping";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { JobStats } from "@/components/admin/JobStats";
import { UserJobCalendar } from "@/components/admin/UserJobCalendar";

// รวมข้อมูลเริ่มต้นทั้งหมด
const allPersonnel = [...user, ...leader, ...executive, ...admin];

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

export default function UserDetailPage() {
  const params = useParams<{ id?: string; userId?: string }>();
  const id = params.id || params.userId;
  const [person, setPerson] = useState<any>(null);

  // โหลดข้อมูลผู้ใช้ตาม id (รับมาจาก route parameter)
  const loadPersonData = useCallback(() => {
    if (!id) return;

    console.log("🔍 Loading user:", id);

    // 1) โหลดจาก localStorage ก่อน
    // ค้นหาทั้ง id และ originalId เพราะ Datauser.tsx ส่ง originalId มา
    const stored = loadPersonnelFromStorage();
    const fromLocal = stored.find((p: any) =>
      String(p.originalId) === String(id) || String(p.id) === String(id)
    );

    if (fromLocal) {
      console.log("✅ Found user in localStorage:", fromLocal);
      setPerson(normalizePerson(fromLocal));
      return;
    }

    // 2) โหลดจาก initial data
    // ค้นหาทั้ง id และ originalId (ถ้ามี)
    const fromInitial = allPersonnel.find((p: any) =>
      String(p.id) === String(id) || String(p.originalId) === String(id)
    );

    if (fromInitial) {
      console.log("📦 Found user in initial data:", fromInitial);
      setPerson(normalizePerson(fromInitial));
      return;
    }

    // 3) ไม่พบข้อมูล
    console.log("❌ User not found");
    setPerson("NOT_FOUND");
  }, [id]);

  useEffect(() => {
    loadPersonData();

    const onStorageUpdate = () => {
      console.log("🔄 Storage updated, reload...");
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

  // UI ไม่พบข้อมูล
  if (person === "NOT_FOUND") {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold">ไม่พบข้อมูลผู้ใช้</h2>
        <p className="text-muted-foreground">ไม่พบข้อมูลสำหรับ ID: {id}</p>
        <Button asChild>
          <Link to="/admin/datauser">กลับไปหน้ารายชื่อ</Link>
        </Button>
      </div>
    );
  }

  // UI แสดงข้อมูล
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <Button asChild variant="outline">
        <Link to={person.role === "admin" ? "/admin/datauser" : "/"}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {person.role === "admin" ? "กลับไปหน้ารายชื่อ" : "กลับ"}
        </Link>
      </Button>

      {/* ส่วนบน: ข้อมูลโปรไฟล์และสถิติงาน */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* กล่องด้านซ้าย: รายละเอียดโปรไฟล์ */}
        <Card>
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
              <AvatarImage src={person.urlImage} />
              <AvatarFallback className="text-3xl">
                {person.fname?.[0] || "U"}
                {person.lname?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{person.fname} {person.lname}</CardTitle>
            <CardDescription className="text-lg">{person.position}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">แผนก</p>
                  <p className="font-medium">{departmentMap[person.department] || person.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ตำแหน่ง</p>
                  <p className="font-medium">{person.position}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">อีเมล</p>
                  <p className="font-medium">{person.email}</p>
                </div>
                {person.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">ที่อยู่</p>
                    <p className="font-medium">{person.address}</p>
                  </div>
                )}
                {person.idCard && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">เลขบัตรประชาชน</p>
                    <p className="font-medium">{person.idCard}</p>
                  </div>
                )}
                {person.religion && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">ศาสนา</p>
                    <p className="font-medium">{person.religion}</p>
                  </div>
                )}
                {person.nationality && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">สัญชาติ</p>
                    <p className="font-medium">{person.nationality}</p>
                  </div>
                )}
                {person.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">เบอร์โทรศัพท์</p>
                    <p className="font-medium">{person.phone}</p>
                  </div>
                )}
                {person.startDate && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">วันที่เข้าทำงาน</p>
                    <p className="font-medium">{new Date(person.startDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t space-y-2">
                <p>
                  <strong>สถานะ:</strong>
                  <span
                    className={`capitalize px-2 py-1 rounded-full text-xs ml-2 ${person.status === "available"
                      ? "bg-green-400 text-gray-700"
                      : "bg-red-400 text-gray-200"
                      }`}
                  >
                    {person.status}
                  </span>
                </p>
                <p>
                  <strong>บทบาท:</strong>
                  <span className="capitalize px-2 py-1 bg-secondary rounded-full text-xs ml-2">
                    {person.role}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* กล่องด้านขวา: สถิติงาน */}
        <JobStats userId={person.originalId || person.id} />
      </div>

      {/* ส่วนล่าง: ปฏิทินงาน */}
      <UserJobCalendar userId={person.originalId || person.id} />
    </div>
  );
}
