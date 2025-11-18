import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'ซ่อมบำรุง', value: 6 },
  { name: 'ติดตั้งระบบ', value: 4 },
  { name: 'ตรวจเช็คสภาพ', value: 5 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; 

interface ChartProps {
  isDarkMode: boolean;
}

const TypeDonut: React.FC<ChartProps> = ({ isDarkMode }) => {
  return (
    <div className="h-full p-6 transition-colors duration-300 bg-white border shadow-lg rounded-xl border-slate-200 dark:bg-[#1e1e2d] dark:border-slate-800">
      {/* Header Section */}
      <div className="mb-4">
        <h4 className="text-lg font-bold text-slate-800 dark:text-white">ประเภทงานที่เชี่ยวชาญ</h4>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">สัดส่วนประเภทงานทั้งหมดที่คุณเคยทำสำเร็จ</p>
      </div>

      {/* Chart Section */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius={60} 
              outerRadius={85} 
              paddingAngle={5} 
              dataKey="value" 
              stroke="none" 
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            
            {/* Tooltip: ปรับสีพื้นหลังและตัวอักษรตามโหมด */}
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1e1e2d' : '#ffffff', 
                borderColor: isDarkMode ? '#334155' : '#e2e8f0', 
                color: isDarkMode ? '#fff' : '#1e293b', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: isDarkMode ? '#fff' : '#1e293b' }}
            />
            
            {/* Legend: ปรับสีตัวอักษรตามโหมด */}
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle" 
              iconSize={10}
              wrapperStyle={{ 
                paddingTop: '20px', 
                fontSize: '12px', 
                color: isDarkMode ? '#cbd5e1' : '#64748b' 
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TypeDonut;