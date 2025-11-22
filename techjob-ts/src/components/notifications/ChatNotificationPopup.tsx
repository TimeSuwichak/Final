"use client";

import React, { useEffect, useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";

export default function ChatNotificationPopup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getNotificationsForUser, markAsRead, notifications } = useNotifications();

  // Early return for null user (before any hooks)
  if (!user) return null;

  const role = (user?.role || "user").toLowerCase() as
    | "admin"
    | "leader"
    | "user"
    | "executive";
  const recipientId = user?.id ? String(user.id) : (user?.uid ? String(user.uid) : undefined);

  const [seen, setSeen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const notifs = getNotificationsForUser(role, recipientId).filter(
      (n) => !n.read && n.metadata?.type === "new_chat_message"
    );
    // removed debug log
    if (notifs.length === 0) return;
    const latest = notifs[0];
    if (!latest || seen[latest.id]) return;

    setSeen((s) => ({ ...s, [latest.id]: true }));

    // Build click handler for the toast
    const handleClick = () => {
      markAsRead(latest.id);
      const senderId = latest.metadata?.senderId;
      if (user && role === "admin") {
        if (senderId) {
          navigate(`/admin/chat/${senderId}`);
        } else {
          navigate(`/admin/chat`);
        }
      } else {
        if (senderId) {
          navigate(`/chat?target=${encodeURIComponent(senderId)}`);
        } else {
          navigate(`/chat`);
        }
      }
    };

    try {
      addToast({
        title: latest.title,
        description: latest.message,
        timeout: 6000,
        onClick: handleClick,
        severity: "primary",
        shouldShowTimeoutProgress: true,
        endContent: (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="px-3 py-1 rounded bg-transparent text-sm font-medium text-primary hover:underline"
          >
            เปิด
          </button>
        ),
      });
    } catch (e) {
      // don't crash if toast fails
    }

    // no cleanup needed for addToast
  }, [notifications, role, recipientId, seen, getNotificationsForUser, markAsRead, navigate, user]);

  return <></>;
}
