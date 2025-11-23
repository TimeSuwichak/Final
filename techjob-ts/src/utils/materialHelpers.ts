// src/utils/materialHelpers.ts
import type { Job } from "@/types";

export interface WithdrawalRecord {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  taskTitle: string;
  withdrawnBy: string;
  withdrawnAt: Date;
}

export interface JobWithdrawalSummary {
  jobId: string;
  jobTitle: string;
  totalItems: number;
  withdrawals: WithdrawalRecord[];
}

/**
 * รวบรวมข้อมูลการเบิกวัสดุทั้งหมด จัดกลุ่มตามใบงาน
 */
export function getJobWithdrawalSummaries(jobs: Job[]): JobWithdrawalSummary[] {
  const summaries: JobWithdrawalSummary[] = [];

  jobs.forEach((job) => {
    const withdrawals: WithdrawalRecord[] = [];

    job.tasks?.forEach((task) => {
      task.materials?.forEach((material) => {
        withdrawals.push({
          materialId: material.materialId,
          materialName: material.materialName || "ไม่ระบุ",
          quantity: material.quantity,
          unit: material.unit || "ชิ้น",
          taskTitle: task.title,
          withdrawnBy: material.withdrawnBy,
          withdrawnAt: material.withdrawnAt,
        });
      });
    });

    // เฉพาะงานที่มีการเบิก
    if (withdrawals.length > 0) {
      summaries.push({
        jobId: job.id,
        jobTitle: job.title,
        totalItems: withdrawals.length,
        withdrawals: withdrawals.sort(
          (a, b) =>
            new Date(b.withdrawnAt).getTime() -
            new Date(a.withdrawnAt).getTime()
        ),
      });
    }
  });

  // เรียงตามจำนวนรายการเบิก (มากไปน้อย)
  return summaries.sort((a, b) => b.totalItems - a.totalItems);
}

/**
 * แปลงเวลาเป็นข้อความ "เมื่อไหร่" (Time Ago)
 */
export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days === 1) return "เมื่อวาน";
  return `${days} วันที่แล้ว`;
}
