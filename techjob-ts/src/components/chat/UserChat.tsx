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

export default function UserChat({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ให้แน่ใจว่า userId เป็นสตริง (Firestore path ต้องเป็นสตริง)
  const uid = String(userId);

  // สร้าง chat root ถ้ายังไม่มี
  useEffect(() => {
    if (!uid) return;
    setDoc(
      doc(db, "chats", uid),
      {
        updatedAt: Date.now(),
        adminSeen: true,
        userSeen: true,
      },
      { merge: true }
    );
  }, [uid]);

  // โหลดข้อความ realtime และ mark as read สำหรับ admin messages
  useEffect(() => {
    const q = query(
      collection(db, "chats", uid, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
    });
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ส่งข้อความ (รองรับโครงสร้างเดียวกับฝั่งแอดมิน)
  async function send(payload: { type: "text"; text: string } | { type: "image"; url: string }) {
    if (!payload) return;
    try {
      const msgDoc: any = {
        sender: "user",
        type: payload.type,
        text: payload.type === "text" ? payload.text : "",
        url: payload.type === "image" ? payload.url : "",
        timestamp: serverTimestamp(),
        read: false,
      };

      await addDoc(collection(db, "chats", uid, "messages"), msgDoc);

      // update meta
      const chatMetaRef = doc(db, "chats", uid);
      await setDoc(
        chatMetaRef,
        {
          lastMessage: payload.type === "text" ? payload.type === "text" ? payload.text : "[รูปภาพ]" : "[รูปภาพ]",
          lastSender: "user",
          updatedAt: Date.now(),
          adminSeen: false,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("ส่งข้อความล้มเหลว:", error);
      alert("เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง");
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg p-3 bg-card text-card-foreground">
      <div className="flex-1 overflow-y-auto px-2 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : ""}`}>
            <ChatBubble msg={m} />
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="mt-3">
        <ChatInput onSend={send} />
      </div>
    </div>
  );
}
