"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import UnifiedChatInterface from "@/components/chat/UnifiedChatInterface";

export default function ChatPage() {
  const { user } = useAuth();
  // ใช้ originalId ถ้ามี ไม่งั้นใช้ id (เพื่อให้ตรงกับ ID ในฐานข้อมูล)
  const currentUserId = String(user?.originalId ?? user?.id ?? "guest");

  if (!user) {
    return <div className="p-6">กรุณาลงชื่อเข้าใช้</div>;
  }

  return (
    <div className="p-6 h-full">
      <UnifiedChatInterface currentUserId={currentUserId} />
    </div>
  );
}
