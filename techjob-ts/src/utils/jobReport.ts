// src/utils/jobReport.ts
import { jsPDF } from "jspdf";
import type { Job } from "@/types/index";
import { leader as LEADERS } from "@/Data/leader";
import { user as USERS } from "@/Data/user";
import { font as SarabunRegular } from "./fonts/Sarabun-Regular";

const getLeaderName = (job: Job) => {
  if (job.leaderCloser) return job.leaderCloser;
  const leader = LEADERS.find((item) => String(item.id) === String(job.leadId));
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

  // 1. Add Thai Font
  doc.addFileToVFS("Sarabun-Regular.ttf", SarabunRegular);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun");

  let y = 20;

  // --- Header ---
  doc.setFontSize(16); // ลดจาก 22 เป็น 16
  doc.text("รายงานสรุปการปิดงาน (Job Completion Report)", 105, y, {
    align: "center",
  });
  y += 8;

  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 8;

  // --- Job Details Table-like Structure ---
  doc.setFontSize(11); // ลดจาก 14 เป็น 11
  const completedAt = job.completedAt ? new Date(job.completedAt) : new Date();

  const leftColX = 14;
  const rightColX = 110;

  doc.text(`รหัสงาน: ${job.id}`, leftColX, y);
  const dateText = doc.splitTextToSize(
    `วันที่ปิดงาน: ${completedAt.toLocaleString("th-TH")}`,
    86
  );
  doc.text(dateText, rightColX, y);
  y += Math.max(6, dateText.length * 5);

  // ตัดบรรทัดสำหรับชื่องาน
  const titleLines = doc.splitTextToSize(`ชื่องาน: ${job.title}`, 182);
  doc.text(titleLines, leftColX, y);
  y += titleLines.length * 5 + 6;

  // --- Section 1: Customer Info ---
  doc.setFillColor(240, 248, 255);
  doc.rect(14, y - 5, 182, 7, "F");
  doc.setFontSize(12); // ลดจาก 16 เป็น 12
  doc.setTextColor(0, 51, 102);
  doc.text("1. ข้อมูลลูกค้า", 16, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  doc.setFontSize(11); // ลดจาก 14 เป็น 11
  // ตัดบรรทัดสำหรับชื่อลูกค้า
  const customerLines = doc.splitTextToSize(
    `ชื่อลูกค้า: ${job.customerName}`,
    86
  );
  doc.text(customerLines, 20, y);

  const phoneLines = doc.splitTextToSize(
    `เบอร์โทร: ${job.customerPhone || "-"}`,
    86
  );
  doc.text(phoneLines, rightColX, y);
  y += Math.max(customerLines.length, phoneLines.length) * 5 + 2;

  // ตัดบรรทัดสำหรับสถานที่
  const locationLines = doc.splitTextToSize(`สถานที่: ${job.location}`, 176);
  doc.text(locationLines, 20, y);
  y += locationLines.length * 5 + 6;

  // --- Section 2: Team Info ---
  doc.setFillColor(240, 248, 255);
  doc.rect(14, y - 5, 182, 7, "F");
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text("2. ทีมงานผู้ปฏิบัติงาน", 16, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  doc.setFontSize(11);
  const leaderLines = doc.splitTextToSize(
    `หัวหน้างาน: ${getLeaderName(job)}`,
    176
  );
  doc.text(leaderLines, 20, y);
  y += leaderLines.length * 5 + 2;

  const techNames = getTechNames(job);
  const techLines = doc.splitTextToSize(`ช่างเทคนิค: ${techNames}`, 176);
  doc.text(techLines, 20, y);
  y += techLines.length * 5 + 6;

  // --- Section 3: Work Summary ---
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(240, 248, 255);
  doc.rect(14, y - 5, 182, 7, "F");
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text("3. สรุปผลการทำงาน", 16, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  doc.setFontSize(11);
  const summary = job.completionSummary || "-";
  const summaryLines = doc.splitTextToSize(summary, 176);
  doc.text(summaryLines, 20, y);
  y += summaryLines.length * 5 + 6;

  // --- Section 4: Issues ---
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(240, 248, 255);
  doc.rect(14, y - 5, 182, 7, "F");
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text("4. ปัญหาที่พบ / หมายเหตุ", 16, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  doc.setFontSize(11);
  const issues = job.completionIssues || "-";
  const issueLines = doc.splitTextToSize(issues, 176);
  doc.text(issueLines, 20, y);
  y += issueLines.length * 5 + 6;

  // --- Section 5: Photos ---
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(240, 248, 255);
  doc.rect(14, y - 5, 182, 7, "F");
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text("5. หลักฐานรูปภาพ", 16, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  if (job.completionIssueImage) {
    try {
      const imgWidth = 80;
      const imgHeight = 60;

      if (y + imgHeight > 280) {
        doc.addPage();
        y = 20;
      }

      doc.addImage(
        job.completionIssueImage,
        "JPEG",
        20,
        y,
        imgWidth,
        imgHeight
      );
      doc.setFontSize(9);
      doc.text("รูปภาพประกอบ", 20, y + imgHeight + 4);
      y += imgHeight + 12;
    } catch (e) {
      console.error("Error adding image to PDF", e);
      doc.setFontSize(11);
      doc.text("(ไม่สามารถโหลดรูปภาพได้)", 20, y);
      y += 8;
    }
  } else {
    doc.setFontSize(11);
    doc.text("- ไม่มีรูปภาพ -", 20, y);
    y += 8;
  }

  // --- Signatures ---
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  y += 15;
  doc.setLineWidth(0.1);
  doc.setDrawColor(150);
  doc.setFontSize(10);

  // Leader Signature
  doc.line(30, y, 90, y);
  doc.text(
    "ลงชื่อ .................................................",
    35,
    y - 2
  );
  const leaderNameLines = doc.splitTextToSize(`(${getLeaderName(job)})`, 60);
  doc.text(leaderNameLines, 60, y + 5, { align: "center" });
  doc.text("หัวหน้างาน", 60, y + 5 + leaderNameLines.length * 4 + 3, {
    align: "center",
  });

  // Customer Signature
  doc.line(120, y, 180, y);
  doc.text(
    "ลงชื่อ .................................................",
    125,
    y - 2
  );
  doc.text("(.................................................)", 150, y + 5, {
    align: "center",
  });
  doc.text("ผู้ตรวจรับงาน / ลูกค้า", 150, y + 12, { align: "center" });

  doc.save(`${job.id}-completion-report.pdf`);
};
