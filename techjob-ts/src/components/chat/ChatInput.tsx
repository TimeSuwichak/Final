"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadChatImage } from "@/lib/firebase-storage";
import { ImageIcon, Send } from "lucide-react";
import { showError } from "@/lib/sweetalert";

export default function ChatInput({ onSend, chatId }: { onSend: (payload: any) => void; chatId?: string }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);

  // Persist draft per chat room so it survives refresh
  const draftKey = chatId ? `chat_draft_${chatId}` : null;

  React.useEffect(() => {
    if (draftKey) {
      try {
        const saved = localStorage.getItem(draftKey);
        if (saved) setText(saved);
      } catch (e) {
        // ignore
      }
    }
  }, [draftKey]);

  React.useEffect(() => {
    if (!draftKey) return;
    try {
      if (text) localStorage.setItem(draftKey, text);
      else localStorage.removeItem(draftKey);
    } catch (e) {
      // ignore
    }
  }, [draftKey, text]);
  async function handleSendText() {
    const t = text.trim();
    if (!t) return;
    onSend({ type: "text", text: t });
    setText("");
    if (draftKey) {
      try { localStorage.removeItem(draftKey); } catch (e) { /* ignore */ }
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadChatImage(file);
      onSend({ type: "image", url });
    } catch (err) {
      console.error("อัปโหลดรูปภาพล้มเหลว", err);
      showError("ไม่สามารถอัปโหลดรูปภาพได้", "กรุณาลองใหม่");
    } finally {
      setUploading(false);
      (e.target as HTMLInputElement).value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="cursor-pointer p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition">
        <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploading} />
      </label>

      <Input
        placeholder="พิมพ์ข้อความ..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
        disabled={uploading}
        className="flex-1"
      />
      <Button 
        onClick={handleSendText} 
        disabled={uploading || !text.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        size="icon"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
