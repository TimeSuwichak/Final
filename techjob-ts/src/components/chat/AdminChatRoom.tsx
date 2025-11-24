"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ChatInput from "./ChatInput";
import ChatBubble from "./ChatBubble";
import { useNotifications } from "@/contexts/NotificationContext";
import { user as userData } from "@/Data/user";
import { showError } from "@/lib/sweetalert";

export default function AdminChatRoom({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { addNotification } = useNotifications();

  // mark seen
  useEffect(() => {
    if (userId) {
      setDoc(doc(db, "chats", userId), { adminSeen: true }, { merge: true });
    }
  }, [userId]);

  // load messages and mark user messages as read
  useEffect(() => {
    const q = query(
      collection(db, "chats", userId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Mark user messages as read when admin views them
      msgs.forEach((msg: any) => {
        if (msg.sender === "user" && !msg.read) {
          // Note: In a real app, you'd update the document here
          // For now, we'll handle this in the component
        }
      });

      setMessages(msgs);
    });
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(payload: { type: "text"; text: string } | { type: "image"; url: string }) {
    if (!payload) return;
    try {
      const msgDoc: any = {
        sender: "admin",
        type: payload.type,
        text: payload.type === "text" ? payload.text : "",
        url: payload.type === "image" ? payload.url : "",
        timestamp: serverTimestamp(),
        read: false,
      };

      await addDoc(collection(db, "chats", userId, "messages"), msgDoc);

      const chatMetaRef = doc(db, "chats", userId);
      await setDoc(
        chatMetaRef,
        {
          lastMessage: payload.type === "text" ? payload.text : "[รูปภาพ]",
          lastSender: "admin",
          updatedAt: serverTimestamp(),
          userSeen: false,
          hasUnreadForAdmin: false,
        },
        { merge: true }
      );

      // ส่งการแจ้งเตือนให้ผู้ใช้
      const userInfo = userData.find((u) => String(u.id) === userId);
      if (userInfo) {
        const messagePreview = payload.type === "text" ? payload.text : "[รูปภาพ]";
        // debug logs removed
        addNotification({
          title: "ข้อความใหม่จากแอดมิน",
          message: messagePreview.substring(0, 100),
          recipientRole: "user",
          recipientId: userId,
          metadata: { type: "new_chat_message", senderId: "admin", targetId: userId },
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showError("เกิดข้อผิดพลาดในการส่งข้อความ", "กรุณาลองใหม่อีกครั้ง");
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg p-3 bg-card">
      <div className="flex-1 overflow-y-auto px-2 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : ""}`}>
            <ChatBubble msg={m} />
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="mt-3">
        <ChatInput onSend={send} chatId={userId} />
      </div>
    </div>
  );
}

