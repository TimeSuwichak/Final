// src/contexts/NotificationContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { NotificationItem } from "@/types/index";

const STORAGE_KEY = "techJobNotifications_v1";

type RoleType = NotificationItem["recipientRole"];

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (
    notification: Omit<NotificationItem, "id" | "createdAt" | "read">
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsReadForUser: (role: RoleType, recipientId?: string) => void;
  getNotificationsForUser: (
    role: RoleType,
    recipientId?: string
  ) => NotificationItem[];
  getUnreadCount: (role: RoleType, recipientId?: string) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

function reviveNotification(notification: NotificationItem): NotificationItem {
  return {
    ...notification,
    createdAt: new Date(notification.createdAt),
  };
}

function loadNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NotificationItem[];
    return parsed.map(reviveNotification);
  } catch (error) {
    console.error("Failed to load notifications from storage", error);
    return [];
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    typeof window === "undefined" ? [] : loadNotifications
  );

  const generateId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `notif-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to persist notifications", error);
    }
  }, [notifications]);

  const addNotification: NotificationContextType["addNotification"] = (
    notificationInput
  ) => {
    setNotifications((prev) => [
      {
        id: generateId(),
        createdAt: new Date(),
        read: false,
        ...notificationInput,
      },
      ...prev,
    ]);
  };

  const markAsRead: NotificationContextType["markAsRead"] = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsReadForUser: NotificationContextType["markAllAsReadForUser"] = (
    role,
    recipientId
  ) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        const matchRole = notification.recipientRole === role;
        const matchRecipient =
          !notification.recipientId ||
          !recipientId ||
          String(notification.recipientId) === String(recipientId);
        if (matchRole && matchRecipient) {
          return { ...notification, read: true };
        }
        return notification;
      })
    );
  };

  const getNotificationsForUser: NotificationContextType["getNotificationsForUser"] =
    (role, recipientId) => {
      return notifications.filter((notification) => {
        if (notification.recipientRole !== role) return false;
        if (!notification.recipientId) return true;
        if (!recipientId) return false;
        return String(notification.recipientId) === String(recipientId);
      });
    };

  const getUnreadCount: NotificationContextType["getUnreadCount"] = (
    role,
    recipientId
  ) => {
    return getNotificationsForUser(role, recipientId).filter(
      (notification) => !notification.read
    ).length;
  };

  const value = useMemo<NotificationContextType>(
    () => ({
      notifications,
      addNotification,
      markAsRead,
      markAllAsReadForUser,
      getNotificationsForUser,
      getUnreadCount,
    }),
    [notifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return ctx;
};

