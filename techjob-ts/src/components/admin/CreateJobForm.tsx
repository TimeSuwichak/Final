// src/components/admin/CreateJobForm.tsx
"use client";

// --- 1. IMPORT ทุกอย่างที่จำเป็น ---
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaImage, FaFileAlt } from "react-icons/fa"; // เพิ่มไอคอนสำหรับไฟล์
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// --- Import Components ที่สร้างไว้ ---
import TeamLeadSelector from "./TeamLeadSelector";
import { MultiSelectTechnician } from "./MultiSelectTechnician";
import InteractiveMap from "../common/InteractiveMap";
import { Calendar22 } from "./Calendar22"; // Component เลือกวันที่

// --- นำเข้าข้อมูล ---

import { leader } from "@/Data/leader";
import { user } from "@/Data/user";

// เตรียมข้อมูลแผนก (ทำนอก Component เพื่อประสิทธิภาพ)
const allDepartments = [...new Set(leader.map((l) => l.department))];

export function CreateJobForm({ onSubmit }: { onSubmit: (data: any) => void }) {
    
  // --- 2. STATE สำหรับจัดการข้อมูลในฟอร์ม ---
  // ส่วนข้อมูลหลัก
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  // ส่วนข้อมูลลูกค้า (เพิ่มใหม่)
  const [customerName, setCustomerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [otherContact, setOtherContact] = useState("");

  // ส่วนวันที่ (เพิ่มใหม่)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // ส่วนการมอบหมายงาน
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [selectedTechs, setSelectedTechs] = useState<any[]>([]);

  // ส่วนไฟล์แนบ (เพิ่ม state สำหรับไฟล์เอกสาร)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // --- 3. LOGIC กรองข้อมูล (เหมือนเดิม) ---
  const availableLeads = useMemo(() => {
    if (!selectedDepartment) return [];
    return leader.filter((l) => l.department === selectedDepartment);
  }, [selectedDepartment]);

  const availableTechs = useMemo(() => {
    if (!selectedDepartment) return [];
    return user.filter((u) => u.department === selectedDepartment);
  }, [selectedDepartment]);

  // --- 4. FUNCTIONS จัดการ Event ---
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImagePreview(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setDocumentFile(event.target.files[0]);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !title ||
      !description ||
      !location ||
      !customerName ||
      !contactNumber ||
      !startDate ||
      !endDate ||
      !selectedDepartment ||
      !selectedLead ||
      selectedTechs.length === 0
    ) {
      alert("กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบทุกช่อง");
      return;
    }

    const newJobData = {
      title,
      description,
      customer: {
        name: customerName,
        phone: contactNumber,
        other: otherContact,
      },
      location,
      dates: {
        start: startDate,
        end: endDate,
      },
      assignment: {
        department: selectedDepartment,
        leadId: selectedLead.id, // ส่ง ID ไปเพื่อใช้ในระบบสิทธิ์
        techIds: selectedTechs.map((tech) => tech.id), // ส่ง Array ของ ID ไป
      },
      imageUrl: imagePreview,
      documentName: documentFile?.name,
    };

    onSubmit(newJobData);
    console.log("Job Data Submitted:", newJobData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <ScrollArea className="h-[75vh]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-y-8 lg:gap-x-12 p-1 py-4 pr-4 md:pr-6">
          {/* ==================== คอลัมน์ซ้าย: ข้อมูลหลัก ==================== */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* --- ส่วนรายละเอียดงาน --- */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold">1. รายละเอียดงาน</h3>
                <p className="text-sm text-muted-foreground">
                  กรอกข้อมูลสำคัญของงาน
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="title">ชื่องาน*</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ติดตั้งระบบ Access Control"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">รายละเอียดงาน*</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ระบุรายละเอียด, ปัญหา, หรือสิ่งที่ต้องทำ..."
                  rows={4}
                />
              </div>
            </div>
            <Separator />
            {/* --- ส่วนข้อมูลลูกค้า (ใหม่) --- */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold">2. ข้อมูลลูกค้า</h3>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="customerName">ชื่อลูกค้า*</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="คุณสมชาย ใจดี"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="contactNumber">เบอร์โทรติดต่อ*</Label>
                  <Input
                    id="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="081-234-5678"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="otherContact">ช่องทางติดต่ออื่น</Label>
                  <Input
                    id="otherContact"
                    value={otherContact}
                    onChange={(e) => setOtherContact(e.target.value)}
                    placeholder="Line ID, Email"
                  />
                </div>
              </div>
            </div>
            <Separator />
            {/* --- ส่วนสถานที่และกำหนดการ (จัดใหม่) --- */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold">3. สถานที่และกำหนดการ</h3>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="location">ที่อยู่หน้างาน*</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ระบุที่อยู่ หรือชื่อโครงการ..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label>วันเริ่มงาน*</Label>
                  <Calendar22 date={startDate} setDate={setStartDate} />
                </div>
                <div className="grid gap-3">
                  <Label>วันจบงาน*</Label>
                  <Calendar22 date={endDate} setDate={setEndDate} />
                </div>
              </div>
              <div className="w-full h-60 border rounded-lg overflow-hidden shadow-sm mt-2">
                <InteractiveMap />
              </div>
            </div>
          </div>

          {/* ==================== คอลัมน์ขวา: การมอบหมาย & ไฟล์แนบ ==================== */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* --- ส่วนการมอบหมายงาน --- */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold">4. มอบหมายทีม</h3>
                <p className="text-sm text-muted-foreground">
                  เลือกแผนกเพื่อกรองรายชื่อ
                </p>
              </div>
              <div className="grid gap-3">
                <Label>แผนก*</Label>
                <Select
                  value={selectedDepartment}
                  onValueChange={(value) => {
                    setSelectedDepartment(value);
                    setSelectedLead(null);
                    setSelectedTechs([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกแผนกของงาน..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allDepartments.map((dep) => (
                      <SelectItem key={dep} value={dep}>
                        {dep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label>หัวหน้างาน*</Label>
                <TeamLeadSelector
                  leaders={availableLeads}
                  onSelectLead={setSelectedLead}
                  selectedLead={selectedLead}
                  disabled={!selectedDepartment}
                />
              </div>
              <div className="grid gap-3">
                <Label>ทีมช่าง*</Label>
                <MultiSelectTechnician
                  technicians={availableTechs}
                  onSelectionChange={setSelectedTechs}
                  selectedTechs={selectedTechs}
                  disabled={!selectedDepartment}
                />
              </div>
            </div>
            <Separator />
            {/* --- ส่วนไฟล์แนบ (อัปเดตใหม่) --- */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold">5. ไฟล์แนบ</h3>
              </div>
              <div className="grid gap-3">
                <Label>รูปภาพหน้างาน</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted/50 flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <FaImage className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Input
                      id="picture"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="picture"
                      className="cursor-pointer font-medium text-sm text-primary hover:underline"
                    >
                      อัปโหลดรูปภาพ
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF
                    </p>
                  </div>
                </div>
              </div>
              {/* --- ส่วนแนบไฟล์เพิ่มเติม (ใหม่) --- */}
              <div className="grid gap-3">
                <Label>แนบไฟล์เพิ่มเติม</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted/50 flex-shrink-0">
                    <FaFileAlt className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <Input
                      id="document"
                      type="file"
                      onChange={handleDocumentChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="document"
                      className="cursor-pointer font-medium text-sm text-primary hover:underline"
                    >
                      อัปโหลดไฟล์
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOCX, XLSX
                    </p>
                    {documentFile && (
                      <p className="text-sm font-medium mt-2">
                        {documentFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-4 border-t mt-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            ยกเลิก
          </Button>
        </DialogClose>
        <Button type="submit">สร้างใบงาน</Button>
      </DialogFooter>
    </form>
  );
}
