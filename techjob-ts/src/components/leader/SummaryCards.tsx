import React from 'react';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';

// [UPGRADE] Import Icons ที่จำเป็น
import { CheckCircle, Wrench, Hourglass } from 'lucide-react'; 

// --- Components ย่อยสำหรับ Chart (Mock Charts - เน้นความกระชับและเล็กลง) ---

// 1. Icon Completed (สีเขียว)
const IconCompleted: React.FC<{ color: string }> = ({ color }) => (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} shadow-lg`}>
        <CheckCircle size={24} className="text-white" />
    </div>
);

// 2. Wrench Icon (สีส้ม/เหลือง)
const IconInProgress: React.FC<{ color: string }> = ({ color }) => (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} shadow-lg`}>
        <Wrench size={24} className="text-white" />
    </div>
);

// 3. Hourglass Icon (สีส้ม/แดง)
const IconCompletedReview: React.FC<{ color: string }> = ({ color }) => (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} shadow-lg`}>
        <Hourglass size={24} className="text-white" />
    </div>
);


// --- Main Component ---

const SummaryCardsCompact: React.FC = () => {
  const { jobs } = useJobs();
  const { user } = useAuth();
  
  // Filter jobs assigned to leader
  const leaderJobs = React.useMemo(() => {
    if (!user || !jobs) return [];
    return jobs.filter(j => String(j.leadId) === String(user.id));
  }, [jobs, user]);
  
  const normalizeJobStatus = (status?: string | null) => {
    if (status === "completed") return "done";
    return status ?? "new";
  };

  const totalCount = leaderJobs.length;
  const inProgressCount = leaderJobs.filter(j => normalizeJobStatus(j.status) === 'in-progress').length;
  const completedCount = leaderJobs.filter(j => normalizeJobStatus(j.status) === 'done').length;
  // const completedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0; // ไม่ได้ใช้
  
  // ⭐️ [ปรับปรุง] เปลี่ยน Class Names สำหรับการสลับ Light/Dark Mode ⭐️
  const cards = [
    { 
      title: 'งานทั้งหมด All Tasks', 
      value: totalCount, 
      unit: 'งาน',
      description: 'จำนวนงานที่คุณทำเสร็จสิ้น',
      // ✅ Light Mode: bg-white | Dark Mode: dark:bg-[#1a1c2e]
      bgClass: 'bg-white dark:bg-[#1a1c2e]', 
      // ✅ Light Mode: border-gray-200 | Dark Mode: dark:border-slate-700
      borderClass: 'border-gray-200 dark:border-slate-700', 
      // สีตัวเลข ไม่ต้องมี dark: เพราะเราต้องการให้สีเหล่านี้คงที่
      valueClass: 'text-emerald-500', 
      iconBg: 'bg-emerald-700',
      icon: <IconCompleted color="bg-emerald-700" />,
      // ✅ สีข้อความ Title: Light=black/900, Dark=slate-300
      titleClass: 'text-slate-900 dark:text-slate-300',
      // ✅ สีข้อความ Description: Light=slate-500, Dark=slate-400
      descClass: 'text-slate-500 dark:text-slate-400',
    },
    { 
      title: 'กำลังดำเนินการ Processing Tasks', 
      value: inProgressCount, 
      unit: 'งาน',
      description: 'งานที่คุณกำลังดำเนินการอยู่',
      bgClass: 'bg-white dark:bg-[#1a1c2e]',
      borderClass: 'border-gray-200 dark:border-slate-700',
      valueClass: 'text-amber-500', 
      iconBg: 'bg-amber-700',
      // ✅ [สลับ Icon]: ใช้ Hourglass (IconCompletedReview) สำหรับกำลังดำเนินการ
      icon: <IconCompletedReview color="bg-amber-700" />,
      titleClass: 'text-slate-900 dark:text-slate-300',
      descClass: 'text-slate-500 dark:text-slate-400',
    },
    { 
      title: 'งานที่เสร็จแล้ว Completed Tasks', 
      value: completedCount, 
      unit: 'งาน',
      description: 'งานที่เสร็จรอการอนุมัติ',
      bgClass: 'bg-white dark:bg-[#1a1c2e]',
      borderClass: 'border-gray-200 dark:border-slate-700',
      valueClass: 'text-orange-500', 
      iconBg: 'bg-orange-700',
      // ✅ [สลับ Icon]: ใช้ Wrench (IconInProgress) สำหรับงานที่เสร็จแล้ว
      icon: <IconInProgress color="bg-orange-700" />,
      titleClass: 'text-slate-900 dark:text-slate-300',
      descClass: 'text-slate-500 dark:text-slate-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> 
      {cards.map((c, idx) => (
        <div 
          key={idx} 
          // ⭐️ [สไตล์กรอบ] ปรับ border-opacity ให้เหมาะสมกับการสลับโหมด
          className={`relative p-5 rounded-xl border ${c.bgClass} ${c.borderClass} border-opacity-100 dark:border-opacity-30 shadow-md transition-all duration-300 transform hover:shadow-lg hover:border-opacity-100 overflow-hidden`}
        >
          
          {/* 1. TOP ROW: Title */}
          <div className="flex justify-between items-start"> 
            {/* ✅ ใช้ titleClass ที่กำหนดการสลับสีแล้ว */}
            <h4 className={`text-base font-bold ${c.titleClass}`}>
                {c.title}
            </h4>
          </div>
          
          {/* 2. MAIN ROW: Value, Unit, Icon */}
          <div className="flex items-center justify-between mt-2">
            
            {/* Left: Value & Unit */}
            <div className="flex items-baseline gap-2"> 
                {/* สีตัวเลขใช้ valueClass ที่คงที่ */}
                <span className={`text-4xl font-extrabold ${c.valueClass}`}>{c.value}</span>
                <span className={`text-sm font-bold ${c.valueClass}`}>{c.unit}</span>
            </div>

            {/* Right: Icon ⭐️ (Icon Components ถูกปรับให้ใช้สีพื้นหลังคงที่อยู่แล้ว) */}
            <div className="shrink-0">
              {c.icon}
            </div>
          </div>
          
          {/* 3. FOOTER SECTION: Description */}
          <div className={`mt-3 pt-2`}>
              {/* ✅ ใช้ descClass ที่กำหนดการสลับสีแล้ว */}
              <span className={`text-xs ${c.descClass}`}>{c.description}</span>
          </div>
          
        </div>
      ))}
    </div>
  );
};

export default SummaryCardsCompact;