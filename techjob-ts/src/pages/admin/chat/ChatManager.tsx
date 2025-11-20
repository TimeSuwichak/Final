"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare } from "lucide-react";
import { user as userData } from "@/Data/user";
import { leader as leaderData } from "@/Data/leader";
import { admin as adminData } from "@/Data/admin";
import { executive as executiveData } from "@/Data/executive";

interface ChatItem {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastSender?: string;
  updatedAt?: number;
  otherUserId?: string;
  otherUserName?: string;
  otherUserRole?: string;
  otherUserPosition?: string;
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

interface AdminChatListProps {
  currentUserId: string;
  onSelect: (chatId: string, otherUserId: string) => void;
}

export function AdminChatList({ currentUserId, onSelect }: AdminChatListProps) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chats"), async (snap) => {
      const chatList: ChatItem[] = [];

      for (const doc of snap.docs) {
        const data = doc.data();
        const participants: string[] = data.participants || [];

        // ตรวจสอบว่า currentUser มีส่วนร่วมในแชทหรือไม่
        if (!participants.includes(currentUserId)) continue;

        // หาผู้ใช้คนอื่น ๆ ในแชท
        const otherUserIds = participants.filter((p) => p !== currentUserId);
        const otherUserId = otherUserIds[0];

        if (!otherUserId) continue;

        const otherUser = getUserById(otherUserId);

        chatList.push({
          id: doc.id,
          participants,
          lastMessage: data.lastMessage || "",
          lastSender: data.lastSender || "",
          updatedAt: data.updatedAt || 0,
          otherUserId,
          otherUserName: otherUser
            ? `${otherUser.fname} ${otherUser.lname}`
            : otherUserId,
          otherUserRole: otherUser?.role || "",
          otherUserPosition: otherUser?.position || "",
        });
      }

      // เรียงลำดับตามเวลาล่าสุด
      chatList.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setChats(chatList);
    });

    return () => unsub();
  }, [currentUserId]);

  const filteredChats = chats.filter((chat) =>
    (chat.otherUserName || "").toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาแชท..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <Card
              key={chat.id}
              className="p-3 cursor-pointer hover:shadow-md transition"
              onClick={() =>
                onSelect(chat.id, chat.otherUserId || "")
              }
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(chat.otherUserName || "?")
                    .split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {chat.otherUserName || chat.otherUserId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {chat.otherUserPosition || chat.otherUserRole}
                  </div>
                  <div className="text-sm text-muted-foreground truncate mt-1">
                    {chat.lastMessage || "(ไม่มีข้อความ)"}
                  </div>
                  {chat.updatedAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(chat.updatedAt).toLocaleString("th-TH")}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>ไม่มีแชท</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
