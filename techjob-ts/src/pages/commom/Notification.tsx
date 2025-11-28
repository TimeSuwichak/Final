/**
 * NotificationPage
 * ----------------
 * คอมโพเนนท์หน้าแจ้งเตือน (Notification) สำหรับผู้ใช้
 *
 * คำอธิบายสั้น ๆ (สำหรับมือใหม่):
 * - หน้านี้จะแสดงรายการการแจ้งเตือนทั้งหมด (ทั้งหมด / ยังไม่ได้อ่าน)
 * - ฝั่งซ้ายเป็นรายการแจ้งเตือน (list) เมื่อกดแล้วจะแสดงรายละเอียดด้านขวา
 * - มีปุ่ม "ทำเครื่องหมายว่าอ่านแล้วทั้งหมด" เพื่อเปลี่ยนสถานะการแจ้งเตือนเป็นอ่าน
 * - ใช้ context (`useAuth`, `useNotifications`) เพื่อดึงข้อมูลผู้ใช้และการแจ้งเตือน
 *
 * Inputs / dependencies:
 * - ข้อมูลผู้ใช้มาจาก `useAuth()`
 * - ฟังก์ชันจัดการการแจ้งเตือนมาจาก `useNotifications()`
 * - ใช้ `react-router` search params เพื่อเก็บการเลือก (selected)
 *
 * Outputs / behavior:
 * - แสดง UI รายการและรายละเอียดการแจ้งเตือน
 * - เมื่อเลือกการแจ้งเตือน จะทำเครื่องหมายเป็นอ่าน (ถ้ายังไม่อ่าน) และเก็บ id ลงใน query param `selected`
 *
 * ตัวอย่าง edge-cases ที่โค้ดจัดการไว้:
 * - ถ้ายังไม่ได้ล็อกอิน จะบอกให้ล็อกอินก่อนดูการแจ้งเตือน
 * - ถ้าไม่มีการแจ้งเตือนในหมวด จะมีข้อความว่า "ไม่มีการแจ้งเตือน"
 */

import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Clock, MailOpen, MailWarning } from "lucide-react";

// Contexts: ดึงข้อมูลผู้ใช้และการแจ้งเตือนจาก context ของแอป
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
// UI components: Badge, Button, Card, ScrollArea, Tabs, Separator
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import type { NotificationItem } from "@/types/index";

// ฟังก์ชันช่วยจัดรูปแบบวันที่ตาม locale ไทย
const formatDateTime = (date: Date) =>
  format(date, "dd MMM yyyy - HH:mm น.", { locale: th });

// แยกรายการการแจ้งเตือนออกเป็น 2 กลุ่ม: ยังไม่ได้อ่าน (unread) และ อ่านแล้ว (read)
// คืนค่าเป็น object { unread, read }
function splitNotifications(notifications: NotificationItem[]): {
  unread: NotificationItem[];
  read: NotificationItem[];
} {
  return notifications.reduce(
    (result, notification) => {
      if (notification.read) {
        result.read.push(notification);
      } else {
        result.unread.push(notification);
      }
      return result;
    },
    { unread: [] as NotificationItem[], read: [] as NotificationItem[] }
  );
}

function NotificationPage() {
  // ดึงข้อมูลผู้ใช้และฟังก์ชันจาก context
  const { user } = useAuth();
  const navigate = useNavigate();
  // useSearchParams ใช้เก็บค่า query string ของURL (เราใช้เก็บ selected notification id)
  const [searchParams, setSearchParams] = useSearchParams();
  const { getNotificationsForUser, markAsRead, markAllAsReadForUser } =
    useNotifications();

  // ถ้า user ยังไม่ได้ล็อกอิน ให้แสดงข้อความและหยุดการเรนเดอร์หน้าจอแจ้งเตือน
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border bg-white dark:bg-card p-6 text-center text-muted-foreground">
        กรุณาเข้าสู่ระบบเพื่อดูการแจ้งเตือน
      </div>
    );
  }

  // กำหนด role ของผู้ใช้งาน (ใช้เพื่อกรองการแจ้งเตือนตามบทบาท)
  const role = (user.role || "user").toLowerCase() as
    | "admin"
    | "leader"
    | "user"
    | "executive";

  // recipientId คือ id ของผู้รับ (จะใช้ในการดึงการแจ้งเตือนเฉพาะคน)
  const recipientId = user.id ? String(user.id) : undefined;

  // ดึงรายการการแจ้งเตือนโดยใช้ useMemo เพื่อหลีกเลี่ยงการคำนวณซ้ำเมื่อ dependencies ไม่เปลี่ยน
  const notifications = useMemo(() => {
    const rawNotifications = getNotificationsForUser(role, recipientId);
    return rawNotifications
      .map((notification) => ({
        ...notification,
        createdAt: notification.createdAt
          ? new Date(notification.createdAt)
          : new Date(0),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [getNotificationsForUser, role, recipientId]);

  // แยกรายการที่ยังไม่ได้อ่านออกมา (นำมาแสดงตัวเลขบน badge)
  const { unread } = useMemo(
    () => splitNotifications(notifications),
    [notifications]
  );

  // อ่าน query param ชื่อ 'selected' เพื่อรู้ว่า user เลือกรายการไหนอยู่
  const selectedId = searchParams.get("selected");

  // เมื่อเปิดการแจ้งเตือน: ถ้ายังไม่อ่าน จะเรียก markAsRead และเซ็ต selected id ลงใน URL
  const handleOpenNotification = (notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setSearchParams((params) => {
      params.set("selected", notification.id);
      return params;
    });
  };

  // ยกเลิกการเลือก (ลบ selected query param)
  const handleClearSelection = () => {
    setSearchParams((params) => {
      params.delete("selected");
      return params;
    });
  };

  // ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว
  const handleMarkAllAsRead = () => {
    markAllAsReadForUser(role, recipientId);
  };

  // หา object ของการแจ้งเตือนที่ถูกเลือก (ถ้ามี)
  const selectedNotification = notifications.find(
    (notification) => notification.id === selectedId
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 rounded-xl border bg-white dark:bg-background px-6 py-5 shadow-sm md:flex-row md:items-center">
        <div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <MailWarning className="h-4 w-4" />
            <span className="font-medium">
              ยังไม่ได้อ่าน {unread.length} รายการ
            </span>
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unread.length === 0}
          >
            ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        {/* Notification List Card */}
        <Card className="bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold">
              รายการแจ้งเตือนทั้งหมด
            </CardTitle>
            <Badge
              variant="secondary"
              className="gap-1 px-2.5 py-1 text-xs font-medium"
            >
              รวม {notifications.length} รายการ
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs
              defaultValue={unread.length > 0 ? "unread" : "all"}
              className="w-full"
            >
              <TabsList className="mx-4 mb-2 grid w-auto grid-cols-2 bg-muted/50">
                <TabsTrigger
                  value="unread"
                  className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-background"
                >
                  <MailWarning className="h-4 w-4" />
                  <span className="font-medium">ยังไม่ได้อ่าน</span>
                  {unread.length > 0 && (
                    <Badge className="ml-1 rounded-full bg-red-500 px-1.5 py-0 text-[10px] font-semibold">
                      {unread.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-background"
                >
                  <MailOpen className="h-4 w-4" />
                  <span className="font-medium">ทั้งหมด</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="unread" className="mt-0">
                <NotificationList
                  notifications={unread}
                  onSelect={handleOpenNotification}
                  selectedId={selectedId}
                />
              </TabsContent>
              <TabsContent value="all" className="mt-0">
                <NotificationList
                  notifications={notifications}
                  onSelect={handleOpenNotification}
                  selectedId={selectedId}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Notification Detail Card */}
        <Card className="bg-white dark:bg-card">
          <CardHeader className="space-y-1.5 pb-4">
            <CardTitle className="text-lg font-bold">
              รายละเอียดการแจ้งเตือน
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              เลือกการแจ้งเตือนจากรายการเพื่อดูรายละเอียด
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedNotification ? (
              <>
                <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-foreground leading-tight">
                      {selectedNotification.title}
                    </h3>
                    <Badge
                      variant={
                        selectedNotification.read ? "outline" : "default"
                      }
                      className="shrink-0"
                    >
                      {selectedNotification.read ? "อ่านแล้ว" : "ใหม่"}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {selectedNotification.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {formatDateTime(selectedNotification.createdAt)}
                    </span>
                  </div>
                </div>
                {selectedNotification.relatedJobId && (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      const jobLink =
                        role === "admin"
                          ? `/admin/workoders?jobId=${selectedNotification.relatedJobId}`
                          : role === "leader"
                          ? `/leader/leaderworks?jobId=${selectedNotification.relatedJobId}`
                          : `/user/userworks?jobId=${selectedNotification.relatedJobId}`;
                      navigate(jobLink);
                    }}
                  >
                    ไปที่ใบงานที่เกี่ยวข้อง
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleClearSelection}
                >
                  ปิดรายละเอียด
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/10 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  ยังไม่ได้เลือกการแจ้งเตือน
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface NotificationListProps {
  notifications: NotificationItem[];
  selectedId: string | null;
  onSelect: (notification: NotificationItem) => void;
}

function NotificationList({
  notifications,
  selectedId,
  onSelect,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        ไม่มีการแจ้งเตือนในหมวดนี้
      </div>
    );
  }
  return (
    <ScrollArea className="max-h-[480px]">
      <ul className="flex flex-col">
        {notifications.map((notification) => {
          const isSelected = selectedId === notification.id;
          return (
            <li key={notification.id}>
              <button
                onClick={() => onSelect(notification)}
                className={`w-full text-left transition ${
                  isSelected
                    ? "bg-primary/10"
                    : "hover:bg-muted/40 focus-visible:bg-muted/40"
                }`}
              >
                <div className="flex flex-col gap-2 px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-foreground">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="flex h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDateTime(notification.createdAt)}
                  </div>
                </div>
                <Separator className="opacity-60" />
              </button>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}

export default NotificationPage;
