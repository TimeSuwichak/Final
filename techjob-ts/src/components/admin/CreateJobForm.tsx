// components/admin/CreateJobForm.tsx
"use client"

import React, { useState, useMemo } from 'react'; // <-- 1. เพิ่ม useMemo เข้ามา
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FaImage } from 'react-icons/fa';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/separator';

// --- สมมติว่า Component ทั้งสองตัวนี้ถูกสร้างขึ้นมาแล้ว และพร้อมรับ props ---
import TeamLeadSelector from './TeamLeadSelector'; 
import { MultiSelectTechnician } from './MultiSelectTechnician';
import InteractiveMap from '../common/InteractiveMap';

// ==========================================================
// 2. นำเข้าข้อมูล Mock Data
// ==========================================================
import { leader } from '@/Data/leader'; // (ปรับ path ให้ตรงกับที่เก็บไฟล์)
import {user} from '@/Data/user'; // (ปรับ path ให้ตรงกับที่เก็บไฟล์)
// 3. เตรียมข้อมูลสำหรับ Dropdown (ทำนอก Component เพื่อประสิทธิภาพ)
const allDepartments = [...new Set(leader.map(l => l.department))];


export function CreateJobForm({ onSubmit }) {
    // ==========================================================
    // 4. เพิ่ม State สำหรับเก็บข้อมูลการเลือกแผนกและทีม
    // ==========================================================
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    // State สำหรับเก็บ "แผนก" ที่ถูกเลือก
    const [selectedDepartment, setSelectedDepartment] = useState('');
    
    // State สำหรับเก็บ "หัวหน้างาน" ที่ถูกเลือก (เป็น object)
    const [selectedLead, setSelectedLead] = useState(null);
    
    // State สำหรับเก็บ "ทีมช่าง" ที่ถูกเลือก (เป็น array)
    const [selectedTechs, setSelectedTechs] = useState([]);


    // ==========================================================
    // 5. สร้าง Logic กรองข้อมูลด้วย useMemo
    // ==========================================================
    // useMemo จะคำนวณค่าใหม่ก็ต่อเมื่อ selectedDepartment เปลี่ยนแปลงเท่านั้น
    
    // กรอง "หัวหน้างาน" ตามแผนกที่เลือก
    const availableLeads = useMemo(() => {
        if (!selectedDepartment) return []; // ถ้ายังไม่เลือกแผนก ให้ส่ง array ว่างกลับไป
        return leader.filter(l => l.department === selectedDepartment);
    }, [selectedDepartment]);

    // กรอง "ทีมช่าง" ตามแผนกที่เลือก
    const availableTechs = useMemo(() => {
        if (!selectedDepartment) return [];
        return user.filter(u => u.department === selectedDepartment);
    }, [selectedDepartment]);


    // ฟังก์ชัน handleImageChange (เหมือนเดิม)
    const handleImageChange = (event) => { /* ...โค้ดเดิม... */ };

    // ==========================================================
    // 6. อัปเดตฟังก์ชัน handleSubmit ให้สมบูรณ์
    // ==========================================================
    const handleSubmit = (event) => {
        event.preventDefault();

        // เพิ่มการตรวจสอบข้อมูลใหม่
        if (!title || !description || !location || !selectedDepartment || !selectedLead || selectedTechs.length === 0) {
            alert('กรุณากรอกข้อมูลและเลือกทีมงานให้ครบทุกช่อง');
            return; // หยุดทำงานถ้าข้อมูลไม่ครบ
        }

        const newJobData = {
            title,
            description,
            location,
            department: selectedDepartment,
            teamLead: `${selectedLead.fname} ${selectedLead.lname}`, // ใช้ชื่อจาก object ที่เลือก
            members: selectedTechs.length, // นับจำนวนช่าง
            imageUrl: imagePreview || `https://api.dicebear.com/7.x/initials/svg?seed=${title.slice(0,2)}`,
        };

        onSubmit(newJobData);
    };

    return (
        <form  onSubmit={handleSubmit}>
            <ScrollArea className="h-[75vh] ">
                {/* - ปรับ Layout หลักเป็นแบบ 2 คอลัมน์บนจอใหญ่ (lg) เพื่อความสวยงาม
                  - คอลัมน์ซ้าย (lg:col-span-3) สำหรับข้อมูลหลัก, คอลัมน์ขวา (lg:col-span-2) สำหรับทีมและไฟล์แนบ
                */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-y-8 lg:gap-x-12 p-1 py-4 pr-4 md:pr-6">

                    {/* ==================== คอลัมน์ซ้าย: รายละเอียดหลัก ==================== */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-foreground">รายละเอียดหลัก</h3>
                            <p className="text-sm text-muted-foreground">กรอกข้อมูลสำคัญของงาน เช่น ชื่องานและรายละเอียด</p>
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="title">ชื่องาน*</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น ติดตั้งระบบ Access Control อาคาร B"/>
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="description">รายละเอียดงาน*</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ระบุรายละเอียด, ปัญหา, หรือสิ่งที่ต้องทำ..." rows={5}/>
                        </div>
                        
                        <Separator className="my-2"/>

                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-foreground">สถานที่ปฏิบัติงาน</h3>
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="location">ที่อยู่หน้างาน*</Label>
                            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="ระบุที่อยู่ หรือชื่อโครงการ..."/>
                        </div>
                        <div className="w-full h-60 border rounded-lg overflow-hidden shadow-sm">
                            <InteractiveMap />
                        </div>
                    </div>

                    {/* ==================== คอลัมน์ขวา: การมอบหมาย & ไฟล์แนบ ==================== */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-foreground">มอบหมายทีม</h3>
                            <p className="text-sm text-muted-foreground">เลือกแผนกเพื่อกรองรายชื่อหัวหน้าและทีมช่าง</p>
                        </div>
                        
                        {/* 7. เพิ่ม Dropdown สำหรับเลือกแผนก */}
                        <div className="grid w-full items-center gap-1.5">
                            <Label>แผนก*</Label>
                            <Select value={selectedDepartment} onValueChange={(value) => {
                                // เมื่อเปลี่ยนแผนก ให้รีเซ็ตค่าหัวหน้าและทีมช่างที่เลือกไว้
                                setSelectedDepartment(value);
                                setSelectedLead(null);
                                setSelectedTechs([]);
                            }}>
                                <SelectTrigger><SelectValue placeholder="เลือกแผนกของงาน..." /></SelectTrigger>
                                <SelectContent>
                                    {allDepartments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label>หัวหน้างาน*</Label>
                            {/* 8. ส่งข้อมูลที่กรองแล้ว (availableLeads) และฟังก์ชัน (setSelectedLead) เข้าไป */}
                            <TeamLeadSelector 
                                leaders={availableLeads}
                                onSelectLead={setSelectedLead}
                                selectedLead={selectedLead}
                                disabled={!selectedDepartment} // ปิดการใช้งานจนกว่าจะเลือกแผนก
                            />
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label>ทีมช่าง*</Label>
                            {/* 9. ส่งข้อมูลที่กรองแล้ว (availableTechs) และฟังก์ชัน (setSelectedTechs) เข้าไป */}
                            <MultiSelectTechnician 
                                technicians={availableTechs}
                                onSelectionChange={setSelectedTechs}
                                selectedTechs={selectedTechs}
                                disabled={!selectedDepartment} // ปิดการใช้งานจนกว่าจะเลือกแผนก
                            />
                        </div>
                        
                        <Separator className="my-2"/>

                        <div className="space-y-2">
                           <h3 className="text-base font-semibold text-foreground">ไฟล์แนบ</h3>
                        </div>
                        
                        <div className="grid w-full gap-1.5">
                            <Label>รูปภาพหน้างาน</Label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted/50 flex-shrink-0">
                                    {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" /> : <FaImage className="h-8 w-8 text-muted-foreground" />}
                                </div>
                                <div>
                                    <Input id="picture" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    <Label htmlFor="picture" className="cursor-pointer font-medium text-sm text-primary hover:underline">อัปโหลดรูปภาพ</Label>
                                    <p className="text-xs text-muted-foreground mt-1">ขนาดแนะนำ 800x600px</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
            
            <DialogFooter className="pt-4 border-t mt-2">
                <DialogClose asChild>
                    <Button type="button" variant="outline">ยกเลิก</Button>
                </DialogClose>
                <Button type="submit">สร้างใบงาน</Button>
            </DialogFooter>
        </form>
    );
}

// **ข้อควรจำ:** คุณต้องไปอัปเดต Component `TeamLeadSelector` และ `MultiSelectTechnician` 
// ให้รับ props ใหม่ (เช่น leaders, technicians, onSelectLead) เพื่อให้โค้ดนี้ทำงานได้สมบูรณ์นะครับ