"use client";

import React, { useState } from "react";
import AdminChatList from "@/components/chat/AdminChatList";
import AdminChatRoom from "@/components/chat/AdminChatRoom";

export default function AdminChatPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">รายชื่อผู้ใช้งาน</h2>
        <AdminChatList onSelect={setSelectedUser} />
      </div>

      <div className="col-span-2">
        {selectedUser ? (
          <AdminChatRoom userId={selectedUser} />
        ) : (
          <div className="h-[60vh] flex items-center justify-center text-muted-foreground">
            เลือกผู้ใช้เพื่อเริ่มสนทนา
          </div>
        )}
      </div>
    </div>
  );
}
