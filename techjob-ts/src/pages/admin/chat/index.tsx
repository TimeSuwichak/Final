"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminChatList } from "./ChatManager";
import UserChat from "@/components/chat/UserChat";

export default function AdminChatPage() {
  const { user } = useAuth();
  const currentUserId = String(user?.id ?? "admin");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleSelectChat = (chatId: string, otherUserId: string) => {
    setSelectedChatId(chatId);
    setSelectedUserId(otherUserId);
  };

  if (!user) {
    return <div className="p-6">กรุณาลงชื่อเข้าใช้</div>;
  }

  return (
    <div className="p-6 grid grid-cols-3 gap-6 h-full">
      <div className="border rounded-lg p-4 bg-card">
        <h2 className="text-lg font-semibold mb-4">รายชื่อแชท</h2>
        <AdminChatList currentUserId={currentUserId} onSelect={handleSelectChat} />
      </div>

      <div className="col-span-2 border rounded-lg p-4 bg-card">
        {selectedUserId && selectedChatId ? (
          <div className="flex flex-col h-full">
            <div className="pb-4 border-b mb-4">
              <h3 className="font-semibold">ห้องแชท</h3>
            </div>
            <UserChat userId={currentUserId} targetUserId={selectedUserId} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            เลือกแชทเพื่อเริ่มสนทนา
          </div>
        )}
      </div>
    </div>
  );
}
