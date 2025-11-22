"use client"
import { useNavigate } from "react-router-dom"
import { CreateJobForm } from "@/components/admin/CreateJobForm"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CreateJobPage() {
  const navigate = useNavigate()

  const handleFinished = () => {
    navigate("/admin/workoders")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="mx-auto  flex items-center gap-4">
           <Button variant="outline" size="icon" onClick={() => navigate("/admin/workoders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">สร้างใบงานใหม่</h1>
            <p className="text-sm text-slate-400">กรอกรายละเอียดทั้งหมดของงาน และมอบหมายหัวหน้างาน</p>
          </div>
        </div>
      </div>


      <CreateJobForm onFinished={handleFinished} />
    </div>
  )
}