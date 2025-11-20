"use client";

import React, { useState, useMemo } from "react";
import { user as userData } from "@/Data/user";
import { leader as leaderData } from "@/Data/leader";
import { admin as adminData } from "@/Data/admin";
import { executive as executiveData } from "@/Data/executive";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

interface UserItem {
  id: number | string;
  fname: string;
  lname: string;
  role: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
  status?: string;
}

const roleLabels: { [key: string]: string } = {
  user: "ช่างเทคนิค",
  leader: "หัวหน้า",
  admin: "แอดมิน",
  executive: "ผู้บริหาร",
};

const departmentLabels: { [key: string]: string } = {
  network_security: "ความปลอดภัยเครือข่าย",
  smart_building_multimedia: "อาคารอัตโนมัติและมัลติมีเดีย",
  infrastructure_electrical: "โครงสร้างพื้นฐาน/ไฟฟ้า",
  project_management: "จัดการโครงการ",
  administration: "บริหารทั่วไป",
  executive: "ผู้บริหาร",
};

export default function UserContactList({
  currentUserId,
  onSelect,
}: {
  currentUserId: string | number;
  onSelect: (user: UserItem) => void;
}) {
  const [searchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // รวมผู้ใช้ทั้งหมดจากทุก role
  const allUsers = useMemo(
    () => [
      ...userData.map((u) => ({ ...u, id: String(u.id) })),
      ...leaderData.map((u) => ({ ...u, id: String(u.id) })),
      ...adminData.map((u) => ({ ...u, id: String(u.id) })),
      ...executiveData.map((u) => ({ ...u, id: String(u.id) })),
    ],
    []
  );

  // กรองผู้ใช้ตามเงื่อนไข
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      // ไม่แสดงตัวเอง
      if (String(u.id) === String(currentUserId)) return false;

      // กรองตามชื่อ (ค้นหา)
      const fullName = `${u.fname} ${u.lname}`.toLowerCase();
      if (
        searchText.trim() &&
        !fullName.includes(searchText.toLowerCase())
      ) {
        return false;
      }

      // กรองตาม role
      if (selectedRole && u.role !== selectedRole) return false;

      // กรองตาม department
      if (selectedDepartment && u.department !== selectedDepartment)
        return false;

      return true;
    });
  }, [allUsers, currentUserId, searchText, selectedRole, selectedDepartment]);

  // รวบรวม roles และ departments ที่มี
  const availableRoles = useMemo(
    () => [...new Set(allUsers.map((u) => u.role))],
    [allUsers]
  );

  const availableDepartments = useMemo(
    () => [
      ...new Set(
        allUsers
          .filter((u) => !selectedRole || u.role === selectedRole)
          .map((u) => u.department)
          .filter(Boolean)
      ),
    ],
    [allUsers, selectedRole]
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* ส่วนค้นหา */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อผู้ใช้งาน..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* ฟิลเตอร์ Role */}
        <div>
          <label className="text-sm font-medium">กรองตามตำแหน่ง</label>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => setSelectedRole(null)}
              className={`px-3 py-1 rounded text-sm transition ${
                selectedRole === null
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              ทั้งหมด
            </button>
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1 rounded text-sm transition ${
                  selectedRole === role
                    ? "bg-blue-600 text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {roleLabels[role] || role}
              </button>
            ))}
          </div>
        </div>

        {/* ฟิลเตอร์ Department */}
        {availableDepartments.length > 0 && (
          <div>
            <label className="text-sm font-medium">กรองตามแผนก</label>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => setSelectedDepartment(null)}
                className={`px-3 py-1 rounded text-sm transition ${
                  selectedDepartment === null
                    ? "bg-green-600 text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                ทั้งหมด
              </button>
              {availableDepartments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    selectedDepartment === dept
                      ? "bg-green-600 text-white"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {departmentLabels[dept as string] || dept}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* รายชื่อผู้ใช้ */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <Card
              key={u.id}
              className="p-3 cursor-pointer hover:shadow-md transition"
              onClick={() => onSelect(u)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {u.fname.charAt(0)}{u.lname.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {u.fname} {u.lname}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {u.position || u.role}
                  </div>
                  {u.department && (
                    <div className="text-xs text-muted-foreground">
                      {departmentLabels[u.department] || u.department}
                    </div>
                  )}
                  {u.status && (
                    <div className="text-xs mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          u.status === "available"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {u.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>ไม่พบผู้ใช้งาน</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
