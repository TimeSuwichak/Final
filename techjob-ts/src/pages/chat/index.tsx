"use client";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import UserChat from "@/components/chat/UserChat";
import UserContactList from "@/components/chat/UserContactList";
import { useAuth } from "@/contexts/AuthContext";
import { user as userData } from "@/Data/user";
import { leader as leaderData } from "@/Data/leader";
import { admin as adminData } from "@/Data/admin";
import { executive as executiveData } from "@/Data/executive";

interface SelectedUser {
  id: string | number;
  fname: string;
  lname: string;
  role: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const currentUserId = String(user?.id ?? "guest");
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!location?.search) return;
    const params = new URLSearchParams(location.search);
    const target = params.get("target");
    if (!target) return;

    const allUsers = [
      ...userData.map((u) => ({ id: String(u.id), fname: u.fname, lname: u.lname, role: u.role, position: u.position, department: u.department, avatarUrl: u.avatarUrl })),
      ...leaderData.map((u) => ({ id: String(u.id), fname: u.fname, lname: u.lname, role: u.role, position: u.position, department: u.department, avatarUrl: u.avatarUrl })),
      ...adminData.map((u) => ({ id: String(u.id), fname: u.fname, lname: u.lname, role: u.role, position: u.position, department: u.department, avatarUrl: u.avatarUrl })),
      ...executiveData.map((u) => ({ id: String(u.id), fname: u.fname, lname: u.lname, role: u.role, position: u.position, department: u.department, avatarUrl: u.avatarUrl })),
    ];

    const found = allUsers.find((a) => a.id === target);
    if (found) setSelectedUser(found as SelectedUser);
  }, [location.search]);

  if (!user) {
    return <div className="p-6">กรุณาลงชื่อเข้าใช้</div>;
  }

  return (
    <div className="p-6 h-full flex gap-6">
      {/* ส่วนเลือกผู้ใช้ */}
      <div className="w-80 border rounded-lg p-4 bg-card">
        <h2 className="text-lg font-semibold mb-4">เลือกผู้ใช้งาน</h2>
        <UserContactList currentUserId={currentUserId} onSelect={setSelectedUser} />
      </div>

      {/* ส่วนแชท */}
      <div className="flex-1 border rounded-lg p-4 bg-card">
        {selectedUser ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 pb-4 border-b">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                {selectedUser.fname.charAt(0)}{selectedUser.lname.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{selectedUser.fname} {selectedUser.lname}</h3>
                <p className="text-xs text-muted-foreground">{selectedUser.position || selectedUser.role}</p>
              </div>
            </div>
            <UserChat userId={currentUserId} targetUserId={String(selectedUser.id)} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>เลือกผู้ใช้เพื่อเริ่มสนทนา</p>
          </div>
        )}
      </div>
    </div>
  );
}
