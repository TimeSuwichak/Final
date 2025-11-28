import React, { useState, useRef, useEffect, useMemo, createContext, useContext } from 'react';
import { Download, Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, BarChart2, Briefcase, CheckSquare, Clock as ClockIcon, CalendarCheck } from 'lucide-react';
// ✅ เพิ่ม CalendarCheck หรือ CheckSquare เพื่อใช้เป็น Icon ใหม่

// Components (split) - Assuming these are accessible
import TaskStatusHeader from '../../components/leader/TaskStatusHeader';
import SummaryCards from '../../components/leader/SummaryCards';
import TypeDonut from '../../components/leader/TypeDonut';
import MonthlyBarChart from '../../components/leader/MonthlyBarChart';
import { useTheme } from '@/components/common/theme-provider';

// ------------------------------------------------------------------
// ⭐ NEW Component: Task Status Header Card 
// ------------------------------------------------------------------
function TaskStatusHeaderCard() {

  const cardStyle = "bg-white dark:bg-[#1a1c2e] rounded-2xl shadow-xl dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-[#2A2C40]";
  const titleStyle = "text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug"; // ปรับ Title ให้ใหญ่ขึ้นเล็กน้อย
  const descStyle = "text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium";

  // ✅ [NEW ICON STYLE] Glass Sphere for Task Status (ใช้สี/เงาเดียวกับ CEO Header)
  const iconWrapperStyle = `
        w-14 h-14 md:w-16 md:h-16 flex items-center justify-center 
        rounded-full 
        bg-gradient-to-br from-indigo-500 to-violet-600 
        dark:from-indigo-700 dark:to-violet-800 
        shadow-[
            0_5px_15px_rgba(0,0,0,0.3), 
            0_0_0_1px_rgba(255,255,255,0.1), 
            inset_0_2px_5px_rgba(255,255,255,0.3), 
            inset_0_-2px_5px_rgba(0,0,0,0.2) 
        ]
        dark:shadow-[
            0_5px_15px_rgba(0,0,0,0.6), 
            0_0_0_1px_rgba(255,255,255,0.05),
            inset_0_2px_5px_rgba(255,255,255,0.1),
            inset_0_-2px_5px_rgba(0,0,0,0.3)
        ]
        transform transition-all duration-300 ease-in-out
    `;

  return (
    <div className={`p-5 md:p-6 flex items-center gap-4 relative overflow-hidden ${cardStyle}`}>

      {/* 1. Vertical Accent Line (สอดคล้องกับ Card Style) */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-l-2xl"></div>

      {/* 2. Glass Sphere Icon Wrapper */}
      <div className={iconWrapperStyle}>
        {/* ✅ [NEW ICON]: ใช้ CalendarCheck หรือ CheckSquare แทน Icon เก่า */}
        <CalendarCheck size={28} className="text-white drop-shadow-sm" />
      </div>

      <div>
        <h3 className={titleStyle}>
          Task Status Leader
        </h3>
        <p className={descStyle}>
          ภาพรวมสถานะงานและสถิติการทำงานของคุณ
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// ⭐ LeaderDashboard (ใช้ Component ที่สร้างใหม่แทนโค้ดเก่า)
// ------------------------------------------------------------------
const LeaderDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const resolveTheme = () => {
      const resolvedDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches);
      setIsDarkMode(resolvedDark);
    };

    resolveTheme();

    if (theme === "system") {
      mediaQuery.addEventListener("change", resolveTheme);
      return () => mediaQuery.removeEventListener("change", resolveTheme);
    }

    return;
  }, [theme]);

  return (
    // p-6 คือ padding ที่หุ้มทั้งหน้า (base container padding)
    <div className="space-y-6 p-6">
      {/* ✅ ใช้ Component ที่ปรับปรุงแล้ว */}
      <TaskStatusHeaderCard />

      {/* ส่วนอื่น ๆ ของ Dashboard */}
      <SummaryCards />

      {/* ถ้า TaskStatusHeader เดิมเป็น Filter หรือ Control ให้แยกไว้ต่างหาก */}
      {/* <TaskStatusHeader /> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TypeDonut />
        </div>

        <div>
          <MonthlyBarChart isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

// ... (ThemeProvider, DashboardActions, Filters, Skeletons โค้ดส่วนอื่น ๆ ที่เกี่ยวข้อง) ...

// **หมายเหตุ:** โค้ดทั้งหมดในไฟล์นี้จะยังคงทำงานได้ หากมีการเรียกใช้ LeaderDashboard นี้แทนที่โค้ดเดิม
// *******
// * เนื่องจากคุณไม่ได้ให้โค้ดทั้งหมดของไฟล์ LeaderDashboard มา ผมจึงต้องสมมติว่าคุณจะนำ TaskStatusHeaderCard ไปวางแทนที่โค้ดเก่าของ Task Status Leader เอง
// *******

export default LeaderDashboard;