"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadChatImage } from "@/lib/firebase-storage";
import { ImageIcon } from "lucide-react";

export default function ChatInput({ onSend }: { onSend: (payload: any) => void }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSendText() {
    const t = text.trim();
    if (!t) return;
    onSend({ type: "text", text: t });
    setText("");
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadChatImage(file);
      onSend({ type: "image", url });
    } catch (err) {
      console.error("upload failed", err);
    } finally {
      setUploading(false);
      // clear input
      (e.target as HTMLInputElement).value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="cursor-pointer p-2 rounded-md hover:bg-muted">
        <ImageIcon className="w-5 h-5" />
        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </label>

      <Input
        placeholder="พิมพ์ข้อความ..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleSendText(); }}
      />
      <Button onClick={handleSendText} disabled={uploading}>ส่ง</Button>
    </div>
  );
}
