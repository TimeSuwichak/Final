// components/CreateJobForm.tsx
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // สำหรับรายละเอียดงาน
import {
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { FaImage } from 'react-icons/fa';
import TeamLeadSelector from './TeamLeadSelector';


import { MultiSelectTechnician } from './MultiSelectTechnician';


// นี่คือ Component ลูก ที่จะรับฟังก์ชัน onSubmit มาจากแม่ (AdminDashboard)
export function CreateJobForm({ onSubmit }) {
    // สร้าง State สำหรับเก็บค่าในแต่ละช่องของฟอร์ม
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [imagePreview, setImagePreview] = useState(null); // State สำหรับเก็บ URL รูปภาพตัวอย่าง

    // ฟังก์ชันที่จะทำงานเมื่อมีการเลือกไฟล์รูปภาพ
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // 1. สร้างเครื่องมือ FileReader ขึ้นมา
            const reader = new FileReader();

            // 2. สั่งให้ reader เริ่มอ่านไฟล์และแปลงเป็น Base64
            reader.readAsDataURL(file);

            // 3. ตั้งค่าว่า "เมื่อไหร่ที่แปลงไฟล์เสร็จเรียบร้อย" ให้ทำอะไรต่อ
            reader.onloadend = () => {
                // reader.result จะมีค่าเป็นข้อความ Base64 (เช่น "data:image/jpeg;base64,...")
                // เราเอามันไปเก็บใน State เพื่อแสดงตัวอย่าง
                setImagePreview(reader.result as string);
            };
        }
    };

    // ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม "บันทึก"
    const handleSubmit = (event) => {
        event.preventDefault(); // ป้องกันหน้าเว็บรีโหลด

        // ตรวจสอบง่ายๆ ว่ากรอกข้อมูลครบหรือไม่
        if (!title || !description || !location) {
            alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }

        // สร้าง Object ข้อมูลงานใหม่
        const newJobData = {
            title: title,
            description: description,
            location: location,
            // ค่าจำลองอื่นๆ ที่ต้องมีใน Card
            teamLead: 'คุณธนพล (คนใหม่)',
            members: 1,
            // ถ้ามีรูปตัวอย่าง ให้ใช้รูปนั้น, ถ้าไม่มี ให้ใช้รูป placeholder
            imageUrl: imagePreview || 'https://images.unsplash.com/photo-1581092448348-adf49b936d32?w=500&q=80',
        };

        // เรียกใช้ฟังก์ชัน onSubmit ที่ได้รับมาจากแม่ พร้อมส่งข้อมูลใหม่กลับไป
        onSubmit(newJobData);
    };

    return (
        // <form> คือแท็กมาตรฐานสำหรับฟอร์ม
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                {/* ช่องกรอก "ชื่องาน" */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                        ชื่องาน
                    </Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} // ทุกครั้งที่พิมพ์ จะอัปเดต State `title`
                        className="col-span-3"
                        placeholder="เช่น ติดตั้งแอร์ห้องนอนใหญ่"
                    />
                </div>

                {/* ช่องกรอก "รายละเอียดงาน" */}
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                        รายละเอียด
                    </Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="col-span-3"
                        placeholder="บอกรายละเอียดของงานที่ต้องทำ"
                        rows={4}
                    />
                </div>

                <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor="location" className="text-right">
                        สถานที่
                    </Label>
                    <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="col-span-3"
                        placeholder="เช่น 123/45 คอนโด The Base"
                    />

                </div>

                {/* ช่องเลือกหัวเลือกช่าง" */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                        เลือกหัวหน้างาน
                    </Label>
                    <TeamLeadSelector />
                </div>
                {/* ช่องเลือกช่าง */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                        เลือกหัวหน้างาน
                    </Label>
                    <MultiSelectTechnician />
                </div>

                {/* ส่วนอัปโหลดรูปภาพ */}
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="picture" className="text-right pt-2">
                        รูปภาพหน้างาน
                    </Label>
                    <div className="col-span-3 flex items-center gap-4">
                        {/* กล่องแสดงรูปตัวอย่าง */}
                        <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted/50">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                            ) : (
                                <FaImage className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                        {/* Input สำหรับเลือกไฟล์ (เราซ่อนมันไว้ แล้วใช้ Label แทน) */}
                        <Input id="picture" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        <Label htmlFor="picture" className="cursor-pointer text-sm text-primary hover:underline">
                            เลือกรูปภาพ
                        </Label>
                    </div>
                </div>
            </div>

            {/* ปุ่ม บันทึก และ ยกเลิก */}
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        ยกเลิก
                    </Button>
                </DialogClose>
                <Button type="submit">บันทึกใบงาน</Button>
            </DialogFooter>
        </form>
    );
}