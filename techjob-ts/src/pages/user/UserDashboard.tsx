import React, { useState } from 'react';
// นำเข้า Components จาก shadcn/ui
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppWindowIcon, CodeIcon, LayoutDashboard, Settings, User, LogOut, FileText, Clock } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import MyTasksPage from '@/components/user/MyTasks';
import UserCalendarPage from './UserCalendar';

// ===============================================
// ✅ 1. กำหนด TypeScript Interface สำหรับ Job
interface Job {
    id: string;
    type: string;
    customer: string;
    location: string;
    appointment: string;
    time: string;
    status: 'in-progress' | 'finished';
    imageUrl: string;
}

// กำหนด Type สำหรับ Props ของ JobCard
interface JobCardProps {
    job: Job;
}
// ===============================================


// จำลองข้อมูลใบงาน (ใช้ Interface ที่กำหนด)
const mockJobs: Job[] = [
    {
        id: "J-2025-09-28-001",
        type: "ช่างแอร์",
        customer: "คุณสมหญิง",
        location: "สุขุมวิท 101",
        appointment: "29 ต.ค. 2568",
        time: "14:00 น.",
        status: "in-progress",
        imageUrl: "https://via.placeholder.com/150/000000/FFFFFF/?text=Job+Image",
    },
    {
        id: "J-2025-09-28-002",
        type: "ช่างแอร์",
        customer: "คุณสมหญิง",
        location: "สุขุมวิท 101",
        appointment: "29 ต.ค. 2568",
        time: "14:00 น.",
        status: "in-progress",
        imageUrl: "https://via.placeholder.com/150/000000/FFFFFF/?text=Job+Image",
    },
    {
        id: "J-2025-09-27-003",
        type: "งานซ่อมท่อ",
        customer: "คุณสมชาย",
        location: "พญาไท",
        appointment: "27 ต.ค. 2568",
        time: "10:30 น.",
        status: "finished",
        imageUrl: "https://via.placeholder.com/150/000000/FFFFFF/?text=Job+Image",
    },
];

// คอมโพเนนต์สำหรับ Card ใบงาน
// ===============================================
// ✅ 2. ใช้ JobCardProps ในการกำหนด Prop Type
const JobCard: React.FC<JobCardProps> = ({ job }) => {
// ===============================================
    const robberImage = "https://i.ibb.co/L95B16F/thief-breaking-server-3d-illustration.png";
    return (
        <Card className="flex items-center p-4 bg-black border-neutral-700 text-white rounded-lg shadow-lg">
            <div className="`flex-grow` space-y-1 text-sm">
                <p className="font-bold text-lg">ใบงานเลขที่: {job.id}</p>
                <p>ประเภท: {job.type}</p>
                <p>ลูกค้า: {job.customer}</p>
                <p>สถานที่: {job.location}</p>
                <div className="flex items-center text-red-400">
                    <Clock size={14} className="mr-1" />
                    <p className="text-red-400">กำหนดหมาย: {job.appointment} ⬤ {job.time}</p>
                </div>
            </div>
            <div className="flex flex-col items-center ml-4">
                <img
                    src={robberImage}
                    alt="Work in Progress"
                    className="w-24 h-24 object-cover rounded-md"
                />
                <Button className="mt-2 bg-[#5F5AFF] hover:bg-[#4b48c7] text-white text-xs px-3 py-1 h-auto">
                    ดูรายละเอียด
                </Button>
            </div>
        </Card>
    );
};

// คอมโพเนนต์จำลองกราฟแท่ง Popular Countries
const PopularCountriesChart: React.FC = () => (
    <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex-1 min-w-[250px]">
        <h3 className="text-lg font-semibold mb-3">Statistics</h3>
        <p className="text-sm text-neutral-400 mb-4">Popular countries</p>
        <div className="space-y-4 text-sm">
            {/* Country Bar: USA */}
            <div className="flex items-center">
                <span className="w-12 text-neutral-400">USA</span>
                <div className="`flex-grow` ml-4 relative h-3 bg-neutral-700 rounded-full">
                    <div className="absolute top-0 left-0 h-full bg-[#9B59B6] rounded-full" style={{ width: '80%' }}></div>
                </div>
            </div>
            {/* Country Bar: Canada */}
            <div className="flex items-center">
                <span className="w-12 text-neutral-400">Canada</span>
                <div className="`flex-grow` ml-4 relative h-3 bg-neutral-700 rounded-full">
                    <div className="absolute top-0 left-0 h-full bg-[#3498DB] rounded-full" style={{ width: '60%' }}></div>
                </div>
            </div>
            {/* Country Bar: UK */}
            <div className="flex items-center">
                <span className="w-12 text-neutral-400">UK</span>
                <div className="`flex-grow` ml-4 relative h-3 bg-neutral-700 rounded-full">
                    <div className="absolute top-0 left-0 h-full bg-[#5F5AFF] rounded-full" style={{ width: '50%' }}></div>
                </div>
            </div>
            {/* Country Bar: Australia */}
            <div className="flex items-center">
                <span className="w-12 text-neutral-400">Australia</span>
                <div className="`flex-grow` ml-4 relative h-3 bg-neutral-700 rounded-full">
                    <div className="absolute top-0 left-0 h-full bg-[#2ECC71] rounded-full" style={{ width: '35%' }}></div>
                </div>
            </div>
            <div className="flex justify-between text-neutral-400 pt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
            </div>
        </div>
    </div>
);

// คอมโพเนนต์จำลองกราฟแท่ง Average Time Spent
const AverageTimeChart: React.FC = () => (
    <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex-1 min-w-[250px]">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm text-neutral-400">Average time spent</p>
                <h3 className="text-2xl font-bold text-white">4h 35m ⏳</h3>
            </div>
            <span className="bg-[#5F5AFF] text-white text-xs font-semibold px-2 py-1 rounded-full absolute right-8 top-16 md:relative md:top-0">
                6hr 43m
            </span>
        </div>

        {/* Bar Chart Area (Simplified) */}
        <div className="h-40 relative flex items-end justify-around border-b border-neutral-700">
            {/* Y-Axis Labels */}
            <div className="absolute top-0 left-0 right-0 h-full text-neutral-500 text-xs">
                <div className="absolute top-0">8 hr</div>
                <div className="absolute top-1/4">6 hr</div>
                <div className="absolute top-1/2">4 hr</div>
                <div className="absolute top-3/4">2 hr</div>
                <div className="absolute bottom-0">0 hr</div>
            </div>

            {/* Bars (M T W T F S S) */}
            <div className="`flex-grow` flex justify-around h-full items-end ml-10">
                {/* M */}
                <div className="flex flex-col items-center h-full justify-end">
                    <div className="w-4 bg-neutral-700 rounded-t-sm" style={{ height: '30%' }}></div>
                    <span className="text-xs text-neutral-400 mt-1">M</span>
                </div>
                {/* T */}
                <div className="flex flex-col items-center h-full justify-end">
                    <div className="w-4 bg-neutral-700 rounded-t-sm" style={{ height: '50%' }}></div>
                    <span className="text-xs text-neutral-400 mt-1">T</span>
                </div>
                {/* W */}
                <div className="flex flex-col items-center h-full justify-end">
                    <div className="w-4 bg-neutral-700 rounded-t-sm" style={{ height: '40%' }}></div>
                    <span className="text-xs text-neutral-400 mt-1">W</span>
                </div>
                {/* T */}
                <div className="flex flex-col items-center h-full justify-end">
                    <div className="w-4 bg-neutral-700 rounded-t-sm" style={{ height: '35%' }}></div>
                    <span className="text-xs text-neutral-400 mt-1">T</span>
                </div>
                {/* F (Highlighted) */}
                <div className="flex flex-col items-center h-full justify-end">
                    <div className="w-4 bg-[#5F5AFF] rounded-t-sm" style={{ height: '80%' }}></div>
                    <span className="text-xs text-neutral-400 mt-1">F</span>
                </div>
                {/* S */}
                <div className="flex flex-col items-center h-full justify-end">
                    <div className="w-4 bg-neutral-700 rounded-t-sm" style={{ height: '30%' }}></div>
                    <span className="text-xs text-neutral-400 mt-1">S</span>
                </div>
                {/* S */}
                <div className="flex flex-col items-center h-full justify-end">
                    <div className="w-4 bg-neutral-700 rounded-t-sm" style={{ height: '20%' }}></div>
                    <span className="text-xs text-neutral-400 mt-1">S</span>
                </div>
            </div>
        </div>
    </div>
);

// คอมโพเนนต์หลัก: UserDashboard
const UserDashboard: React.FC = () => {
    const inProgressJobs = mockJobs.filter(job => job.status === "in-progress");
    const finishedJobs = mockJobs.filter(job => job.status === "finished");
    const [activeTab, setActiveTab] = useState('in-progress');

    return (
        <div className="flex h-screen w-full bg-black text-white">
            <div className="flex-1 p-4 md:p-8 bg-background">

                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-foreground">
                      ข้อมูลภาพรวม
                   </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-8">

                {/* Statistics Row (Graphs) */}
                <div className="flex flex-wrap gap-8 mb-12">
                    <PopularCountriesChart />
                    <AverageTimeChart />
                </div>

                {/* Job Cards Section (Tabs) */}
                <Tabs defaultValue="in-progress" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 bg-neutral-800 p-1 rounded-lg mb-6">
                        <TabsTrigger value="in-progress" className="data-[state=active]:bg-[#5F5AFF] data-[state=active]:text-white">
                            อยู่ระหว่างดำเนินการ <span className="ml-2 px-2 py-0.5 bg-black rounded-full text-white text-xs font-semibold">{inProgressJobs.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="finished" className="data-[state=active]:bg-[#5F5AFF] data-[state=active]:text-white">
                            เสร็จแล้ว <span className="ml-2 px-2 py-0.5 bg-black rounded-full text-white text-xs font-semibold">{finishedJobs.length}</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="in-progress" className="space-y-6">
                        {inProgressJobs.length > 0 ? (
                            inProgressJobs.map((job) => <JobCard key={job.id} job={job} />)
                        ) : (
                            <p className="text-neutral-500 text-center py-10">ไม่มีใบงานที่อยู่ระหว่างดำเนินการ</p>
                        )}
                    </TabsContent>

                    <TabsContent value="finished" className="space-y-6">
                        {finishedJobs.length > 0 ? (
                            finishedJobs.map((job) => <JobCard key={job.id} job={job} />)
                        ) : (
                            <p className="text-neutral-500 text-center py-10">ไม่มีใบงานที่เสร็จสมบูรณ์</p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            <UserCalendarPage/>
            <MyTasksPage/>
          </div>
        </div>
    );
};

export default UserDashboard;

