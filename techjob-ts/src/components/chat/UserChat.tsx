"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ChatInput from "./ChatInput";
import ChatBubble from "./ChatBubble";
import { user as userData } from "@/Data/user";
import { leader as leaderData } from "@/Data/leader";
import { admin as adminData } from "@/Data/admin";
import { executive as executiveData } from "@/Data/executive";
import { useNotifications } from "@/contexts/NotificationContext";
import { showError } from "@/lib/sweetalert";

export default function UserChat({ userId, targetUserId }: { userId: string; targetUserId?: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { addNotification } = useNotifications();

  // รวมผู้ใช้ทั้งหมด
  const allUsers = [
    ...userData.map((u) => ({ ...u, id: String(u.id) })),
    ...leaderData.map((u) => ({ ...u, id: String(u.id) })),
    ...adminData.map((u) => ({ ...u, id: String(u.id) })),
    ...executiveData.map((u) => ({ ...u, id: String(u.id) })),
  ];

  // ให้แน่ใจว่า userId เป็นสตริง (Firestore path ต้องเป็นสตริง)
  const uid = String(userId);
  // targetUserId คือคนที่จะแชทด้วย (ถ้าไม่ระบุ จะแชทกับแอดมิน)
  const target = targetUserId ? String(targetUserId) : "admin";
  // สร้าง chatId แบบเฉพาะ (เรียงตัวเลขเพื่อให้ทั้งสองฝั่งใช้ id เดียวกัน)
  const chatId = [uid, target].sort().join("_");

  // สร้าง chat meta doc ถ้ายังไม่มี
  useEffect(() => {
    if (!uid || !target) return;
    setDoc(
      doc(db, "chats", chatId),
      {
        updatedAt: Date.now(),
        participants: [uid, target],
        senders: {
          [uid]: true,
          [target]: true,
        },
      },
      { merge: true }
    );
  }, [uid, target, chatId]);

  // โหลดข้อความ realtime
  useEffect(() => {
    if (!uid || !target) return;
    
    // Clear ข้อความเดิมออกก่อนสลับห้อง
    setMessages([]);
    
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ส่งข้อความ (รองรับโครงสร้างเดียวกับฝั่งแอดมิน)
  async function send(payload: { type: "text"; text: string } | { type: "image"; url: string }) {
    if (!payload) return;
    try {
      const msgDoc: any = {
        sender: uid,
        type: payload.type,
        text: payload.type === "text" ? payload.text : "",
        url: payload.type === "image" ? payload.url : "",
        timestamp: serverTimestamp(),
        read: false,
      };

      await addDoc(collection(db, "chats", chatId, "messages"), msgDoc);

      // update meta
      const chatMetaRef = doc(db, "chats", chatId);
      await setDoc(
        chatMetaRef,
        {
          lastMessage: payload.type === "text" ? payload.text : "[รูปภาพ]",
          lastSender: uid,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // ส่งการแจ้งเตือนให้คนรับข้อความ
      // หาบทบาทและชื่อของคนรับ
      const recipientUser = allUsers.find((u) => String(u.id) === target);
      const senderUser = allUsers.find((u) => String(u.id) === uid);
      
      // ตัดสินใจว่าบทบาทของคนรับคืออะไร
      let recipientRole: "admin" | "leader" | "user" | "executive" = "user";
      
      if (target === "admin") {
        recipientRole = "admin";
      } else if (adminData.some((a) => String(a.id) === target)) {
        recipientRole = "admin";
      } else if (leaderData.some((l) => String(l.id) === target)) {
        recipientRole = "leader";
      } else if (executiveData.some((e) => String(e.id) === target)) {
        recipientRole = "executive";
      }

      const messagePreview = payload.type === "text" ? payload.text : "[รูปภาพ]";
      const senderName = senderUser ? `${senderUser.fname} ${senderUser.lname}` : "ผู้ใช้";

      // debug logs removed

      addNotification({
        title: `ข้อความใหม่จาก ${senderName}`,
        message: messagePreview.substring(0, 100),
        recipientRole,
        ...(target !== "admin" && { recipientId: target }),
        metadata: { type: "new_chat_message", senderId: uid, targetId: target },
      });
    } catch (error) {
      console.error("ส่งข้อความล้มเหลว:", error);
      showError("เกิดข้อผิดพลาดในการส่งข้อความ", "กรุณาลองใหม่อีกครั้ง");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2 bg-white dark:bg-slate-950">
        {messages.map((m) => (
          <ChatBubble 
            key={m.id}
            msg={m}
            currentUserId={uid}
            allUsers={allUsers}
          />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="mt-3 border-t pt-3">
        <ChatInput onSend={send} chatId={chatId} />
      </div>
    </div>
  );
}
