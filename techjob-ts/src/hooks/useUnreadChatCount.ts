// src/hooks/useUnreadChatCount.ts
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export function useUnreadChatCount(userId: string, role: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // ============================
    // USER MODE → unread messages sent by admin
    // ============================
    if (role === "user" || role === "leader" || role === "executive") {
      const q = query(
        collection(db, "chats", userId, "messages"),
        where("sender", "==", "admin"),
        where("read", "==", false)
      );

      const unsub = onSnapshot(q, (snap) => {
        setCount(snap.size);
      });

      return () => unsub();
    }

    // ============================
    // ADMIN MODE → count rooms with unread user messages
    // ============================
    if (role === "admin") {
      const q = query(
        collection(db, "chats"),
        where("hasUnreadForAdmin", "==", true)
      );

      const unsub = onSnapshot(q, (snap) => {
        setCount(snap.size);
      });

      return () => unsub();
    }
  }, [userId, role]);

  return count;
}
