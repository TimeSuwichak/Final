"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";

interface ChatWithUser {
  id: string;
  userName?: string;
  hasUnreadForAdmin?: boolean;
  lastMessage?: string;
  updatedAt?: number;
}

export default function AdminChatList({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [chats, setChats] = useState<ChatWithUser[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chats"), async (snap) => {
      const arr: ChatWithUser[] = [];
      for (const d of snap.docs) {
        const chatData: ChatWithUser = { id: d.id, ...d.data() };

        // Try to get user info from users collection
        try {
          const userDoc = await getDoc(doc(db, "users", d.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            chatData.userName = `${userData.fname || ""} ${userData.lname || ""}`.trim() || d.id;
          } else {
            chatData.userName = d.id; // fallback to ID
          }
        } catch (error) {
          chatData.userName = d.id; // fallback to ID
        }

        arr.push(chatData);
      }
      setChats(arr);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-2">
      {chats.map((c) => (
        <Card
          key={c.id}
          className={`p-3 cursor-pointer hover:shadow-md ${
            c.hasUnreadForAdmin ? "border-red-300 bg-red-50" : ""
          }`}
          onClick={() => onSelect(c.id)}
        >
          <div className="font-medium">{c.userName || c.id}</div>
          <div className="text-sm text-muted-foreground">
            {c.lastMessage || "ยังไม่มีข้อความ"}
          </div>
          {c.updatedAt && (
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(c.updatedAt).toLocaleString("th-TH")}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
