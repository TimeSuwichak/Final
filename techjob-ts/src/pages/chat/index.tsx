"use client";

import UserChat from "@/components/chat/UserChat";
import { useAuth } from "@/contexts/AuthContext";

export default function ChatPage() {
  const { user } = useAuth();
  const userId = String(user?.uid ?? user?.id ?? "guest");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">ติดต่อแอดมิน</h1>
      <UserChat userId={userId} />
    </div>
  );
}
