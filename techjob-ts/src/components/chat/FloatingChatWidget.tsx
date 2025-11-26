// src/components/chat/FloatingChatWidget.tsx
"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import UserChat from "./UserChat";
import { useAuth } from "@/contexts/AuthContext";

export default function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const userId = String(user?.id ?? "guest");

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("chat_widget_open");
    if (savedState === "true") {
      setOpen(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("chat_widget_open", String(open));
  }, [open]);

  return (
    <>
      <div className="fixed right-6 bottom-6 z-50">
        {open ? (
          <div className="w-[360px] h-[480px] bg-card rounded-2xl shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">S</div>
                <div>
                  <div className="font-semibold">ฝ่ายสนับสนุน</div>
                  <div className="text-xs text-muted-foreground">ตอบเร็วที่สุด</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-muted">
                <X />
              </button>
            </div>

            <div className="flex-1 p-3">
              <UserChat userId={userId} />
            </div>
          </div>
        ) : (
          <Button className="rounded-full p-4 bg-blue-600 hover:bg-blue-700" onClick={() => setOpen(true)}>
            <MessageCircle className="w-5 h-5 text-white" />
          </Button>
        )}
      </div>
    </>
  );
}
