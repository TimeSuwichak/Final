// src/types/index.ts
// (คุณสามารถเพิ่มรายละเอียดอื่นๆ ได้ตามต้องการ)


// พิมพ์เขียวสำหรับ "ประวัติการแก้ไข"
export interface EditHistory {
  adminName: string;
  editedAt: Date;
  reason: string;
  changes: string; // (อาจจะเก็บว่าแก้ field ไหน)
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
  editHistory: EditHistory[];
}