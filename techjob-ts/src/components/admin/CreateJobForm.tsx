  // src/components/admin/CreateJobForm.tsx (ฉบับแก้ไข)
"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight } from 'lucide-react';
import { useJobs } from "@/contexts/JobContext";
import { DatePicker } from "@/components/common/DatePicker";
import { LeaderSelect } from "./LeaderSelect"; // (สำคัญ)
import { isDateRangeOverlapping } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { leader as ALL_LEADERS } from "@/Data/leader";
import { AdminMap } from "./AdminMap";




// "ประเภทงาน" ที่ Admin จะเลือก
const JOB_TYPES = [
  "ซ่อมบำรุง",
  "รื้อถอน",
  "ติดตั้งระบบ",
  "ตรวจสอบประจำปี",
  "อื่นๆ",
];

const STEPS = [
  { id: 1, label: "ข้อมูลพื้นฐาน" },
  { id: 2, label: "กำหนดการและการมอบหมาย" },
  { id: 3, label: "ข้อมูลลูกค้า" },
  { id: 4, label: "รายละเอียดงาน" },
];

export function CreateJobForm({ onFinished }: { onFinished: () => void }) {
  const { jobs, addJob } = useJobs();
  const { user } = useAuth(); // --- State ของฟอร์มทั้งหมด ---
  const [currentStep, setCurrentStep] = useState(1);
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerContactOther, setCustomerContactOther] = useState("");
  const [assignmentMode, setAssignmentMode] = useState<"self" | "leader">("self")


  const [title, setTitle] = useState("");
  const [jobType, setJobType] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null); // --- "สมอง" กรองหัวหน้างาน ---
  const [location, setLocation] = useState("");
  const [mapPosition, setMapPosition] = useState<
    [number, number] | undefined
  >();
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pdfPreviews, setPdfPreviews] = useState<{name: string, url: string}[]>([]);

  const availableLeads = useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }
    const busyLeadIds = new Set(
      jobs
        .filter(
          (job) =>
            isDateRangeOverlapping(
              startDate,
              endDate,
              job.startDate,
              job.endDate
            ) && job.leadId
        )
        .map((job) => String(job.leadId)) // (ปรับเป็น String เพื่อความปลอดภัย)
    );
    return ALL_LEADERS.filter((lead) => !busyLeadIds.has(String(lead.id))) // (ปรับเป็น String เพื่อความปลอดภัย)
      .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0));
  }, [startDate, endDate, jobs]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPdfFiles(files);
    
    const previews = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setPdfPreviews(previews);
  };

  const removePdf = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
    setPdfPreviews(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  
  const validateForm = (): boolean => {
    if (!title || !jobType) {
      alert("กรุณากรอกหัวข้องานและประเภทงาน")
      return false
    }
    if (!startDate || !endDate || !selectedLeadId) {
      alert("กรุณาระบุวันที่และเลือกหัวหน้างาน")
      return false
    }
    if (!customerName) {
      alert("กรุณากรอกชื่อลูกค้า")
      return false
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    
    if (!validateForm()) {
      return
    }

    if (!user) {
      alert("เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้");
      return;
    }

    const adminName = user.fname;

    addJob(
      {
        title,
        description: description || "ไม่มีข้อมูล",
        jobType: jobType,
        customerName,
        customerPhone: customerPhone || "ไม่มีข้อมูล",
        customerContactOther: customerContactOther || "ไม่มีข้อมูล",
        location: location || "ไม่ได้ระบุสถานที่",
        latitude: mapPosition?.[0],
        longitude: mapPosition?.[1],
        startDate,
        endDate,
        leadId: Number(selectedLeadId),
        imageUrl: imagePreview || "",
        otherFileUrl: "",
        pdfFiles: pdfPreviews.map(p => p.url), // Add PDF files
        assignedTechs: [],
        tasks: [],
        status: "new",
      },
     adminName,
    )

    onFinished()
  }

   return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 font-semibold text-sm">
                  1
                </div>
                <h2 className="text-xl font-semibold">ข้อมูลพื้นฐาน</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      หัวข้องาน <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="เช่น ติดตั้งระบบ Network"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      ประเภทงาน <span className="text-red-500">*</span>
                    </Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="เลือกประเภทงาน..." />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      ไฟล์ PDF แนบเพิ่มเติม
                      <span className="text-xs text-slate-500 ml-1">(ถ้ามี)</span>
                    </Label>
                    <Input type="file" accept=".pdf" multiple onChange={handlePdfChange} className="mt-1" />
                    {pdfPreviews.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {pdfPreviews.map((pdf, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700"
                          >
                            <span className="text-xs truncate">{pdf.name}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removePdf(index)}
                              className="h-5 w-5 p-0"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      อัปโหลดรูปภาพ
                      <span className="text-xs text-slate-500 ml-1">(ถ้ามี)</span>
                    </Label>
                    <Input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 mb-3" />
                    {imagePreview ? (
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center bg-slate-900/50">
                        <p className="text-sm text-slate-400">ไม่มีรูปภาพที่เลือก</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 font-semibold text-sm">
                  2
                </div>
                <h2 className="text-xl font-semibold">กำหนดการและการมอบหมาย</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      วันเริ่มงาน <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1">
                      <DatePicker date={startDate} setDate={setStartDate} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      วันจบงาน <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1">
                      <DatePicker date={endDate} setDate={setEndDate} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      เลือกหัวหน้างาน <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1">
                      <LeaderSelect
                        leaders={availableLeads}
                        selectedValue={selectedLeadId}
                        onValueChange={setSelectedLeadId}
                        disabled={!startDate || !endDate}
                      />
                    </div>
                    {(!startDate || !endDate) && <p className="text-xs text-slate-500 mt-2">กรุณาเลือกช่วงเวลางานก่อน</p>}
                    {selectedLeadId && availableLeads.length > 0 && (
                      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        {availableLeads.find((l) => String(l.id) === selectedLeadId) && (
                          <div className="flex items-center gap-3">
                            <img
                              src={availableLeads.find((l) => String(l.id) === selectedLeadId)?.avatarUrl || ""}
                              alt="Leader"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {availableLeads.find((l) => String(l.id) === selectedLeadId)?.fname}{" "}
                                {availableLeads.find((l) => String(l.id) === selectedLeadId)?.lname}
                              </p>
                              <p className="text-xs text-slate-400">
                                {availableLeads.find((l) => String(l.id) === selectedLeadId)?.position}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 font-semibold text-sm">
                  3
                </div>
                <h2 className="text-xl font-semibold">ข้อมูลลูกค้า</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      ชื่อลูกค้า <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="เช่น บริษัท ABC จำกัด"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">เบอร์โทร</Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="081-234-5678"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ช่องทางติดต่ออื่น (Line, Email)</Label>
                    <Input
                      value={customerContactOther}
                      onChange={(e) => setCustomerContactOther(e.target.value)}
                      placeholder="line: example หรือ email@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">สถานที่ปฏิบัติงาน</Label>
                  <AdminMap
                    initialAddress={location}
                    initialPosition={mapPosition}
                    onAddressChange={setLocation}
                    onPositionChange={setMapPosition}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 font-semibold text-sm">
                  4
                </div>
                <h2 className="text-xl font-semibold">รายละเอียดงาน</h2>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  รายละเอียดเพิ่มเติม
                  <span className="text-xs text-slate-500 ml-1">(ถ้ามี)</span>
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="รายละเอียด, เงื่อนไข, หมายเหตุ หรือสิ่งที่ต้องเตรียม..."
                  className="h-32 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-6xl flex justify-end">
          <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white px-8">
            สร้างใบงาน
          </Button>
        </div>
      </div>
    </form>
  )
}
