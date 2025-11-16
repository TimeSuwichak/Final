// src/components/notifications/NotificationBell.tsx
"use client";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

export function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getNotificationsForUser,
    getUnreadCount,
    markAsRead,
  } = useNotifications();

  if (!user) return null;

  const role = (user.role || "user").toLowerCase() as
    | "admin"
    | "leader"
    | "user"
    | "executive";
  const recipientId = user.id ? String(user.id) : undefined;

  const notifications = useMemo(
    () => getNotificationsForUser(role, recipientId),
    [getNotificationsForUser, role, recipientId]
  );

  const unreadCount = getUnreadCount(role, recipientId);
  // แสดงเฉพาะการแจ้งเตือนที่ยังไม่ได้อ่าน สูงสุด 4 รายการ
  const recentNotifications = notifications
    .filter(notification => !notification.read)
    .slice(0, 4);

  const handleViewAll = () => {
    navigate("/notification");
  };

  const handleOpenNotification = (notificationId: string) => {
    markAsRead(notificationId);
    navigate(`/notification?selected=${notificationId}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-11 w-11 rounded-full">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold">การแจ้งเตือนล่าสุด</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} รายการใหม่
            </Badge>
          )}
        </div>
        <Separator />
        {recentNotifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            ไม่มีการแจ้งเตือนใหม่
          </div>
        ) : (
          <ScrollArea className="">
            <ul className="divide-y divide-muted/40">
              {recentNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className="flex flex-col gap-2 px-4 py-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true,
                        locale: th,
                      })}
                    </span>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() => handleOpenNotification(notification.id)}
                    >
                      ดูรายละเอียด
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
        <Separator />
        <div className="px-4 py-2">
          <Button className="w-full" variant="secondary" onClick={handleViewAll}>
            ดูการแจ้งเตือนทั้งหมด
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

