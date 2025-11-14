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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from 'lucide-react';
import { useJobs } from "@/contexts/JobContext";
import { DatePicker } from "@/components/common/DatePicker";
import { LeaderSelect } from "./LeaderSelect"; // (สำคัญ)
import { isDateRangeOverlapping } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { leader as ALL_LEADERS } from "@/data/leader";
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

  // Form state
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

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return !!(title && jobType);
    }
    if (step === 2) {
      return !!(startDate && endDate && selectedLeadId);
    }
    if (step === 3) {
      return !!customerName;
    }
    if (step === 4) {
      return true;
    }
    return false;
  };

  const handleNextStep = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      if ('stopPropagation' in e) {
        e.stopPropagation();
      }
    }

    if (!validateStep(currentStep)) {
      alert(`กรุณากรอกข้อมูล * ให้ครบถ้วนในขั้นตอนที่ ${currentStep}`);
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // หยุดการ submit แบบ default ของ browser

    // --- นี่คือส่วนสำคัญที่เพิ่มเข้ามา ---
    // ตรวจสอบว่า "เฮ้! เราอยู่ขั้นตอนสุดท้าย (ที่ 4) แล้วหรือยัง?"
    if (currentStep !== 4) {
      // ถ้ายัง (เช่น อยู่ที่ 1, 2, หรือ 3)
      // ให้ไปเรียกฟังก์ชัน 'ถัดไป' แทน
      handleNextStep(e);
      // แล้ว "หยุด" การทำงานของ handleSubmit ทันที
      return;
    }
    // --- สิ้นสุดส่วนที่เพิ่มเข้ามา ---


    // ถ้าโค้ดวิ่งมาถึงตรงนี้ได้... 
    // แปลว่า currentStep === 4 จริง (อยู่หน้าสุดท้าย)
    // ให้ทำงานตามปกติ (ส่งข้อมูล)

    if (!validateStep(4)) {
      alert("กรุณากรอกข้อมูล * ให้ครบถ้วน");
      return;
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
        assignedTechs: [],
        tasks: [],
        status: "new",
      },
      adminName
    );

    onFinished();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8 flex-wrap px-4">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          <Badge
            className={`px-3 py-1.5 cursor-pointer transition-all ${currentStep === step.id
                ? "bg-purple-500 text-white"
                : currentStep > step.id
                  ? "bg-green-500/20 text-green-700"
                  : "bg-slate-700 text-slate-300"
              }`}
          >
            {step.id}.{step.label}
          </Badge>
          {index < STEPS.length - 1 && (
            <ChevronRight
              className={`w-4 h-4 ${currentStep > step.id ? "text-green-500" : "text-slate-600"}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="w-full p-6">
          <div className="max-w-6xl mx-auto">
            {renderStepIndicator()}

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-6">ข้อมูลพื้นฐาน</h2>
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
                      ไฟล์แนบ (PDF, DOC)
                      <span className="text-xs text-slate-500 ml-1">(ถ้ามี)</span>
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Right - Image Preview */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-6">รูปภาพหน้างาน</h2>
                  <div>
                    <Label className="text-sm font-medium">
                      อัปโหลดรูปภาพ
                      <span className="text-xs text-slate-500 ml-1">(ถ้ามี)</span>
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-1 mb-3"
                    />
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
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-6">กำหนดการและการมอบหมาย</h2>
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

                {/* Right */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-6">หัวหน้างาน</h2>
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
                    {(!startDate || !endDate) && (
                      <p className="text-xs text-slate-500 mt-2">
                        กรุณาเลือกช่วงเวลางานก่อน
                      </p>
                    )}
                    {selectedLeadId && availableLeads.length > 0 && (
                      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        {availableLeads.find((l) => String(l.id) === selectedLeadId) && (
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                availableLeads.find((l) => String(l.id) === selectedLeadId)
                                  ?.avatarUrl || ""
                              }
                              alt="Leader"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {
                                  availableLeads.find((l) => String(l.id) === selectedLeadId)
                                    ?.fname
                                }{" "}
                                {
                                  availableLeads.find((l) => String(l.id) === selectedLeadId)
                                    ?.lname
                                }
                              </p>
                              <p className="text-xs text-slate-400">
                                {
                                  availableLeads.find((l) => String(l.id) === selectedLeadId)
                                    ?.position
                                }
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-6">ข้อมูลลูกค้า</h2>
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
                    <Label className="text-sm font-medium">
                      ช่องทางติดต่ออื่น (Line, Email)
                    </Label>
                    <Input
                      value={customerContactOther}
                      onChange={(e) => setCustomerContactOther(e.target.value)}
                      placeholder="line: example หรือ email@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-6">สถานที่ปฏิบัติงาน</h2>
                  <AdminMap
                    initialAddress={location}
                    initialPosition={mapPosition}
                    onAddressChange={setLocation}
                    onPositionChange={setMapPosition}
                  />
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold mb-3">รายละเอียดงาน</h2>
                <p className="text-sm text-slate-400 mb-4">
                  ใส่รายละเอียดงานเพิ่มเติมเพื่อให้ทีมเข้าใจตรงกัน
                </p>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="รายละเอียด, เงื่อนไข, หมายเหตุ หรือสิ่งที่ต้องเตรียม..."
                  className="min-h-64"
                />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-6xl flex justify-between">

          <Button
            type="button"
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
          >
            ย้อนกลับ
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={(e) => handleNextStep(e)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              ถัดไป
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              สร้างใบงาน
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
