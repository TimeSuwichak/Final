"use client"
import React from "react";

interface ChatBubbleProps {
  msg: any;
  currentUserId?: string;
  allUsers?: any[];
}

export default function ChatBubble({ msg, currentUserId, allUsers = [] }: ChatBubbleProps) {
  const senderId = String(msg.sender);
  const currentId = String(currentUserId || "");
  const isCurrentUser = senderId === currentId;
  
  // หาชื่อและ avatar ของผู้ส่ง
  let displayName = "Unknown";
  let senderAvatar = "?";
  
  if (allUsers && allUsers.length > 0) {
    const sender = allUsers.find((u: any) => String(u.id) === senderId);
    if (sender) {
      displayName = `${sender.fname} ${sender.lname}`;
      senderAvatar = `${sender.fname.charAt(0)}${sender.lname.charAt(0)}`;
    }
  }

  const bubbleClass = isCurrentUser
    ? "bg-blue-500 text-white rounded-3xl rounded-br-none ml-auto"
    : "bg-gray-300 dark:bg-gray-700 text-foreground rounded-3xl rounded-bl-none";

  return (
    <div className="flex gap-2 mb-3">
      {/* Avatar (ซ้าย) - แสดงเฉพาะข้อความจากคนอื่น */}
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {senderAvatar}
        </div>
      )}
      
      {/* ข้อความ */}
      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} flex-1`}>
        {/* ชื่อผู้ส่ง (ซ้ายบน) */}
        {!isCurrentUser && (
          <div className="text-xs font-medium text-muted-foreground mb-1 px-2">
            {displayName}
          </div>
        )}
        
        {/* Bubble */}
        <div className={`p-3 max-w-[70%] ${bubbleClass}`}>
          {msg.type === "text" && <div className="break-words">{msg.text}</div>}
          {msg.type === "image" && msg.url && (
            <img src={msg.url} alt="chat-img" className="rounded-lg max-w-[200px]" />
          )}
          
          {/* เวลา */}
          <div className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-gray-600 dark:text-gray-300"}`}>
            {msg.timestamp && (
              typeof msg.timestamp.toDate === 'function'
                ? msg.timestamp.toDate().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                : new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
