"use client"
import React from "react";

export default function ChatBubble({ msg }: { msg: any }) {
  const isUser = msg.sender === "user";
  const base = `p-3 rounded-2xl max-w-[80%] ${isUser ? "bg-blue-600 text-white" : "bg-muted text-foreground"}`;
  return (
    <div className={base}>
      {msg.type === "text" && <div>{msg.text}</div>}
      {msg.type === "image" && msg.url && (
        <img src={msg.url} alt="chat-img" className="rounded-md max-w-full" />
      )}
      <div className="text-xs text-muted-foreground mt-1">
        {msg.timestamp && (
          typeof msg.timestamp.toDate === 'function'
            ? msg.timestamp.toDate().toLocaleString('th-TH')
            : new Date(msg.timestamp).toLocaleString('th-TH')
        )}
      </div>
    </div>
  );
}
