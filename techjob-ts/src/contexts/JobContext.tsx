// src/contexts/JobContext.tsx (ฉบับอัปเกรดให้ "จำเก่ง")
"use client";

import type { EditHistory, ActivityLog, Job, Task } from "@/types/index";
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react"; // 1. Import useEffect
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

// --- ชื่อกุญแจสำหรับเก็บข้อมูล ---
const STORAGE_KEY = "techJobData_v2"; // (v2 สำหรับระบบใหม่)

// --- (ใหม่!) ฟังก์ชันสร้าง Task มาตรฐาน 4 ขั้นตอนต่อ 1 ใบงาน ---
// โครงหลักของระบบใหม่: ทุกใบงานจะมี Task ตามลำดับนี้เสมอ
// 1) ตรวจสอบและวางแผน
// 2) จัดเตรียมวัสดุอุปกรณ์
// 3) กำลังดำเนินการ
// 4) ตรวจสอบความเรียบร้อย (เดิม: เสร็จสิ้น)
const createDefaultTasks = (): Task[] => {
  return [
    {
      id: "STEP-1",
      title: "ตรวจสอบและวางแผน",
      description: "",
      status: "in-progress", // เริ่มต้นให้ขั้นตอนแรกอยู่ในสถานะกำลังทำ
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

// --- (ใหม่!) ฟังก์ชันสำหรับ "ฟื้นคืนชีพ" Date Objects ---
// (localStorage จะแปลง Date เป็น string, เราต้องแปลงกลับ)
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

// --- สร้าง "ผู้ให้บริการ" (Provider) ---
export const JobProvider = ({ children }: { children: ReactNode }) => {
  // เริ่มต้น state ว่างไว้ก่อน — จะถูกเติมจาก Firestore realtime listener
  const [jobs, setJobs] = useState<Job[]>(() => loadJobsFromStorage());
  const { addNotification } = useNotifications();

  // Firestore realtime subscription: ให้ข้อมูลสดไหลมาที่ context
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

  // --- ฟังก์ชัน "เพิ่มใบงานใหม่" (เหมือนเดิม) ---
  const addJob = (
    newJobData: Omit<Job, "id" | "createdAt" | "adminCreator">,
    adminName: string
  ) => {
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
      status: "new",
      editHistory: [],
      activityLog: [],
      tasks: createDefaultTasks(),
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
    if (
      newJobData.leadId &&
      newJobData.leadId !== null &&
      newJobData.leadId !== undefined
    ) {
      // 3. ค้นหาชื่อของหัวหน้างานจากฟังก์ชัน findLeaderName()
      //    findLeaderName() จะหา ID ใน database leader มา
      const leaderName = findLeaderName(newJobData.leadId) ?? "หัวหน้างานใหม่";

      // no debug log

      // 5. สร้าง object notification
      //    object นี้จะถูกเก็บไว้ใน notificationsToSend array
      //    แล้วจึงส่งไปให้ NotificationContext จัดการลงใน localStorage
      notificationsToSend.push({
        title: "คุณได้รับมอบหมายเป็นหัวหน้างานใหม่",
        message: `คุณได้รับมอบหมายให้ดูแลงาน "${newJobData.title}" จาก ${adminName}`,
        recipientRole: "leader", // ← บอก NotificationContext ว่า "ส่งให้ Leader"
        recipientId: String(newJobData.leadId), // ← แปลง leadId (Number) เป็น String เพื่อเก็บสม่ำเสมอ
        relatedJobId: newId, // ← บอก Job ID เพื่อให้ Leader คลิกไปดูงาน
        metadata: {
          type: "leader_assignment_new",
          jobId: newId,
        },
      });
    }
    // =====================================================================

    // เขียนไปที่ Firestore โดยใช้ id ที่สร้างขึ้น (รักษา id เดิมของระบบ)
    (async () => {
      try {
        await setDoc(doc(db, "jobs", newId), {
          ...newJob,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("Failed to create job in Firestore", e);
        // ตกกลับเป็น local update เพื่อ UX ชั่วคราว
        // 🔥 FIX: Mark as local-only so it doesn't get wiped by next snapshot
        const localJob = { ...newJob, isLocal: true };
        setJobs((prevJobs) => [localJob, ...prevJobs]);
      }
    })();

    // 🔥 ส่ง notification ทั้งหมดที่เตรียมไว้ให้ NotificationContext จัดการ
    // ลูป forEach จะเรียก addNotification() หลายครั้ง (ครั้งละ 1 notification)
    notificationsToSend.forEach(addNotification);
  };

  // --- ฟังก์ชัน "อัปเดตใบงาน" (สำหรับ Admin เท่านั้น - ใช้ editHistory) ---
  const updateJob = (
    jobId: string,
    updatedData: Partial<Job>,
    editReason: string,
    adminName: string
  ) => {
    const targetJob = jobs.find((job) => job.id === jobId);
    if (!targetJob) {
      console.warn(`updateJob: ไม่พบใบงานรหัส ${jobId}`);
      return;
    }

    const newHistory: EditHistory = {
      adminName,
      editedAt: new Date(),
      reason: editReason,
      changes: Object.keys(updatedData).join(", "),
    };

    const updatedJob = {
      ...targetJob,
      ...updatedData,
      editHistory: [...(targetJob.editHistory || []), newHistory],
    } as Job;

    const notificationsToSend: Parameters<typeof addNotification>[0][] = [];

    if (Object.prototype.hasOwnProperty.call(updatedData, "leadId")) {
      const previousLeaderId = targetJob.leadId;
      const nextLeaderId = updatedData.leadId ?? null;

      if (previousLeaderId !== nextLeaderId) {
        const newLeaderName = findLeaderName(nextLeaderId) ?? "หัวหน้างานใหม่";
        const oldLeaderName =
          findLeaderName(previousLeaderId) ?? "หัวหน้างานเดิม";
        const reasonMessage = editReason || "ไม่ระบุเหตุผล";

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

    // เขียนการเปลี่ยนแปลงลง Firestore (merge)
    (async () => {
      try {
        await updateDoc(doc(db, "jobs", jobId), {
          ...updatedJob,
          // เราเก็บ editedAt ใน editHistory ดังนั้นไม่ต้อง serverTimestamp ที่นี่
        } as any);
      } catch (e) {
        console.error("Failed to update job in Firestore", e);
        // fallback: update local state for UX
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job.id === jobId ? updatedJob : job))
        );
      }
    })();

    notificationsToSend.forEach(addNotification);
  };

  // --- ฟังก์ชัน "เพิ่ม Activity Log" (สำหรับ Leader/Tech เท่านั้น) ---
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
        await updateDoc(doc(db, "jobs", jobId), {
          activityLog: arrayUnion(newActivity),
        } as any);
      } catch (e) {
        console.error("Failed to add activity log in Firestore", e);
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

    // ลบ doc ใน Firestore
    (async () => {
      try {
        await deleteDoc(doc(db, "jobs", jobId));
      } catch (e) {
        console.error("Failed to delete job in Firestore", e);
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    })();

    // ส่งแจ้งเตือนทั้งหมด
    notificationsToSend.forEach(addNotification);
  };

  // --- ฟังก์ชัน "อัปเดตงานพร้อม Activity Log" (สำหรับ Leader/Tech) ---
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

    // 🔥 FIX: Optimistic Update - Update local state IMMEDIATELY
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
