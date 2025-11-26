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
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  query as firestoreQuery,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

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
    // Subscribe to Firestore 'notifications' collection (realtime)
    try {
      const q = firestoreQuery(
        collection(db, "notifications"),
        orderBy("createdAt", "desc")
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const toDate = (v: any) => (v && typeof v.toDate === "function" ? v.toDate() : v);
          const items: NotificationItem[] = snap.docs.map((d) => {
            const data: any = d.data();
            return {
              id: d.id,
              title: data.title,
              message: data.message,
              recipientRole: data.recipientRole,
              recipientId: data.recipientId,
              relatedJobId: data.relatedJobId,
              metadata: data.metadata,
              read: !!data.read,
              createdAt: toDate(data.createdAt),
            } as NotificationItem;
          });
          setNotifications(items);
        },
        (err) => {
          console.error("notifications onSnapshot error", err);
        }
      );

      return () => unsub();
    } catch (e) {
      // Fallback: if Firestore not available, keep storage-based sync
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

      const handleCustomEvent = (_e: any) => { };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("notificationsChanged", handleCustomEvent);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("notificationsChanged", handleCustomEvent);
      };
    }
  }, []);

  const addNotification: NotificationContextType["addNotification"] = (
    notificationInput
  ) => {
    // Write to Firestore; fallback to local update on error
    (async () => {
      try {
        await addDoc(collection(db, "notifications"), {
          ...notificationInput,
          read: false,
          createdAt: serverTimestamp(),
        } as any);
      } catch (e) {
        console.error("Failed to add notification to Firestore", e);
        setNotifications((prev) => [
          {
            id: generateId(),
            createdAt: new Date(),
            read: false,
            ...notificationInput,
          },
          ...prev,
        ]);
      }
    })();
  };

  const markAsRead: NotificationContextType["markAsRead"] = (notificationId) => {
    (async () => {
      try {
        await updateDoc(doc(db, "notifications", notificationId), { read: true } as any);
      } catch (e) {
        console.error("Failed to mark notification as read in Firestore", e);
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    })();
  };

  const markAllAsReadForUser: NotificationContextType["markAllAsReadForUser"] = (
    role,
    recipientId
  ) => {
    (async () => {
      try {
        const q = recipientId
          ? firestoreQuery(
            collection(db, "notifications"),
            where("recipientRole", "==", role),
            where("recipientId", "==", String(recipientId)),
            where("read", "==", false)
          )
          : firestoreQuery(
            collection(db, "notifications"),
            where("recipientRole", "==", role),
            where("read", "==", false)
          );

        const snap = await getDocs(q as any);
        const updates = snap.docs.map((d) => updateDoc(doc(db, "notifications", d.id), { read: true } as any));
        await Promise.all(updates);
      } catch (e) {
        console.error("Failed to mark all as read in Firestore", e);
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
      }
    })();
  };
  // ================== ฟังก์ชัน: ดึงการแจ้งเตือนของ user คนนี้ ==================
  // ตัวอย่าง: getNotificationsForUser("leader", "101")
  //   → จะหา notification ที่มี recipientRole="leader" AND recipientId="101"
  // 
  // ⚠️ รองรับทั้ง originalId (ตัวเลข เช่น "101") และ id ใหม่ (เช่น "proj-101-21")
  const getNotificationsForUser: NotificationContextType["getNotificationsForUser"] =
    (role, recipientId) => {
      // ใช้ filter() เพื่อตรวจสอบแต่ละ notification ว่าตรงกันไหม
      return notifications.filter((notification) => {
        // ✓ ขั้นตอที่ 1: ตรวจ role (บทบาท)
        if (notification.recipientRole !== role) return false;

        // ✓ ขั้นตอที่ 2: ตรวจ recipientId
        // ถ้า notification ไม่ระบุ recipientId → แสดงให้ทุกคน
        if (!notification.recipientId) return true;

        // ✓ ขั้นตอที่ 3: ถ้า recipientId มีค่า แต่ user.id ไม่มี → ไม่แสดง
        if (!recipientId) return false;

        // ✓ ขั้นตอที่ 4: ตรวจสอบ recipientId ตรงกันหรือไม่
        // รองรับทั้ง 2 รูปแบบ:
        // 1. recipientId ตรงกับ recipientId ที่ส่งมา (เช่น "101" === "101")
        // 2. recipientId ตรงกับส่วนตัวเลขใน id ใหม่ (เช่น "101" อยู่ใน "proj-101-21")
        const notifRecipient = String(notification.recipientId);
        const userRecipient = String(recipientId);

        // ตรวจสอบแบบตรงทั้งหมด
        if (notifRecipient === userRecipient) return true;

        // ตรวจสอบแบบ partial match (สำหรับ ID แบบใหม่)
        // เช่น notification.recipientId = "101" และ recipientId = "proj-101-21"
        // หรือ notification.recipientId = "proj-101-21" และ recipientId = "101"
        if (userRecipient.includes(notifRecipient) || notifRecipient.includes(userRecipient)) {
          return true;
        }

        return false;
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

