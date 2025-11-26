import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
} from 'recharts';
import { BarChart2, TrendingUp, TrendingDown } from 'lucide-react'; 

const data = [
  { name: 'มิ.ย.', value: 4 },
  { name: 'ก.ค.', value: 6 },
  { name: 'ส.ค.', value: 5 },
  { name: 'ก.ย.', value: 8 }, // เดือนที่มีงานสูงสุด
  { name: 'ต.ค.', value: 7 },
  { name: 'พ.ย.', value: 2 },
];

interface ChartProps {
  isDarkMode: boolean;
}

const MonthlyBarChart: React.FC<ChartProps> = ({ isDarkMode }) => {
  
  // 💡 Logic คำนวณข้อมูลสรุป
  const totalJobs = data.reduce((sum, item) => sum + item.value, 0); // 32
  const averageJobs = (totalJobs / data.length).toFixed(1); // 5.3
  const maxJobMonth = data.reduce((max, item) => (item.value > max.value ? item : max), data[0]);
  
  // 💡 เปรียบเทียบเดือนล่าสุด (พ.ย. 2) กับเดือนก่อน (ต.ค. 7)
  const lastMonthValue = data[data.length - 1].value;
  const prevMonthValue = data[data.length - 2].value;
  const changePercent = ((lastMonthValue - prevMonthValue) / prevMonthValue) * 100;

  // 💡 กำหนดสไตล์การเปลี่ยนแปลง (บวก/ลบ)
  const isPositiveChange = changePercent >= 0;
  const changeColorClass = isPositiveChange ? 'text-emerald-500' : 'text-red-500';
  const ChangeIcon = isPositiveChange ? TrendingUp : TrendingDown;


  return (
    <div className="h-full p-6 bg-white border shadow-sm rounded-2xl border-slate-200 dark:bg-[#1e1e2d] dark:border-slate-800 transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-6">
        <div>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart2 size={20} className="text-indigo-500" /> 
               งานรายเดือน Monthly Trends
            </h4>
            
            {/* ⭐️ ปรับโครงสร้าง: คำอธิบายหลัก + Statistics Bar อยู่ใน div เดียวกัน ⭐️ */}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-1 text-slate-500 dark:text-slate-400">
                
                {/* 1. คำอธิบายหลัก (6 เดือน) */}
                <p className="text-sm">ปริมาณงานรายเดือน (6 เดือน)</p>

                {/* 2. ค่าเฉลี่ยงานต่อเดือน */}
                <div className="flex items-center gap-1">
                    <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{averageJobs}</span>
                    <span className="text-xs">งานเฉลี่ย/เดือน</span>
                </div>
                
                {/* 3. เดือนที่มีงานสูงสุด */}
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{maxJobMonth.name}</span>
                    <span className="text-xs">สูงสุด ({maxJobMonth.value} งาน)</span>
                </div>
                
                {/* 4. การเปลี่ยนแปลงเดือนล่าสุด */}
                <div className="flex items-center gap-1">
                    <ChangeIcon size={14} className={changeColorClass} />
                    <span className={`text-sm font-bold ${changeColorClass}`}>
                        {changePercent.toFixed(0)}%
                    </span>
                    <span className="text-xs">จากเดือนก่อน</span>
                </div>
            </div>
            {/* ⭐️ End Statistics Bar ⭐️ */}

        </div>
        <div className="text-right shrink-0">
            <div className="text-4xl font-extrabold text-indigo-500"> 
                {totalJobs}
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Jobs</span>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <defs>
              {/* Gradient สำหรับแท่งกราฟ */}
              <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={1}/> {/* Indigo-400 */}
                <stop offset="100%" stopColor="#6366f1" stopOpacity={1}/> {/* Indigo-500 */}
              </linearGradient>
              {/* Gradient สำหรับแท่งกราฟตอน Hover (สว่างขึ้น) */}
              <linearGradient id="colorBarHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a5b4fc" stopOpacity={1}/> 
                <stop offset="100%" stopColor="#818cf8" stopOpacity={1}/> 
              </linearGradient>
            </defs>
            
            <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                // ✅ [แก้ไข Light Mode]: ใช้สีเทาที่เข้มขึ้นและเพิ่มความทึบแสง
                stroke={isDarkMode ? "#334155" : "#cbd5e1"} 
                strokeOpacity={isDarkMode ? 0.5 : 1.0}
            />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              // ✅ [แก้ไข Light Mode]: ใช้สีดำที่ชัดเจน
              tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              // ✅ [แก้ไข Light Mode]: ใช้สีดำที่ชัดเจน
              tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 12 }} 
            />
            
            <Tooltip 
                cursor={{ fill: isDarkMode ? '#334155' : '#f8fafc', opacity: 0.4 }}
                contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1e1e2d' : '#ffffff', 
                    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    color: isDarkMode ? '#fff' : '#0f172a',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px'
                }}
                formatter={(value: number, name: string, props: any) => [
                    `${value} งาน`, 
                    'ผลงานต่อเดือน'
                ]}
            />
            
            <Bar 
                dataKey="value" 
                fill="url(#colorBar)" 
                radius={[6, 6, 0, 0]} // ทำให้หัวมน
                barSize={28} // ขนาดความกว้างของแท่ง
                animationDuration={1500}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorBar)" />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChart;