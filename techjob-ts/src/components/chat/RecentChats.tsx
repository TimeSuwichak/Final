"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { user as userData } from "@/Data/user";
import { leader as leaderData } from "@/Data/leader";
import { admin as adminData } from "@/Data/admin";
import { executive as executiveData } from "@/Data/executive";

interface RecentChat {
  id: string;
  participants: string[];
  otherUserId: string;
  otherUserName: string;
  lastMessage?: string;
  updatedAt?: number;
}

const getAllUsers = () => {
  return [
    ...userData.map((u) => ({ ...u, id: String(u.id) })),
    ...leaderData.map((u) => ({ ...u, id: String(u.id) })),
    ...adminData.map((u) => ({ ...u, id: String(u.id) })),
    ...executiveData.map((u) => ({ ...u, id: String(u.id) })),
  ];
};

const getUserById = (id: string | number) => {
  const allUsers = getAllUsers();
  return allUsers.find((u) => String(u.id) === String(id));
};

export function RecentChats({ currentUserId }: { currentUserId: string }) {
  const [chats, setChats] = useState<RecentChat[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chats"), async (snap) => {
      const chatList: RecentChat[] = [];

      for (const doc of snap.docs) {
        const data = doc.data();
        const participants: string[] = data.participants || [];

        if (!participants.includes(currentUserId)) continue;

        const otherUserIds = participants.filter((p) => p !== currentUserId);
        const otherUserId = otherUserIds[0];

        if (!otherUserId) continue;

        const otherUser = getUserById(otherUserId);

        chatList.push({
          id: doc.id,
          participants,
          otherUserId,
          otherUserName: otherUser
            ? `${otherUser.fname} ${otherUser.lname}`
            : otherUserId,
          lastMessage: data.lastMessage || "",
          updatedAt: data.updatedAt || 0,
        });
      }

      chatList.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setChats(chatList.slice(0, 5)); // แสดงแค่ 5 แชทล่าสุด
    });

    return () => unsub();
  }, [currentUserId]);

  if (chats.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">ยังไม่มีแชท</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <Card
          key={chat.id}
          className="p-3 cursor-pointer hover:shadow-md transition"
          onClick={() => navigate("/chat")}
        >
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {chat.otherUserName
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{chat.otherUserName}</div>
              <div className="text-xs text-muted-foreground truncate">
                {chat.lastMessage || "(ไม่มีข้อความ)"}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
