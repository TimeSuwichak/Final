// src/pages/admin/chat/[chatId].tsx
"use client"
import React from "react";
import { useParams } from "react-router-dom";
import AdminChatRoom from "@/components/chat/AdminChatRoom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminChatRoomPage() {
  const params = useParams();
  const chatId = params?.chatId as string | undefined;

  if (!chatId) {
    return <div className="p-6 text-muted-foreground">ไม่พบห้องแชท</div>;
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>แชท — {chatId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[70vh]">
            <AdminChatRoom userId={chatId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
