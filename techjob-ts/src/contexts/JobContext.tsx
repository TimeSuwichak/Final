// src/contexts/JobContext.tsx
// Context สำหรับจัดการข้อมูลงาน (Job) ทั้งหมดในระบบ
// เปรียบเสมือน "สมองกลาง" ที่คอยจดจำและอัปเดตสถานะงานต่างๆ

"use client";

import type { EditHistory, ActivityLog, Job, Task } from "@/types/index";
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { leader as LEADER_DIRECTORY } from "@/Data/leader";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

// --- Key สำหรับบันทึกข้อมูลลง LocalStorage (Cache) ---
const STORAGE_KEY = "techJobData_v2";

// --- ฟังก์ชันสร้าง Task มาตรฐาน 4 ขั้นตอน ---
// ทุกใบงานใหม่จะมี 4 ขั้นตอนนี้เสมอ เพื่อให้เป็นมาตรฐานเดียวกัน
// 1) ตรวจสอบและวางแผน
// 2) จัดเตรียมวัสดุอุปกรณ์
// 3) กำลังดำเนินการ
// 4) ตรวจสอบความเรียบร้อย
const createDefaultTasks = (): Task[] => {
  return [
    {
      id: "STEP-1",
      title: "ตรวจสอบและวางแผน",
      description: "",
      status: "in-progress", // เริ่มต้นขั้นตอนแรกทันที
      imageUrl: undefined,
      needsAcknowledgment: false,
      updates: [],
      materials: [],
    },
    {
      id: "STEP-2",
      title: "จัดเตรียมวัสดุอุปกรณ์",
      description: "",
      status: "pending",
      imageUrl: undefined,
      needsAcknowledgment: false,
      updates: [],
      materials: [],
    },
    {
      id: "STEP-3",
      title: "กำลังดำเนินการ",
      description: "",
      status: "pending",
      imageUrl: undefined,
      needsAcknowledgment: false,
      updates: [],
      materials: [],
    },
    {
      id: "STEP-4",
      title: "ตรวจสอบความเรียบร้อย",
      description: "",
      status: "pending",
      imageUrl: undefined,
      needsAcknowledgment: false,
      updates: [],
      materials: [],
    },
  ];
};

// --- ฟังก์ชันแปลงข้อมูลวันที่ (Date) ---
// เมื่อโหลดข้อมูลจาก LocalStorage วันที่จะกลายเป็นข้อความ (String)
// ฟังก์ชันนี้จะแปลงกลับเป็น Date Object เพื่อให้สามารถคำนวณหรือแสดงผลได้ถูกต้อง
const reviveDates = (job: any): Job => {
  // แปลง field ที่เป็นวันที่ให้กลับมาเป็น Date object
  const revivedTasks: Task[] = (job.tasks || []).map((task: any) => ({
    ...task,
    updates: (task.updates || []).map((update: any) => ({
      ...update,
      updatedAt: new Date(update.updatedAt),
    })),
    materials: (task.materials || []).map((material: any) => ({
      ...material,
      withdrawnAt: new Date(material.withdrawnAt),
    })),
  }));

  let revivedJob: Job = {
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
  };

  // ถ้าใบงานเดิมยังไม่มี task หรือ task ไม่ได้อยู่ในรูปแบบ pipeline ใหม่
  // ให้ "รีเซ็ต" เป็น task มาตรฐาน 4 ขั้นตอนเสมอ
  const isValidNewPipeline =
    Array.isArray(revivedTasks) &&
    revivedTasks.length === 4 &&
    revivedTasks[0]?.title === "ตรวจสอบและวางแผน" &&
    revivedTasks[1]?.title === "จัดเตรียมวัสดุอุปกรณ์" &&
    revivedTasks[2]?.title === "กำลังดำเนินการ" &&
    (revivedTasks[3]?.title === "เสร็จสิ้น" ||
      revivedTasks[3]?.title === "ตรวจสอบความเรียบร้อย");

  if (isValidNewPipeline) {
    // ใช้ task เดิม (แต่แปลงวันที่แล้ว) ถ้าเป็นรูปแบบใหม่อยู่แล้ว
    revivedJob = {
      ...revivedJob,
      tasks: revivedTasks.map((t) =>
        t.title === "เสร็จสิ้น" ? { ...t, title: "ตรวจสอบความเรียบร้อย" } : t
      ),
    };
  } else {
    // ใบงานเก่า / task รูปแบบเดิม -> เปลี่ยนมาใช้ pipeline 4 ขั้นตอนใหม่
    revivedJob = {
      ...revivedJob,
      tasks: createDefaultTasks(),
    };
  }

  return revivedJob;
};

// --- ฟังก์ชันโหลดข้อมูลจาก LocalStorage ---
const loadJobsFromStorage = (): Job[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsedJobs = JSON.parse(data) as Job[];
      // แปลงวันที่ทั้งหมดกลับเป็น Date Object
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

// --- สร้าง Context Interface ---
// กำหนดว่า Context นี้จะมีข้อมูลและฟังก์ชันอะไรบ้างให้เรียกใช้
interface JobContextType {
  jobs: Job[];
  addJob: (
    newJobData: Omit<Job, "id" | "createdAt" | "adminCreator">,
    adminName: string
  ) => void;
  updateJob: (
    jobId: string,
    updatedData: Partial<Job>,
    editReason: string,
    adminName: string
  ) => void;
  deleteJob: (jobId: string, reason: string, deletedByName: string) => void;
  addActivityLog: (
    jobId: string,
    activityType: ActivityLog["activityType"],
    message: string,
    actorName: string,
    actorRole: "leader" | "tech",
    metadata?: Record<string, any>
  ) => void;
  updateJobWithActivity: (
    jobId: string,
    updatedData: Partial<Job>,
    activityType: ActivityLog["activityType"],
    message: string,
    actorName: string,
    actorRole: "leader" | "tech",
    metadata?: Record<string, any>
  ) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

// ---- Migration helper (run manually from console if needed) ----
// Can be called from browser DevTools console in dev mode: migrateLocalJobsToFirestore()
export const migrateLocalJobsToFirestore = async () => {
  const local = loadJobsFromStorage();
  for (const job of local) {
    try {
      const ref = doc(db, "jobs", job.id);
      await setDoc(
        ref,
        { ...job, createdAt: job.createdAt || serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.error("migrateLocalJobsToFirestore failed for", job.id, e);
    }
  }
};

// --- JobProvider Component ---
// Component หลักที่ทำหน้าที่ให้บริการข้อมูล (Provider) แก่ Component ลูกๆ
export const JobProvider = ({ children }: { children: ReactNode }) => {
  // State เก็บรายการงานทั้งหมด (เริ่มต้นโหลดจาก LocalStorage ก่อนเพื่อความเร็ว)
  const [jobs, setJobs] = useState<Job[]>(() => loadJobsFromStorage());
  const { addNotification } = useNotifications();

  // Firestore Realtime Listener: เชื่อมต่อฐานข้อมูลแบบ Realtime
  // เมื่อข้อมูลใน Database เปลี่ยนแปลง จะอัปเดต State อัตโนมัติทันที
  useEffect(() => {
    const q = collection(db, "jobs");
    const unsub = onSnapshot(
      q,
      (snap) => {
        const toDate = (v: any) =>
          v && typeof v.toDate === "function" ? v.toDate() : v;

        const serverJobs: Job[] = snap.docs.map((d) => {
          const data: any = d.data();

          // แปลง Timestamp ของ Firestore เป็น Date object ถ้ามี
          const revivedJob: any = {
            id: d.id,
            ...data,
            startDate: toDate(data.startDate),
            endDate: toDate(data.endDate),
            createdAt: toDate(data.createdAt),
            completedAt: toDate(data.completedAt),
            editHistory: (data.editHistory || []).map((e: any) => ({
              ...e,
              editedAt: toDate(e.editedAt),
            })),
            activityLog: (data.activityLog || []).map((a: any) => ({
              ...a,
              timestamp: toDate(a.timestamp),
            })),
            tasks: (data.tasks || []).map((t: any) => ({
              ...t,
              updates: (t.updates || []).map((u: any) => ({
                ...u,
                updatedAt: toDate(u.updatedAt),
              })),
              materials: (t.materials || []).map((m: any) => ({
                ...m,
                withdrawnAt: toDate(m.withdrawnAt),
              })),
            })),
          } as Job;

          return revivedJob;
        });

        // 🔥 FIX: Merge server jobs with existing local-only jobs
        // Instead of overwriting, we keep jobs that are marked as isLocal: true
        setJobs((prevJobs) => {
          // 🛡️ SAFETY GUARD: If server returns EMPTY list, but we have local data,
          // it might be a sync glitch, auth issue, or wrong project.
          // We preserve local data to prevent "Disappearing" issue.
          if (serverJobs.length === 0 && prevJobs.length > 0) {
            console.warn("Server returned empty list. Preserving local jobs.");
            // Keep all previous jobs, marking them as local to persist them
            return prevJobs.map((job) => ({ ...job, isLocal: true }));
          }

          const localOnlyJobs = prevJobs.filter((job) => job.isLocal);

          // Filter out local jobs that might have been synced successfully (if ID matches)
          // (Though usually IDs won't match if generated locally vs server, but good to be safe)
          const uniqueLocalJobs = localOnlyJobs.filter(
            (localJob) =>
              !serverJobs.some((serverJob) => serverJob.id === localJob.id)
          );

          return [...serverJobs, ...uniqueLocalJobs];
        });
      },
      (err) => console.error("jobs onSnapshot error", err)
    );

    return () => unsub();
  }, []);

  // Persist a local cache so dashboards can show something quickly offline
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.error("Failed to save jobs to storage", e);
    }
  }, [jobs]);

  // --- ฟังก์ชัน "เพิ่มใบงานใหม่" (Create Job) ---
  // ใช้สำหรับสร้างใบงานใหม่ โดย Admin เป็นผู้สร้าง
  const addJob = (
    newJobData: Omit<Job, "id" | "createdAt" | "adminCreator">,
    adminName: string
  ) => {
    // 1. สร้าง Job ID แบบสุ่ม (Format: JOB-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newId = `JOB-${dateStr}-${randomStr}`;

    // 2. เตรียมข้อมูลใบงานใหม่
    const newJob: Job = {
      ...newJobData,
      id: newId,
      adminCreator: adminName,
      createdAt: date,
      status: "new", // สถานะเริ่มต้นคือ "ใหม่"
      editHistory: [],
      activityLog: [],
      tasks: createDefaultTasks(), // สร้าง Task มาตรฐาน 4 ขั้นตอนอัตโนมัติ
      assignedTechs: newJobData.assignedTechs || [],
      completionSummary: undefined,
      completionIssues: undefined,
      completionIssueImage: undefined,
      completedAt: undefined,
      leaderCloser: undefined,
    };

    // ======================== ขั้นตอนการส่ง Notification ========================
    // เมื่อสร้างงานใหม่ จะต้องแจ้งเตือนไปยังหัวหน้างาน (Leader) ที่ได้รับมอบหมาย
    const notificationsToSend: Parameters<typeof addNotification>[0][] = [];

    // ตรวจสอบว่ามีการระบุหัวหน้างาน (leadId) หรือไม่
    if (
      newJobData.leadId &&
      newJobData.leadId !== null &&
      newJobData.leadId !== undefined
    ) {
      // ค้นหาชื่อหัวหน้างานเพื่อนำมาแสดงในข้อความแจ้งเตือน
      const leaderName = findLeaderName(newJobData.leadId) ?? "หัวหน้างานใหม่";

      // สร้าง Notification Object
      notificationsToSend.push({
        title: "คุณได้รับมอบหมายเป็นหัวหน้างานใหม่",
        message: `คุณได้รับมอบหมายให้ดูแลงาน "${newJobData.title}" จาก ${adminName}`,
        recipientRole: "leader", // ส่งให้ Leader
        recipientId: String(newJobData.leadId),
        relatedJobId: newId, // แนบ Job ID เพื่อให้คลิกดูรายละเอียดได้
        metadata: {
          type: "leader_assignment_new",
          jobId: newId,
        },
      });
    }
    // =====================================================================

    // 3. บันทึกข้อมูลลง Firestore Database
    (async () => {
      try {
        await setDoc(doc(db, "jobs", newId), {
          ...newJob,
          createdAt: serverTimestamp(), // ใช้เวลาจาก Server เพื่อความแม่นยำ
        });
      } catch (e) {
        console.error("Failed to create job in Firestore", e);
        // กรณีบันทึกไม่สำเร็จ ให้บันทึกลง Local State ชั่วคราว (Fallback)
        // เพื่อให้ User เห็นว่างานถูกสร้างแล้ว (แม้จะยังไม่ลง Database จริง)
        const localJob = { ...newJob, isLocal: true };
        setJobs((prevJobs) => [localJob, ...prevJobs]);
      }
    })();

    // 4. ส่ง Notification ทั้งหมดที่เตรียมไว้
    notificationsToSend.forEach(addNotification);
  };

  // --- ฟังก์ชัน "อัปเดตใบงาน" (Update Job) ---
  // สำหรับ Admin ใช้แก้ไขข้อมูลใบงาน และบันทึกประวัติการแก้ไข (Edit History)
  const updateJob = (
    jobId: string,
    updatedData: Partial<Job>,
    editReason: string,
    adminName: string
  ) => {
    // 1. ค้นหาใบงานที่ต้องการแก้ไข
    const targetJob = jobs.find((job) => job.id === jobId);
    if (!targetJob) {
      console.warn(`updateJob: ไม่พบใบงานรหัส ${jobId}`);
      return;
    }

    // 2. สร้างประวัติการแก้ไขใหม่
    const newHistory: EditHistory = {
      adminName,
      editedAt: new Date(),
      reason: editReason,
      changes: Object.keys(updatedData).join(", "), // บันทึกชื่อฟิลด์ที่ถูกแก้ไข
    };

    // 3. รวมข้อมูลใหม่กับข้อมูลเดิม
    const updatedJob = {
      ...targetJob,
      ...updatedData,
      editHistory: [...(targetJob.editHistory || []), newHistory],
    } as Job;

    // ======================== จัดการ Notification เมื่อเปลี่ยนหัวหน้างาน ========================
    const notificationsToSend: Parameters<typeof addNotification>[0][] = [];

    // ตรวจสอบว่ามีการเปลี่ยนหัวหน้างาน (leadId) หรือไม่
    if (Object.prototype.hasOwnProperty.call(updatedData, "leadId")) {
      const previousLeaderId = targetJob.leadId;
      const nextLeaderId = updatedData.leadId ?? null;

      // ถ้าหัวหน้างานเปลี่ยนไปจากเดิม
      if (previousLeaderId !== nextLeaderId) {
        const newLeaderName = findLeaderName(nextLeaderId) ?? "หัวหน้างานใหม่";
        const oldLeaderName =
          findLeaderName(previousLeaderId) ?? "หัวหน้างานเดิม";
        const reasonMessage = editReason || "ไม่ระบุเหตุผล";

        // 1) แจ้งเตือนช่างทุกคนในทีม ว่าหัวหน้าเปลี่ยน
        (updatedJob.assignedTechs || []).forEach((techId) => {
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

        // 2) แจ้งเตือนหัวหน้างานคนเก่า (ว่าถูกปลดจากงานนี้)
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

        // 3) แจ้งเตือนหัวหน้างานคนใหม่ (ว่าได้รับงานนี้)
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
    // =====================================================================================

    // 4. บันทึกการเปลี่ยนแปลงลง Firestore
    (async () => {
      try {
        await updateDoc(doc(db, "jobs", jobId), {
          ...updatedJob,
          // หมายเหตุ: เราเก็บ editedAt ใน editHistory แล้ว จึงไม่ต้องใช้ serverTimestamp() ที่ root level ก็ได้
        } as any);
      } catch (e) {
        console.error("Failed to update job in Firestore", e);
        // Fallback: อัปเดต Local State เพื่อให้ User ใช้งานต่อได้ไม่สะดุด
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job.id === jobId ? updatedJob : job))
        );
      }
    })();

    // 5. ส่ง Notification ทั้งหมด
    notificationsToSend.forEach(addNotification);
  };

  // --- ฟังก์ชัน "เพิ่มบันทึกกิจกรรม" (Add Activity Log) ---
  // สำหรับ Leader/Tech ใช้บันทึกความคืบหน้าของงาน (เช่น เริ่มงาน, ส่งงาน, อัปเดตสถานะ)
  const addActivityLog = (
    jobId: string,
    activityType: ActivityLog["activityType"],
    message: string,
    actorName: string,
    actorRole: "leader" | "tech",
    metadata?: Record<string, any>
  ) => {
    const newActivity: ActivityLog = {
      actorName,
      actorRole,
      activityType,
      message,
      timestamp: new Date(),
      metadata,
    };

    (async () => {
      try {
        // ใช้ arrayUnion เพื่อเพิ่มข้อมูลต่อท้ายใน Array เดิมของ Firestore
        await updateDoc(doc(db, "jobs", jobId), {
          activityLog: arrayUnion(newActivity),
        } as any);
      } catch (e) {
        console.error("Failed to add activity log in Firestore", e);
        // Fallback: อัปเดต Local State
        setJobs((prevJobs) =>
          prevJobs.map((job) => {
            if (job.id === jobId) {
              return {
                ...job,
                activityLog: [...(job.activityLog || []), newActivity],
              };
            }
            return job;
          })
        );
      }
    })();
  };

  // --- ฟังก์ชัน "ลบใบงาน" (Delete Job) ---
  // สามารถเรียกใช้โดย Admin หรือ Leader (ที่มีสิทธิ์)
  const deleteJob = (jobId: string, reason: string, deletedByName: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) {
      console.warn(`deleteJob: ไม่พบใบงานรหัส ${jobId}`);
      return;
    }

    // เตรียม Notification แจ้งเตือนผู้เกี่ยวข้อง
    const notificationsToSend: Parameters<typeof addNotification>[0][] = [];

    // 1) แจ้งหัวหน้างาน
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

    // 2) แจ้งช่างทุกคนที่ถูกมอบหมาย
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

    // 3) ลบเอกสารออกจาก Firestore
    (async () => {
      try {
        await deleteDoc(doc(db, "jobs", jobId));
      } catch (e) {
        console.error("Failed to delete job in Firestore", e);
        // Fallback: ลบออกจาก Local State
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    })();

    // 4) ส่งแจ้งเตือนทั้งหมด
    notificationsToSend.forEach(addNotification);
  };

  // --- ฟังก์ชัน "อัปเดตงานพร้อมบันทึกกิจกรรม" (Update Job with Activity) ---
  // ใช้สำหรับอัปเดตข้อมูลงานพร้อมกับบันทึก Log ไปพร้อมกัน (เช่น การกดปุ่ม "รับงาน" หรือ "ปิดงาน")
  const updateJobWithActivity = (
    jobId: string,
    updatedData: Partial<Job>,
    activityType: ActivityLog["activityType"],
    message: string,
    actorName: string,
    actorRole: "leader" | "tech",
    metadata?: Record<string, any>
  ) => {
    const newActivity: ActivityLog = {
      actorName,
      actorRole,
      activityType,
      message,
      timestamp: new Date(),
      metadata,
    };

    // Optimistic Update: อัปเดตหน้าจอทันทีไม่ต้องรอ Server ตอบกลับ
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            ...updatedData,
            activityLog: [...(job.activityLog || []), newActivity],
          };
        }
        return job;
      })
    );

    // ส่งข้อมูลไปอัปเดตที่ Firestore
    (async () => {
      try {
        await updateDoc(doc(db, "jobs", jobId), {
          ...updatedData,
          activityLog: arrayUnion(newActivity),
        } as any);
      } catch (e) {
        console.error("Failed to update job with activity in Firestore", e);
      }
    })();
  };

  // ในโหมดพัฒนา ให้แนบ helper ไปยัง window เพื่อเรียกจาก DevTools ได้สะดวก
  useEffect(() => {
    if (import.meta.env.DEV) {
      try {
        (window as any).migrateLocalJobsToFirestore =
          migrateLocalJobsToFirestore;
      } catch (e) {
        // ปิดเงียบถ้าไม่สามารถแนบได้
      }
    }
  }, []);

  return (
    <JobContext.Provider
      value={{
        jobs,
        addJob,
        updateJob,
        deleteJob,
        addActivityLog,
        updateJobWithActivity,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

// --- "ทางลัด" (Hook) (เหมือนเดิม) ---
export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJobs ต้องถูกเรียกใช้ภายใน JobProvider");
  }
  return context;
};
