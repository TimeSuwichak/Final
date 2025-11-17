// src/types/index.ts
// (คุณสามารถเพิ่มรายละเอียดอื่นๆ ได้ตามต้องการ)


// พิมพ์เขียวสำหรับ "ประวัติการแก้ไข" (โดย Admin เท่านั้น)
export interface EditHistory {
  adminName: string;
  editedAt: Date;
  reason: string;
  changes: string; // (อาจจะเก็บว่าแก้ field ไหน)
}

// พิมพ์เขียวสำหรับ "ความคืบหน้างาน" (โดย Leader/Tech)
export interface ActivityLog {
  actorName: string; // ชื่อคนทำ (Leader หรือ Tech)
  actorRole: 'leader' | 'tech'; // บทบาทของคนทำ
  activityType: 'acknowledge' | 'task_created' | 'task_updated' | 'tech_assigned' | 'status_changed' | 'other';
  message: string; // ข้อความอธิบายการกระทำ
  timestamp: Date;
  metadata?: Record<string, any>; // ข้อมูลเพิ่มเติม (เช่น taskId, techIds, etc.)
}

// พิมพ์เขียวสำหรับ "การแจ้งเตือน"
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  recipientRole: 'admin' | 'leader' | 'user' | 'executive';
  recipientId?: string; // สำหรับระบุตัวบุคคล (เช่น ช่างแต่ละคน)
  relatedJobId?: string;
  createdAt: Date;
  read: boolean;
  metadata?: Record<string, any>;
}

// พิมพ์เขียวสำหรับ "งานย่อย" (Task)
export interface Task {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'in-progress' | 'completed';
  updates: {
    message: string;
    imageUrl?: string;
    updatedBy: string; // User's name
    updatedAt: Date;
  }[];
}

// พิมพ์เขียวสำหรับ "ใบงานหลัก" (Job)
export interface Job {
  id: string; // เช่น JOB-20250703-A4T9
  title: string;
  description: string;
  jobType: string;
  status: 'new' | 'in-progress' | 'done';
  
  // ข้อมูลลูกค้า
  customerName: string;
  customerPhone: string;
  customerContactOther?: string;
  location: string; // (ที่อยู่สำหรับ Map)
  latitude?: number;
  longitude?: number;
 
  // ไฟล์แนบ
  imageUrl?: string;
  otherFileUrl?: string;

  // วันที่
  startDate: Date;
  endDate: Date;
  
  // การมอบหมาย
  leadId: string | null; // ID ของหัวหน้าที่ได้รับงาน
  assignedTechs: string[]; // Array ของ ID ช่างที่ถูกเลือก
  tasks: Task[];
  
  // ข้อมูล Meta
  adminCreator: string; // ชื่อ Admin ที่สร้าง
  createdAt: Date;
  editHistory: EditHistory[]; // ประวัติการแก้ไขโดย Admin เท่านั้น
  activityLog: ActivityLog[]; // ความคืบหน้างานโดย Leader/Tech
  completionSummary?: string;
  completionIssues?: string;
  completionIssueImage?: string;
  completedAt?: Date;
  leaderCloser?: string;
}

export type MaterialUsageType = 'consumable' | 'returnable';

export interface Material {
  id: string;
  name: string;
  category: string;
  usageType: MaterialUsageType;
  unit: string;
  stock: number;
}