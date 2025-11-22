// src/contexts/NotificationContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
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

/**
 * ==================== คำอธิบาย: ประเภทของการแจ้งเตือน ====================
 *
 * ปัจจุบัน ระบบแจ้งเตือนประกอบด้วยการแจ้งเตือนประเภทต่อไปนี้:
 *
 * 1. "หัวหน้างานถูกเปลี่ยน" (leader_change)
 *    - ส่งให้: ช่าง (user)
 *    - เหตุการณ์: เมื่อ Admin เปลี่ยนหัวหน้างาน
 *    - ที่แก้ไข: src/contexts/JobContext.tsx line ~160-177 ตรง updateJob() function
 *
 * 2. "มีการเปลี่ยนหัวหน้างาน" (leader_reassignment)
 *    - ส่งให้: หัวหน้างานเดิม (leader ที่ถูกเปลี่ยน)
 *    - เหตุการณ์: เมื่อ Admin เปลี่ยนหัวหน้างาน
 *    - ที่แก้ไข: src/contexts/JobContext.tsx line ~179-194
 *
 * 3. "คุณได้รับมอบหมายเป็นหัวหน้างานใหม่" (leader_assignment)
 *    - ส่งให้: หัวหน้างานใหม่ (leader ที่ได้รับมอบหมาย)
 *    - เหตุการณ์: เมื่อ Admin เปลี่ยนหัวหน้างาน
 *    - ที่แก้ไข: src/contexts/JobContext.tsx line ~196-209
 *
 * 4. "ได้รับมอบหมายงานใหม่" (team_assignment_added)
 *    - ส่งให้: ช่าง (user) ที่ถูกเพิ่มเข้าทีม
 *    - เหตุการณ์: เมื่อ Leader เพิ่มช่างเข้าทีมงาน
 *    - ที่แก้ไข: src/components/leader/LeaderJobDetailDialog.tsx line ~126-138
 *
 * 5. "มีการถอดคุณออกจากงาน" (team_assignment_removed)
 *    - ส่งให้: ช่าง (user) ที่ถูกถอดออกจากทีม
 *    - เหตุการณ์: เมื่อ Leader ถอดช่างออกจากทีมงาน
 *    - ที่แก้ไข: src/components/leader/LeaderJobDetailDialog.tsx line ~140-152
 *
 * ==================== วิธีเพิ่มเงื่อนไขใหม่ ====================
 *
 * ถ้าคุณต้องการเพิ่มการแจ้งเตือนแบบใหม่:
 *
 * ขั้นตอนที่ 1: หาตำแหน่งที่ต้องการส่งการแจ้งเตือน
 *   - เช่น: ในฟังก์ชัน updateJob() หรือ handleConfirmTeamChange() เป็นต้น
 *
 * ขั้นตอนที่ 2: เรียก addNotification() ด้วย object ที่มี properties:
 *   - title: ชื่อเรื่องสั้น ๆ
 *   - message: ข้อความรายละเอียด
 *   - recipientRole: บทบาทผู้รับ ('admin', 'leader', 'user', 'executive')
 *   - recipientId: (ถ้ามี) id ของคนรับเฉพาะตัว
 *   - relatedJobId: (ถ้ามี) id ของงานที่เกี่ยวข้อง
 *   - metadata: (optional) ข้อมูลเพิ่มเติม เช่น { type: 'your_event_type' }
 *
 * ตัวอย่าง:
 *   addNotification({
 *     title: "สถานะงานเปลี่ยน",
 *     message: `งาน ${job.title} เปลี่ยนเป็น "เสร็จสิ้น"`,
 *     recipientRole: "leader",
 *     recipientId: String(job.leadId),
 *     relatedJobId: job.id,
 *     metadata: { type: "job_status_changed", newStatus: "done" }
 *   });
 *
 * ===================================================================
 */

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
      // Dispatch custom event so same-tab listeners know about the change
      window.dispatchEvent(new CustomEvent("notificationsChanged", { detail: notifications }));
    } catch (error) {
      console.error("Failed to persist notifications", error);
    }
  }, [notifications]);

  // Listen for storage changes (when notifications update from other tabs or localStorage changes)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue) as NotificationItem[];
          setNotifications(updated.map(reviveNotification));
        } catch (error) {
          console.error("Failed to parse storage change", error);
        }
      }
    };

    // Listen for custom event (same tab)
    const handleCustomEvent = (_e: any) => {
      // notifications changed in same tab - no debug log
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("notificationsChanged", handleCustomEvent);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("notificationsChanged", handleCustomEvent);
    };
  }, []);

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
  // ================== ฟังก์ชัน: ดึงการแจ้งเตือนของ user คนนี้ ==================
  // ตัวอย่าง: getNotificationsForUser("leader", "101")
  //   → จะหา notification ที่มี recipientRole="leader" AND recipientId="101"
  const getNotificationsForUser: NotificationContextType["getNotificationsForUser"] =
    (role, recipientId) => {
      // ใช้ filter() เพื่อตรวจสอบแต่ละ notification ว่าตรงกันไหม
      return notifications.filter((notification) => {
        // ✓ ขั้นตอที่ 1: ตรวจ role (บทบาท)
        //   notification.recipientRole ต้องเป็น "leader" หรือ "user" หรืออื่น ๆ
        //   ถ้าไม่ตรง → return false (ไม่ให้ notification นี้อยู่ในผลลัพธ์)
        if (notification.recipientRole !== role) return false;
        
        // ✓ ขั้นตอที่ 2: ตรวจ recipientId
        //   ถ้า notification ไม่ระบุ recipientId (null/undefined)
        //   → แสดงว่า notification นั้นส่งให้ทุกคน (ทุก role นั้น)
        //   → ให้ pass (return true)
        if (!notification.recipientId) return true;
        
        // ✓ ขั้นตอที่ 3: ถ้า recipientId มีค่า แต่ user.id ไม่มี
        //   → return false (ไม่ให้แสดง)
        if (!recipientId) return false;
        
        // ✓ ขั้นตอที่ 4: ตรวจสอบ recipientId ตรงกันหรือไม่
        //   แปลงทั้งสองค่าเป็น String เพื่อเปรียบเทียบ
        //   เพราะว่า recipientId อาจเป็น Number (101) หรือ String ("101")
        //   แปลงทั้งคู่เป็น String (เช่น "101") แล้วเปรียบเทียบ
        return String(notification.recipientId) === String(recipientId);
      });
    };
  // ======================================================================

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

