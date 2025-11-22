"use client";

import React from "react";
// ต้องแน่ใจว่าได้ import components เหล่านี้อย่างถูกต้อง:
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CalendarCheck, Bell, AlertTriangle, Eye, TrendingUp, Trophy, ChevronRight, Zap, CheckCircle, Briefcase, Star } from "lucide-react";

// --- 1. ข้อมูลจำลอง (Mock Data) สำหรับการแสดงผล (ปรับปรุง) ---
type Counts = {
  today: number;
  new: number;
  toFix: number;
  forReview: number;
  completedLastMonth: number;
};

type Metrics = {
    // Growth Metrics
    completionRate: number; // อัตราการทำงานเสร็จในครั้งแรก
    completionRateAverage: number; // ค่าเฉลี่ยของทีม
    monthOverMonthGrowth: number; // การเติบโตเมื่อเทียบกับเดือนที่แล้ว
};

type Tier = {
    currentLevel: 'ช่างฝึกหัด' | 'ช่างชำนาญการ' | 'ช่างมืออาชีพ' | 'มาสเตอร์ช่าง';
    nextLevel: string;
    progressToNext: number; // 0-100
    condition: string;
};

// **ข้อมูลใหม่สำหรับความเชี่ยวชาญ**
type Specialization = {
    topSkill: string; // ชื่อประเภทงานที่เชี่ยวชาญที่สุด
    totalTasks: number; // จำนวนงานที่ทำในประเภทนั้น
    tasksNeededForNextSkill: number; // งานที่ต้องทำเพิ่มเพื่อให้เชี่ยวชาญทักษะถัดไป
};

// Gamification ถูกลบไปแล้ว แต่เราจะคง Interface DashboardProps ไว้
interface DashboardProps {
  counts?: Counts;
  metrics?: Metrics;
  tier?: Tier;
  specialization?: Specialization; // ใช้ Specialization แทน Gamification
}

const defaultCounts: Counts = { today: 2, new: 1, toFix: 0, forReview: 1, completedLastMonth: 5 };
const defaultMetrics: Metrics = { completionRate: 95, completionRateAverage: 90, monthOverMonthGrowth: 20 };
const defaultTier: Tier = { currentLevel: 'ช่างชำนาญการ', nextLevel: 'ช่างมืออาชีพ', progressToNext: 75, condition: 'ทำภารกิจซับซ้อนสำเร็จ 5 งาน' };
const defaultSpecialization: Specialization = { topSkill: 'งานซ่อมบำรุงเชิงลึก', totalTasks: 45, tasksNeededForNextSkill: 15 }; // ข้อมูลจำลองใหม่

// สีหลักสำหรับ Minimalist Design: ใช้สี Indigo เป็นสี Accent
const ACCENT_COLOR_CLASS = 'text-indigo-600 dark:text-indigo-400';

// --- 2. Component หลัก (Dashboard Layout) ---
export default function UserWorkStatusDashboard({
  counts = defaultCounts,
  metrics = defaultMetrics,
  tier = defaultTier,
  specialization = defaultSpecialization, // ใช้ specialization แทน gamification
}: DashboardProps) {

  return (
    <div className="space-y-6 p-4">
      {/* ส่วนที่ 1: การยกย่องและระดับช่าง - Minimalist V2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TierCard tier={tier} />
        <SpecializationCard specialization={specialization} /> {/* เปลี่ยนเป็น SpecializationCard */}
        <GrowthMetricsCard metrics={metrics} counts={counts} />
      </div>

      {/* ลบ: ส่วนที่ 2: สถานะงานปัจจุบัน ออกแล้ว */}
    </div>
  );
}

// --- 4. Component สำหรับระดับช่าง (Tier/Leveling System) - Minimalist V2 (คงเดิม) ---
function TierCard({ tier }: { tier: Tier }) {
  const progressColor = tier.progressToNext < 50 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-lg font-bold ${ACCENT_COLOR_CLASS}`}>
          🚀 ระดับความเชี่ยวชาญของคุณ
        </CardTitle>
        <Zap size={24} className={ACCENT_COLOR_CLASS} />
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-extrabold ${ACCENT_COLOR_CLASS} mb-2`}>
          {tier.currentLevel}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-1">
            <div className="text-sm font-semibold text-primary">
                ก้าวสู่: <span className={ACCENT_COLOR_CLASS}>{tier.nextLevel} ({tier.progressToNext}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div 
                    className={`h-2 rounded-full ${progressColor} transition-all duration-500`} 
                    style={{ width: `${tier.progressToNext}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                เงื่อนไขถัดไป: <span className="font-medium text-primary">{tier.condition}</span>
            </p>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <button className={`text-sm font-semibold ${ACCENT_COLOR_CLASS} flex items-center hover:opacity-80`}>
            ดูสิทธิประโยชน์ <ChevronRight size={16} />
        </button>
      </CardFooter>
    </Card>
  );
}

// --- 5. Component สำหรับความเชี่ยวชาญสูงสุด (Specialization Card) ---
function SpecializationCard({ specialization }: { specialization: Specialization }) {
  const tasksDone = specialization.totalTasks;
  const tasksGoal = tasksDone + specialization.tasksNeededForNextSkill;
  const progressPercent = Math.round((tasksDone / tasksGoal) * 100);

  // ใช้สีเหลือง/ทอง สำหรับการเน้น
  const accentColor = 'text-yellow-600 dark:text-yellow-400';
  const progressColor = 'bg-yellow-500';

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-lg font-bold ${accentColor}`}> 
          ⭐ ความเชี่ยวชาญสูงสุด
        </CardTitle>
        <Star size={24} className={accentColor} />
      </CardHeader>
      <CardContent>
        
        <p className="text-sm text-muted-foreground">
            ทักษะที่โดดเด่นของคุณ:
        </p>
        <div className={`text-2xl font-extrabold ${accentColor} mb-4`}>
            {specialization.topSkill}
        </div>

        <div className="flex items-baseline justify-between">
            <div>
                <p className="text-sm font-semibold text-muted-foreground">
                    จำนวนงานสำเร็จในทักษะนี้:
                </p>
                <div className={`text-4xl font-extrabold text-primary`}>
                    {specialization.totalTasks}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    งานที่ต้องทำเพิ่ม: {specialization.tasksNeededForNextSkill} งาน
                </p>
            </div>
        </div>

        {/* Progress Bar สำหรับการปลดล็อกระดับถัดไปในทักษะนี้ */}
        <div className="space-y-1 mt-4">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                ใกล้ปลดล็อกระดับถัดไป ({progressPercent}%)
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div 
                    className={`h-2 rounded-full ${progressColor} transition-all duration-500`} 
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>

      </CardContent>
    </Card>
  );
}

// --- 6. Component สำหรับตัวชี้วัดการเติบโต (Growth Metrics) - Minimalist V2 (คงเดิม) ---
function GrowthMetricsCard({ metrics, counts }: { metrics: Metrics, counts: Counts }) {
  const isGrowing = metrics.monthOverMonthGrowth > 0;
  const growthColor = isGrowing ? 'text-emerald-500' : 'text-rose-500';
  const growthIcon = isGrowing ? <TrendingUp size={20} /> : <TrendingUp size={20} className="transform rotate-180" />; 
  
  // การคำนวณสีสำหรับ FTF (แก้ไขตามคำขอ)
  const isHighPerformance = metrics.completionRate >= metrics.completionRateAverage;
  
  // สีพื้นหลัง: ใช้สีเขียวอมฟ้า #52C59D (คล้ายรูปภาพ)
  const performanceBgColor = isHighPerformance ? 'bg-[#52C59D] dark:bg-[#52C59D]' : 'bg-amber-500 dark:bg-amber-400';
  
  // สีตัวอักษร: ใช้สีม่วงอ่อน (คล้ายรูปภาพ)
  const performanceTextColor = 'text-[#E0E0E0]'; 
  
  // สีสำหรับ Progress Bar (ใช้สีเขียวมาตรฐาน)
  const performanceColorClass = isHighPerformance ? 'bg-emerald-500' : 'bg-amber-500';

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-lg font-bold ${ACCENT_COLOR_CLASS}`}>
          📈 การเติบโตและความแม่นยำ
        </CardTitle>
        <CheckCircle size={24} className="text-emerald-500" />
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Metric 1: อัตราการทำงานสำเร็จในครั้งแรก (First Time Fix Rate) - ปรับปรุง */}
        <div className="p-3 border rounded-lg dark:border-gray-700">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">อัตราสำเร็จในครั้งแรก (FTF)</p>
                
                {/* องค์ประกอบที่สร้างพื้นหลังและข้อความที่มองเห็นชัดเจน */}
                <div className={`p-1 px-2 rounded ${performanceBgColor}`}>
                    <span className={`text-xl font-bold ${performanceTextColor}`}>
                        {metrics.completionRate}%
                    </span>
                </div>
                
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 mt-2">
                <div 
                    className={`h-2 rounded-full ${performanceColorClass} transition-all duration-500`} 
                    style={{ width: `${metrics.completionRate}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                เปรียบเทียบค่าเฉลี่ยทีม: ({metrics.completionRateAverage}%) 
            </p>
        </div>

        {/* Metric 2: การเติบโตของงาน */}
        <div className="p-3 border rounded-lg dark:border-gray-700">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">ผลงานเติบโตเทียบเดือนที่แล้ว</p>
                <div className={`flex items-center text-xl font-extrabold ${growthColor}`}>
                    {growthIcon} 
                    <span className="ml-1">{Math.abs(metrics.monthOverMonthGrowth)}%</span>
                </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                เดือนที่แล้ว: {counts.completedLastMonth} งาน
            </p>
        </div>
      </CardContent>
    </Card>
  );
}