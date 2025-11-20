// src/contexts/JobContext.tsx (ฉบับอัปเกรดให้ "จำเก่ง")
"use client";

import type { EditHistory, ActivityLog, Job } from '@/types/index';
import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react'; // 1. Import useEffect
import { useNotifications } from '@/contexts/NotificationContext';
import { leader as LEADER_DIRECTORY } from '@/data/leader';


// --- ชื่อกุญแจสำหรับเก็บข้อมูล ---
const STORAGE_KEY = 'techJobData_v2'; // (v2 สำหรับระบบใหม่)

// --- (ใหม่!) ฟังก์ชันสำหรับ "ฟื้นคืนชีพ" Date Objects ---
// (localStorage จะแปลง Date เป็น string, เราต้องแปลงกลับ)
const reviveDates = (job: any): Job => {
  return {
    ...job,
    startDate: new Date(job.startDate),
    endDate: new Date(job.endDate),
    createdAt: new Date(job.createdAt),
    completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
    editHistory: (job.editHistory || []).map((entry: any) => ({
      ...entry,
      editedAt: new Date(entry.editedAt),
    })),
    activityLog: (job.activityLog || []).map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    })),
    tasks: (job.tasks || []).map((task: any) => ({
      ...task,
      updates: (task.updates || []).map((update: any) => ({
        ...update,
        updatedAt: new Date(update.updatedAt),
      })),
    })),
  };
};

// --- (ใหม่!) ฟังก์ชันสำหรับ "โหลดข้อมูล" จาก "แผ่นหิน" ---
const loadJobsFromStorage = (): Job[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsedJobs = JSON.parse(data) as Job[];
      // เราต้อง "ฟื้นคืนชีพ" Date objects ทั้งหมด
      return parsedJobs.map(reviveDates);
    }
  } catch (e) {
    console.error("Failed to load jobs from storage", e);
  }
  return []; // คืนค่าว่างถ้าไม่มีข้อมูล
};

const findLeaderName = (leaderId?: string | number | null) => {
  if (leaderId === null || leaderId === undefined) return null;
  const leader = LEADER_DIRECTORY.find(
    (item) => String(item.id) === String(leaderId)
  );
  return leader ? `${leader.fname} ${leader.lname}` : null;
};

// --- สร้าง Context (เหมือนเดิม) ---
interface JobContextType {
  jobs: Job[];
  addJob: (newJobData: Omit<Job, 'id' | 'createdAt' | 'adminCreator'>, adminName: string) => void;
  updateJob: (jobId: string, updatedData: Partial<Job>, editReason: string, adminName: string) => void;
  deleteJob: (jobId: string, reason: string, deletedByName: string) => void;
  addActivityLog: (
    jobId: string, 
    activityType: ActivityLog['activityType'],
    message: string,
    actorName: string,
    actorRole: 'leader' | 'tech',
    metadata?: Record<string, any>
  ) => void;
  updateJobWithActivity: (
    jobId: string,
    updatedData: Partial<Job>,
    activityType: ActivityLog['activityType'],
    message: string,
    actorName: string,
    actorRole: 'leader' | 'tech',
    metadata?: Record<string, any>
  ) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

// --- สร้าง "ผู้ให้บริการ" (Provider) ---
export const JobProvider = ({ children }: { children: ReactNode }) => {
  
  // ▼▼▼ 2. (แก้ไข!) เปลี่ยน useState ให้ "โหลด" ข้อมูลตอนเริ่ม ▼▼▼
  // (นี่คือการอ่าน "แผ่นหิน" ตอนเปิดออฟฟิศ)
  const [jobs, setJobs] = useState<Job[]>(loadJobsFromStorage);
  const { addNotification } = useNotifications();

  // ▼▼▼ 3. (ใหม่!) เพิ่ม "สมอง" ให้ "บันทึก" ข้อมูลทุกครั้งที่ 'jobs' เปลี่ยน ▼▼▼
  // (นี่คือการ "สลักหิน" ทุกครั้งที่มีคนเขียนกระดาน)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.error("Failed to save jobs to storage", e);
    }
  }, [jobs]); // <-- "ยาม" ที่คอยเฝ้าดู 'jobs'

  // --- ฟังก์ชัน "เพิ่มใบงานใหม่" (เหมือนเดิม) ---
  const addJob = (newJobData: Omit<Job, 'id' | 'createdAt' | 'adminCreator'>, adminName: string) => {
    
    // (โค้ดสร้าง Job ID เหมือนเดิม)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newId = `JOB-${dateStr}-${randomStr}`;

    const newJob: Job = {
      ...newJobData,
      id: newId,
      adminCreator: adminName,
      createdAt: date,
      status: 'new',
      editHistory: [],
      activityLog: [],
      tasks: [],
      assignedTechs: newJobData.assignedTechs || [],
      completionSummary: undefined,
      completionIssues: undefined,
      completionIssueImage: undefined,
      completedAt: undefined,
      leaderCloser: undefined,
    };

    // 🔥 เพิ่มโค้ด: ถ้าระบุ leadId ให้ส่ง notification ให้ Leader
    // ======================== ขั้นตอนการส่ง Notification ========================
    // 1. สร้าง array เปล่าเก็บ notification ที่จะส่ง
    const notificationsToSend: Parameters<typeof addNotification>[0][] = [];
    
    // 2. ตรวจสอบว่า leadId มีค่าหรือไม่ (leadId คือ ID ของหัวหน้างาน)
    //    leadId อาจเป็น null, undefined, หรือมีค่าจริง (เช่น 101, 104 เป็นต้น)
    if (newJobData.leadId && newJobData.leadId !== null && newJobData.leadId !== undefined) {
      // 3. ค้นหาชื่อของหัวหน้างานจากฟังก์ชัน findLeaderName()
      //    findLeaderName() จะหา ID ใน database leader มา
      const leaderName = findLeaderName(newJobData.leadId) ?? "หัวหน้างานใหม่";
      
      // 4. เพิ่ม log เพื่อตรวจสอบว่าจะส่งให้ leader ID ไหน
      console.log(`[addJob] Adding notification for leadId: ${newJobData.leadId}, leaderName: ${leaderName}`);
      
      // 5. สร้าง object notification
      //    object นี้จะถูกเก็บไว้ใน notificationsToSend array
      //    แล้วจึงส่งไปให้ NotificationContext จัดการลงใน localStorage
      notificationsToSend.push({
        title: "คุณได้รับมอบหมายเป็นหัวหน้างานใหม่",
        message: `คุณได้รับมอบหมายให้ดูแลงาน "${newJobData.title}" จาก ${adminName}`,
        recipientRole: "leader",  // ← บอก NotificationContext ว่า "ส่งให้ Leader"
        recipientId: String(newJobData.leadId),  // ← แปลง leadId (Number) เป็น String เพื่อเก็บสม่ำเสมอ
        relatedJobId: newId,  // ← บอก Job ID เพื่อให้ Leader คลิกไปดูงาน
        metadata: {
          type: "leader_assignment_new",
          jobId: newId,
        },
      });
    }
    // =====================================================================

    setJobs(prevJobs => [newJob, ...prevJobs]); // (อัปเดตกระดาน -> useEffect จะทำงาน -> สลักหิน)
    
    // 🔥 ส่ง notification ทั้งหมดที่เตรียมไว้ให้ NotificationContext จัดการ
    // ลูป forEach จะเรียก addNotification() หลายครั้ง (ครั้งละ 1 notification)
    notificationsToSend.forEach(addNotification);
  };

  // --- ฟังก์ชัน "อัปเดตใบงาน" (สำหรับ Admin เท่านั้น - ใช้ editHistory) ---
  const updateJob = (jobId: string, updatedData: Partial<Job>, editReason: string, adminName: string) => {
    const targetJob = jobs.find(job => job.id === jobId);
    if (!targetJob) {
      console.warn(`updateJob: ไม่พบใบงานรหัส ${jobId}`);
      return;
    }

    const newHistory: EditHistory = {
      adminName,
      editedAt: new Date(),
      reason: editReason,
      changes: Object.keys(updatedData).join(', ')
    };

    const nextAssignedTechs = updatedData.assignedTechs ?? targetJob.assignedTechs;
    const updatedJob: Job = {
      ...targetJob,
      ...updatedData,
      editHistory: [...(targetJob.editHistory || []), newHistory],
    };

    const notificationsToSend: Parameters<typeof addNotification>[0][] = [];

    if (Object.prototype.hasOwnProperty.call(updatedData, 'leadId')) {
      const previousLeaderId = targetJob.leadId;
      const nextLeaderId = updatedData.leadId ?? null;

      if (previousLeaderId !== nextLeaderId) {
        const newLeaderName = findLeaderName(nextLeaderId) ?? "หัวหน้างานใหม่";
        const oldLeaderName = findLeaderName(previousLeaderId) ?? "หัวหน้างานเดิม";
        const reasonMessage = editReason || "ไม่ระบุเหตุผล";

        nextAssignedTechs.forEach((techId) => {
          notificationsToSend.push({
            title: "หัวหน้างานถูกเปลี่ยน",
            message: `งาน ${targetJob.title} เปลี่ยนหัวหน้างานเป็น ${newLeaderName} โดย ${adminName}. เหตุผล: ${reasonMessage}`,
            recipientRole: "user",
            recipientId: techId,
            relatedJobId: targetJob.id,
            metadata: {
              type: "leader_change",
              newLeaderId: nextLeaderId,
              previousLeaderId,
            },
          });
        });

        if (previousLeaderId && previousLeaderId !== nextLeaderId) {
          notificationsToSend.push({
            title: "มีการเปลี่ยนหัวหน้างาน",
            message: `งาน ${targetJob.title} ถูกเปลี่ยนให้ ${newLeaderName} ดูแลแทนคุณ เหตุผล: ${reasonMessage}`,
            recipientRole: "leader",
            recipientId: String(previousLeaderId),
            relatedJobId: targetJob.id,
            metadata: {
              type: "leader_reassignment",
              newLeaderId: nextLeaderId,
            },
          });
        }

        if (nextLeaderId !== null && nextLeaderId !== undefined) {
          notificationsToSend.push({
            title: "คุณได้รับมอบหมายเป็นหัวหน้างานใหม่",
            message: `คุณได้รับมอบหมายให้ดูแลงาน ${targetJob.title} จาก ${oldLeaderName}. เหตุผล: ${reasonMessage}`,
            recipientRole: "leader",
            recipientId: String(nextLeaderId),
            relatedJobId: targetJob.id,
            metadata: {
              type: "leader_assignment",
              previousLeaderId,
            },
          });
        }
      }
    }

    setJobs(prevJobs =>
      prevJobs.map(job => (job.id === jobId ? updatedJob : job))
    );

    notificationsToSend.forEach(addNotification);
  };

  // --- ฟังก์ชัน "เพิ่ม Activity Log" (สำหรับ Leader/Tech เท่านั้น) ---
  const addActivityLog = (
    jobId: string,
    activityType: ActivityLog['activityType'],
    message: string,
    actorName: string,
    actorRole: 'leader' | 'tech',
    metadata?: Record<string, any>
  ) => {
    setJobs(prevJobs =>
      prevJobs.map(job => {
        if (job.id === jobId) {
          const newActivity: ActivityLog = {
            actorName,
            actorRole,
            activityType,
            message,
            timestamp: new Date(),
            metadata,
          };

          return {
            ...job,
            activityLog: [...(job.activityLog || []), newActivity]
          };
        }
        return job;
      })
    );
  };

  // --- ฟังก์ชัน "ลบใบงาน" (สามารถเรียกโดย Admin/Leader) ---
  const deleteJob = (jobId: string, reason: string, deletedByName: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) {
      console.warn(`deleteJob: ไม่พบใบงานรหัส ${jobId}`);
      return;
    }

    // สร้าง notification สำหรับหัวหน้างาน (ถ้ามี) และช่างที่ถูกมอบหมาย
    const notificationsToSend: Parameters<typeof addNotification>[0][] = [];

    // แจ้งหัวหน้างาน
    if (targetJob.leadId) {
      notificationsToSend.push({
        title: "งานถูกลบหรือยกเลิก",
        message: `งาน \"${targetJob.title}\" ถูกลบโดย ${deletedByName}. เหตุผล: ${reason}`,
        recipientRole: "leader",
        recipientId: String(targetJob.leadId),
        relatedJobId: targetJob.id,
        metadata: {
          type: "job_deleted",
          reason,
        },
      });
    }

    // แจ้งช่างทุกคนที่ถูกมอบหมาย
    (targetJob.assignedTechs || []).forEach((techId) => {
      notificationsToSend.push({
        title: "งานถูกยกเลิก",
        message: `งาน \"${targetJob.title}\" ที่คุณได้รับมอบหมายถูกยกเลิกโดย ${deletedByName}. เหตุผล: ${reason}`,
        recipientRole: "user",
        recipientId: techId,
        relatedJobId: targetJob.id,
        metadata: {
          type: "job_deleted",
          reason,
        },
      });
    });

    // เอาใบงานออกจากรายการ
    setJobs((prev) => prev.filter((j) => j.id !== jobId));

    // ส่งแจ้งเตือนทั้งหมด
    notificationsToSend.forEach(addNotification);
  };

  // --- ฟังก์ชัน "อัปเดตงานพร้อม Activity Log" (สำหรับ Leader/Tech) ---
  const updateJobWithActivity = (
    jobId: string,
    updatedData: Partial<Job>,
    activityType: ActivityLog['activityType'],
    message: string,
    actorName: string,
    actorRole: 'leader' | 'tech',
    metadata?: Record<string, any>
  ) => {
    setJobs(prevJobs =>
      prevJobs.map(job => {
        if (job.id === jobId) {
          const newActivity: ActivityLog = {
            actorName,
            actorRole,
            activityType,
            message,
            timestamp: new Date(),
            metadata,
          };

          return {
            ...job,
            ...updatedData,
            activityLog: [...(job.activityLog || []), newActivity]
          };
        }
        return job;
      })
    );
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, deleteJob, addActivityLog, updateJobWithActivity }}>
      {children}
    </JobContext.Provider>
  );
};

// --- "ทางลัด" (Hook) (เหมือนเดิม) ---
export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs ต้องถูกเรียกใช้ภายใน JobProvider');
  }
  return context;
};