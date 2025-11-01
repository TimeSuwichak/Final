// Cleaned version of LeaderDashboard (removed unused code)
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock } from "lucide-react"
import MyManagedTasksPage from "@/components/leader/MyManagedTasks"

interface Job {
  id: string
  type: string
  customer: string
  location: string
  appointment: string
  time: string
  status: "in-progress" | "finished"
}

interface JobCardProps {
  job: Job
}

const mockJobs: Job[] = [
  {
    id: "J-2025-09-28-001",
    type: "ช่างแอร์",
    customer: "คุณสมหญิง",
    location: "สุขุมวิท 101",
    appointment: "29 ต.ค. 2568",
    time: "14:00 น.",
    status: "in-progress",
  },
  {
    id: "J-2025-09-28-002",
    type: "ช่างแอร์",
    customer: "คุณสมหญิง",
    location: "สุขุมวิท 101",
    appointment: "29 ต.ค. 2568",
    time: "14:00 น.",
    status: "in-progress",
  },
  {
    id: "J-2025-09-27-003",
    type: "งานซ่อมท่อ",
    customer: "คุณสมชาย",
    location: "พญาไท",
    appointment: "27 ต.ค. 2568",
    time: "10:30 น.",
    status: "finished",
  },
]

const JobCard: React.FC<JobCardProps> = ({ job }) => (
  <Card className="flex items-center p-6 bg-card border-border text-card-foreground rounded-lg shadow-sm">
    <div className="flex-grow space-y-2 text-sm">
      <p className="font-semibold text-base text-foreground">ใบงานเลขที่: {job.id}</p>
      <p className="text-muted-foreground">ประเภท: {job.type}</p>
      <p className="text-muted-foreground">ลูกค้า: {job.customer}</p>
      <p className="text-muted-foreground">สถานที่: {job.location}</p>
      <div className="flex items-center text-muted-foreground">
        <Clock size={14} className="mr-1" />
        <p>
          กำหนดหมาย: {job.appointment} ⬤ {job.time}
        </p>
      </div>
    </div>
    <div className="flex flex-col items-center ml-6 gap-3">
      <div className="w-40 h-28 bg-muted border border-border rounded flex items-center justify-center">
        <div className="text-muted-foreground text-6xl">✕</div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="text-xs px-4 py-1.5 h-auto bg-transparent">ดูรายละเอียด</Button>
        <Button variant="outline" className="text-xs px-4 py-1.5 h-auto bg-transparent">แชท</Button>
        <Button variant="outline" className="text-xs px-4 py-1.5 h-auto bg-transparent">ตีกลับงาน</Button>
      </div>
    </div>
  </Card>
)

const LeaderDashboard: React.FC = () => {
  const inProgressJobs = mockJobs.filter((job) => job.status === "in-progress")
  const finishedJobs = mockJobs.filter((job) => job.status === "finished")

  return (
    <div className="flex h-screen w-full bg-background">
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <Button variant="outline">การเเจ้งเตือน</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-muted border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-6">ภาพรวมสถานการณ์ :</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">11</div>
                <div className="text-xs text-muted-foreground">ทีมงาน<br />(ยังไม่ได้ทำงานวันนี้)</div>
              </div>
              <div className="text-center border-l border-r border-border px-2">
                <div className="text-4xl font-bold text-foreground mb-2">112</div>
                <div className="text-xs text-muted-foreground">ทั้งหมดในทีม<br />(ทีมงาน)</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">200</div>
                <div className="text-xs text-muted-foreground">เครื่องมือ<br />(ยังไม่ได้ยืมคืน)</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-muted border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-6">ภาพรวมสถานะ User :</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">100</div>
                <div className="text-xs text-muted-foreground">จำนวนที่รับงานแล้ว</div>
              </div>
              <div className="text-center border-l border-border pl-8">
                <div className="text-4xl font-bold text-foreground mb-2">98</div>
                <div className="text-xs text-muted-foreground">กำลังดูผู้ใช้งาน</div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="in-progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border p-0 rounded-none h-auto mb-6">
            <TabsTrigger value="new" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 text-foreground">ในงานใหม่</TabsTrigger>
            <TabsTrigger value="in-progress" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 text-foreground">อยู่ระหว่างรอดำเนินการ</TabsTrigger>
            <TabsTrigger value="finished" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 text-foreground">เสร็จแล้ว</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4 mt-6">
            <p className="text-muted-foreground text-center py-10">ไม่มีใบงานใหม่</p>
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4 mt-6">
            {inProgressJobs.length > 0 ? inProgressJobs.map((job) => <JobCard key={job.id} job={job} />) : <p className="text-muted-foreground text-center py-10">ไม่มีใบงานที่อยู่ระหว่างดำเนินการ</p>}
          </TabsContent>

          <TabsContent value="finished" className="space-y-4 mt-6">
            {finishedJobs.length > 0 ? finishedJobs.map((job) => <JobCard key={job.id} job={job} />) : <p className="text-muted-foreground text-center py-10">ไม่มีใบงานที่เสร็จสมบูรณ์</p>}
          </TabsContent>
        </Tabs>
        <MyManagedTasksPage/>
      </div>
      
    </div>
  )
}

export default LeaderDashboard


