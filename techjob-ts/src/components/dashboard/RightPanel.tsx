import React from 'react'
import { Badge } from "../ui/badge"; 
import { 
  BarChart2, PlayCircle, Clock, CheckCircle, 
  Wrench, Zap, Settings2, Shield, Truck, RefreshCw, // 💡 เพิ่ม Icons ใหม่
  PieChart as PieChartIcon 
} from 'lucide-react'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, 
  BarChart, Bar, CartesianGrid, XAxis, YAxis, 
  LabelList 
} from 'recharts'

// 💡 [อัปเดต] ขยาย iconMap สำหรับ Bar Chart เพื่อรองรับ 6 งาน
const iconMap: Record<string, React.ReactNode> = {
  'ติดตั้ง A/C': <Settings2 className="h-5 w-5 text-gray-400" />,
  'ซ่อมบำรุง': <Wrench className="h-5 w-5 text-gray-400" />,
  'ซ่อมด่วน': <Zap className="h-5 w-5 text-gray-400" />,
  'ตรวจเช็คประจำปี': <Shield className="h-5 w-5 text-gray-400" />, // NEW
  'ขนย้ายอุปกรณ์': <Truck className="h-5 w-5 text-gray-400" />, // NEW
  'เปลี่ยนอะไหล่': <RefreshCw className="h-5 w-5 text-gray-400" />, // NEW
}
const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const { value } = payload;
  return (
    <g transform={`translate(${x},${y})`}>
      <svg x={-125} y={-10} width={24} height={24}>
        {iconMap[value] || <Wrench className="h-5 w-5 text-gray-400" />}
      </svg>
      <text x={-95} y={0} dy={4} textAnchor="start" fill="#6b7280" className="text-sm font-medium">
        {value}
      </text>
    </g>
  );
};

// Custom Label สำหรับ Bar Chart เพื่อปรับปรุงการแสดงผล (ปรับให้แสดง "งาน" แทน "%")
const CustomBarLabel = (props: any) => {
  const { x, y, width, height, value, index } = props;
  const color = PALETTE[index % PALETTE.length];
  
  return (
    <text 
      x={x + width + 5} // ขยับไปทางขวาของ Bar เล็กน้อย
      y={y + height / 2} 
      dy={4} 
      fill={color} // ใช้สีเดียวกับ Bar
      textAnchor="start" 
      className="text-sm font-bold"
    >
      {/* 💡 เปลี่ยนเป็นแสดงหน่วยเป็น "งาน" */}
      {`${value} งาน`} 
    </text>
  );
};


// 💡 [อัปเดต] ขยาย PALETTE เพื่อรองรับ 6 สี
const PALETTE = ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#a855f7']; // เพิ่มสีฟ้า, แดง, ม่วง
const statusConfig: any = {
  'เริ่มงาน': { icon: <PlayCircle size={18} className="text-blue-500" />, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  'กำลังดำเนินการ': { icon: <Clock size={18} className="text-yellow-600" />, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'งานเสร็จสิ้น': { icon: <CheckCircle size={18} className="text-green-500" />, className: 'bg-green-100 text-green-800 border-green-200' },
  'default': { icon: <Clock size={18} className="text-gray-500" />, className: 'bg-gray-100 text-gray-800 border-gray-200' }
}

// 💡 [อัปเดต] ขยาย Icon Map สำหรับ Legend ของ Pie Chart เพื่อรองรับ 6 งาน
const legendIconMap: Record<string, React.ElementType> = {
  'ติดตั้ง A/C': Settings2,
  'ซ่อมบำรุง': Wrench,
  'ซ่อมด่วน': Zap,
  'ตรวจเช็คประจำปี': Shield,
  'ขนย้ายอุปกรณ์': Truck,
  'เปลี่ยนอะไหล่': RefreshCw,
};

export default function RightPanel() {
  
  // 💡 [อัปเดต] Mock Data สำหรับ 6 ประเภทงาน (Pie Chart)
  const jobTypeData = [ 
    { name: 'ติดตั้ง A/C', value: 25 }, 
    { name: 'ซ่อมบำรุง', value: 20 }, 
    { name: 'ซ่อมด่วน', value: 15 }, 
    { name: 'ตรวจเช็คประจำปี', value: 15 }, 
    { name: 'ขนย้ายอุปกรณ์', value: 12 }, 
    { name: 'เปลี่ยนอะไหล่', value: 13 } 
  ] // รวมกันได้ 100%

  // 💡 [อัปเดต] Mock Data สำหรับ 6 ประเภทงาน (Bar Chart - Completed Works)
  const completedWorksData = [ // เปลี่ยนชื่อ Data และค่า
    { name: 'ติดตั้ง A/C', Completed: 45 }, // เปลี่ยน Rate เป็น Completed
    { name: 'ซ่อมบำรุง', Completed: 30 },
    { name: 'ซ่อมด่วน', Completed: 15 },
    { name: 'ตรวจเช็คประจำปี', Completed: 20 }, 
    { name: 'ขนย้ายอุปกรณ์', Completed: 10 }, 
    { name: 'เปลี่ยนอะไหล่', Completed: 18 } 
  ]

  return (
    <>
      {/* --- Card 2: Pie Chart (สัดส่วนประเภทงาน) --- */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PieChartIcon size={20} className="text-indigo-500" />
          สัดส่วนประเภทงาน (Job Type Distribution)
        </h3>
        {/* 💡 ปรับความสูงเล็กน้อยเพื่อให้มีพื้นที่สำหรับ Legend ด้านล่าง */}
        <div className="h-56"> 
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="shadow" height="130%">
                  <feDropShadow 
                    dx="0" 
                    dy="4" 
                    stdDeviation="4" 
                    floodColor="#000000" 
                    floodOpacity="0.15" 
                  />
                </filter>
              </defs>

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '8px 12px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)', 
                  color: '#333' 
                }} 
                formatter={(value: any, name: string) => [`${value}%`, name]} 
                labelStyle={{ fontWeight: 'bold', color: '#4f46e5' }}
              />
              <Pie data={jobTypeData} cx="50%" cy="50%" 
                innerRadius={70} 
                outerRadius={90} 
                fill="#8884d8" 
                paddingAngle={3} // 💡 ลด paddingAngle เล็กน้อยเพื่อให้วงดูเต็มขึ้น
                dataKey="value"
                filter="url(#shadow)" 
              >
                {jobTypeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PALETTE[index % PALETTE.length]} 
                    stroke="none" 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend ปรับปรุงให้แสดง 2 คอลัมน์บนหน้าจอขนาดใหญ่เพื่อประหยัดพื้นที่ */}
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {jobTypeData.map((entry, index) => {
            const color = PALETTE[index % PALETTE.length];
            const Icon = legendIconMap[entry.name] || Wrench; 
            
            return (
              <li key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" style={{ color }} />
                  <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {entry.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {entry.value}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* --- Card 3: Bar Chart (Completed Works) --- */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {/* 💡 เปลี่ยน Icon และหัวข้อให้สื่อถึงงานที่เสร็จแล้ว */}
          <CheckCircle size={20} className="text-green-500" />
          Completed Works (จำนวนงานที่ทำเสร็จ)
        </h3>
        {/* 💡 เพิ่ม pt-4 (padding-top) เพื่อดัน Bar Chart ลงมาให้พอดีกับกรอบ */}
        <div className="h-80 pt-4"> 
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={completedWorksData} // 💡 เปลี่ยน Data Source
              layout="vertical" 
              // ปรับ margin top กลับเป็นค่าเดิมหรือลดลงเล็กน้อย เพราะเราใช้ pt-4 ดันแล้ว
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }} 
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} horizontal={false} />
              
              {/* 💡 XAxis: ปรับ type เป็น number และแสดงผลบนกราฟ (ไม่ซ่อนแล้ว) */}
              <XAxis 
                type="number" 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280', fontSize: '12px' }}
                tickFormatter={(value) => `${value} งาน`} // 💡 เพิ่มหน่วย 'งาน'
                label={{ value: 'จำนวนงานที่ทำเสร็จ', position: 'bottom', offset: 0, fill: '#4f46e5', fontWeight: 'bold', fontSize: 12 }} // 💡 เพิ่ม Label แกน X
              />
              
              <YAxis 
                dataKey="name" 
                type="category" 
                tickLine={false} 
                axisLine={false} 
                width={130} 
                tick={<CustomYAxisTick />}
                interval={0}
              />
              
              {/* ❌ ลบ YAxis ทางขวาออก เนื่องจากไม่ได้ใช้ Completion Rate แล้ว */}

              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }} 
                // 💡 ปรับ Tooltip ให้แสดง "จำนวนงาน"
                formatter={(value: any) => [`${value} งาน`, "Completed Works"]} 
              />
              
              <Bar 
                dataKey="Completed" // 💡 เปลี่ยน dataKey เป็น 'Completed'
                name="Completed Works" 
                radius={[0, 10, 10, 0]} 
                barSize={15} 
              >
                {completedWorksData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
                
                <LabelList 
                  dataKey="Completed" // 💡 เปลี่ยน dataKey เป็น 'Completed'
                  content={<CustomBarLabel />}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}