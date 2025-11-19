// src/utils/jobReport.ts
import { jsPDF } from "jspdf";
import type { Job } from "@/types/index";
import { leader as LEADERS } from "@/Data/leader";
import { user as USERS } from "@/Data/user";

const getLeaderName = (job: Job) => {
  if (job.leaderCloser) return job.leaderCloser;
  const leader = LEADERS.find(
    (item) => String(item.id) === String(job.leadId)
  );
  return leader ? `${leader.fname} ${leader.lname}` : "หัวหน้างาน";
};

const getTechNames = (job: Job) => {
  if (!job.assignedTechs.length) return "-";
  return job.assignedTechs
    .map((techId) => {
      const tech = USERS.find((item) => String(item.id) === String(techId));
      return tech ? `${tech.fname} ${tech.lname}` : `ช่างรหัส ${techId}`;
    })
    .join(", ");
};

export const generateCompletionReportPdf = (job: Job) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text("รายงานสรุปการปิดงาน", 14, y);
  doc.setFontSize(11);

  const summary = job.completionSummary || "-";
  const issues = job.completionIssues || "-";
  const completedAt = job.completedAt
    ? new Date(job.completedAt)
    : new Date();

  y += 10;
  doc.text(`รหัสงาน: ${job.id}`, 14, y);
  y += 7;
  doc.text(`ชื่องาน: ${job.title}`, 14, y);
  y += 7;
  doc.text(`หัวหน้างาน: ${getLeaderName(job)}`, 14, y);
  y += 7;
  doc.text(
    `ลูกค้า: ${job.customerName} (${job.customerPhone || "ไม่มีเบอร์"})`,
    14,
    y
  );
  y += 7;
  doc.text(`ปิดงานเมื่อ: ${completedAt.toLocaleString("th-TH")}`, 14, y);
  y += 10;

  doc.text(`ทีมช่าง: ${getTechNames(job)}`, 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("สรุปผลการทำงาน", 14, y);
  doc.setFontSize(11);
  y += 6;
  const summaryLines = doc.splitTextToSize(summary, 180);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 6 + 4;

  doc.setFontSize(12);
  doc.text("ปัญหาที่พบ", 14, y);
  doc.setFontSize(11);
  y += 6;
  const issueLines = doc.splitTextToSize(issues, 180);
  doc.text(issueLines, 14, y);
  y += issueLines.length * 6 + 4;

  doc.setFontSize(12);
  doc.text("รายการงานย่อย", 14, y);
  doc.setFontSize(11);
  y += 6;
  if (job.tasks.length === 0) {
    doc.text("- ไม่มีการสร้างงานย่อย", 16, y);
    y += 6;
  } else {
    job.tasks.forEach((task, index) => {
      doc.text(`${index + 1}. ${task.title}`, 16, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  }

  if (job.completionIssueImage) {
    if (y > 200) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.text("หลักฐานรูปภาพ", 14, y);
    y += 6;
    doc.addImage(job.completionIssueImage, "JPEG", 14, y, 90, 60);
  }

  doc.save(`${job.id}-completion-report.pdf`);
};

