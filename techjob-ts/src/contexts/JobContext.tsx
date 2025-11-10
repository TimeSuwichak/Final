// src/contexts/JobContext.tsx (ฉบับอัปเกรดให้ "จำเก่ง")
"use client";

import type { EditHistory, ActivityLog, Job } from '@/types/index';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'; // 1. Import useEffect


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

// --- สร้าง Context (เหมือนเดิม) ---
interface JobContextType {
  jobs: Job[];
  addJob: (newJobData: Omit<Job, 'id' | 'createdAt' | 'adminCreator' | 'editHistory' | 'activityLog'>, adminName: string) => void;
  updateJob: (jobId: string, updatedData: Partial<Job>, editReason: string, adminName: string) => void;
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
      assignedTechs: [],
    };

    setJobs(prevJobs => [newJob, ...prevJobs]); // (อัปเดตกระดาน -> useEffect จะทำงาน -> สลักหิน)
  };

  // --- ฟังก์ชัน "อัปเดตใบงาน" (สำหรับ Admin เท่านั้น - ใช้ editHistory) ---
  const updateJob = (jobId: string, updatedData: Partial<Job>, editReason: string, adminName: string) => {
    setJobs(prevJobs =>
      prevJobs.map(job => {
        if (job.id === jobId) {
          const newHistory: EditHistory = {
            adminName: adminName,
            editedAt: new Date(),
            reason: editReason,
            changes: Object.keys(updatedData).join(', ')
          };

          return {
            ...job,
            ...updatedData,
            editHistory: [...(job.editHistory || []), newHistory]
          };
        }
        return job;
      })
    ); // (อัปเดตกระดาน -> useEffect จะทำงาน -> สลักหิน)
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
    <JobContext.Provider value={{ jobs, addJob, updateJob, addActivityLog, updateJobWithActivity }}>
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