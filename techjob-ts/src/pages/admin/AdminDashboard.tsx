"use client"
import { Button } from "@/components/ui/button"
import React, { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppWindowIcon, CodeIcon } from "lucide-react"

import {
    Card,
    CardAction,
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

export default function AdminDashboard() {
    const [position, setPosition] = React.useState("bottom")
    return (
        <div className="bg-background">
            <div className="flex-1 p-8 bg-background">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        ข้อมูลภาพรวม
                    </h2>

                    <button className="bg-[#5F5AFF] px-4 py-2 rounded-lg hover:bg-[#4b48c7] transition-colorsdark:bg-[#4b48c7] dark:hover:bg-[#5F5AFF] text-white ">
                        + CREATE JOB
                    </button>
                </div>

                <div className="bg-card border border-border rounded-xl h-[600px] p-6">
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="border border-border rounded-lg flex  justify-between p-5 text-muted-foreground ">
                            <p>งานใหม่</p>
                            <p>กำลังดำเนินงาน</p>
                            <p>เสร็จสิ้น</p>
                        </div>
                        <div className="border border-border rounded-lg flex items-center justify-between text-muted-foreground">
                            <p className="mx-auto">ออนไลน์</p>
                            <p className="mx-auto">อยู่ในระหว่างการทำงาน</p>
                        </div>
                        <div className="border border-border rounded-lg flex items-center justify-center text-muted-foreground">
                            <p>วัสดุที่เพิ่มเข้ามา</p>
                            <p>วัสดุที่ใกล้หมด</p>
                        </div>
                        <div className="border border-border rounded-lg flex items-center justify-center text-muted-foreground">
                            ช่องที่ 4
                        </div>
                    </div>
                </div>

                <div className="border border-border flex  p-6">
                    <Tabs>
                        <TabsList>
                            <TabsTrigger value="newjob">ใบงานใหม่</TabsTrigger>
                            <TabsTrigger value="prosate">กำลังดำเนินงาน</TabsTrigger>
                            <TabsTrigger value="finish">เสร็จ</TabsTrigger>
                        </TabsList>
                        <TabsContent value="newjob">
                            <div className=" grid grid-cols-3 gap-3">
                                <Card>
                                    {/* ส่วนหัว: ใส่ชื่องานและชื่อหัวหน้า */}
                                    <CardHeader>
                                        <CardTitle>ชื่องานเชื่อมต่อท่อระบายน้ำคอนโด SPU</CardTitle>
                                        <CardDescription>หัวหน้างาน: คุณสมศักดิ์</CardDescription>
                                    </CardHeader>

                                    {/* ส่วนเนื้อหา: ใส่รูป, จำนวนคน, และรายละเอียด */}
                                    <CardContent>
                                        {/* รูปภาพ (ใช้ URL placeholder ไปก่อน) */}
                                        <img
                                            src="https://earthcraftvirginia.org/wp-content/uploads/2022/08/CCCon_0.jpg"
                                            alt="ภาพหน้างาน"
                                            className="w-full rounded-md mb-4" // ใส่ w-full ให้เต็ม, rounded-md ให้ขอบมน, mb-4 เว้นระยะล่าง
                                        />

                                        {/* จำนวนสมาชิก */}
                                        <p className="font-semibold">จำนวนสมาชิก: 5 คน</p>

                                        {/* รายละเอียดงาน (เอาแค่ย่อหน้าเดียวสั้นๆ) */}
                                        <p className="text-sm text-slate-600 mt-2">
                                            นี่คือส่วนของรายละเอียดงานแบบย่อๆ เพื่อให้ผู้ใช้งานเห็นภาพรวมของงาน
                                            ก่อนที่จะกดเข้าไปอ่านเพิ่มเติม...
                                        </p>
                                    </CardContent>

                                    {/* ส่วนท้าย: ใส่ปุ่ม */}
                                    <CardFooter>
                                        <Button>อ่านรายละเอียดเพิ่มเติม</Button>
                                    </CardFooter>

                                </Card>
                                <Card>
                                    {/* ส่วนหัว: ใส่ชื่องานและชื่อหัวหน้า */}
                                    <CardHeader>
                                        <CardTitle>ชื่องานเชื่อมต่อท่อระบายน้ำคอนโด SPU</CardTitle>
                                        <CardDescription>หัวหน้างาน: คุณสมศักดิ์</CardDescription>
                                    </CardHeader>

                                    {/* ส่วนเนื้อหา: ใส่รูป, จำนวนคน, และรายละเอียด */}
                                    <CardContent>
                                        {/* รูปภาพ (ใช้ URL placeholder ไปก่อน) */}
                                        <div className="relative w-full h-48 overflow-hidden rounded-md mb-4">
                                            <img
                                                src="https://earthcraftvirginia.org/wp-content/uploads/2022/08/CCCon_0.jpg"
                                                alt="ภาพหน้างาน"
                                                className="absolute top-0 left-0 w-full h-full object-cover" // ใส่ w-full ให้เต็ม, rounded-md ให้ขอบมน, mb-4 เว้นระยะล่าง
                                            />
                                        </div>

                                        {/* จำนวนสมาชิก */}
                                        <p className="font-semibold">จำนวนสมาชิก: 5 คน</p>

                                        {/* รายละเอียดงาน (เอาแค่ย่อหน้าเดียวสั้นๆ) */}
                                        <p className="text-sm text-slate-600 mt-2">
                                            นี่คือส่วนของรายละเอียดงานแบบย่อๆ เพื่อให้ผู้ใช้งานเห็นภาพรวมของงาน
                                            ก่อนที่จะกดเข้าไปอ่านเพิ่มเติม...
                                        </p>
                                    </CardContent>

                                    {/* ส่วนท้าย: ใส่ปุ่ม */}
                                    <CardFooter>
                                        <Button>อ่านรายละเอียดเพิ่มเติม</Button>
                                    </CardFooter>

                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="prosate">
                            <div>
                                <Card className="w-[350px]">
                                    {" "}
                                    {/* สามารถปรับความกว้างได้ตามต้องการ */}
                                    {/* <CardHeader> คือส่วนหัวของการ์ด */}
                                    <CardHeader>
                                        {/* <CardTitle> ใช้สำหรับแสดง "ชื่องาน" */}
                                        <CardTitle>ชื่องาน: Frontend Developer</CardTitle>
                                        {/* <CardDescription> ใช้สำหรับแสดง "ชื่อหัวหน้างาน" */}
                                        <CardDescription>หัวหน้างาน: สมชาย ใจดี</CardDescription>
                                    </CardHeader>
                                    {/* <CardContent> คือส่วนเนื้อหาหลักของการ์ด */}
                                    <CardContent>
                                        {/* แสดง "รูปภาพงาน" */}
                                        <img
                                            src="https://i.redd.it/p196q3meb2s61.jpg" // URL ของรูปภาพตัวอย่าง
                                            alt="Job Image" // คำอธิบายรูปภาพ
                                            className="rounded-md mb-4" // จัดสไตล์ให้รูปภาพมีความโค้งมนและมีระยะห่างด้านล่าง
                                        />
                                        {/* แสดง "รายละเอียดงาน" แบบย่อ */}
                                        <p className="text-sm text-muted-foreground truncate">
                                            รายละเอียดงาน: พัฒนาและดูแลส่วนติดต่อผู้ใช้ (UI)
                                            ของเว็บไซต์และแอปพลิเคชันด้วยเทคโนโลยีล่าสุด
                                            เพื่อให้ผู้ใช้ได้รับประสบการณ์ที่ดีที่สุด
                                        </p>
                                    </CardContent>
                                    {/* <CardFooter> คือส่วนท้ายของการ์ด */}
                                    <CardFooter>
                                        {/* <Button> คือ "ปุ่มดูรายละเอียด" */}
                                        <Button className="w-full">ดูรายละเอียดงาน</Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="finish">
                            <h1>เสร็จ</h1>
                        </TabsContent>
                    </Tabs>
                </div>

            </div>
        </div>
    );
}