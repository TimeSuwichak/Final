"use client";

import React from "react";
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

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();

  // --- Logic การค้นหา (ถูกต้องแล้ว) ---
  const person = allPersonnel.find(p => String(p.id) === userId);

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
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
                <AvatarImage src={person.avatarUrl} />
                <AvatarFallback className="text-3xl">
                    {person.fname[0]}{person.lname[0]}
                </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{person.fname} {person.lname}</CardTitle>
            <CardDescription className="text-lg">{person.position}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
                <p><strong>แผนก:</strong> {departmentMap[person.department] || person.department}</p>
                <p><strong>Email:</strong> {person.email}</p>
                <p><strong>เบอร์โทรศัพท์:</strong> {person.phone}</p>
                <p><strong>ที่อยู่:</strong> {person.address}</p>
                <p><strong>Role:</strong> <span className="capitalize px-2 py-1 bg-secondary rounded-full text-xs">{person.role}</span></p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}