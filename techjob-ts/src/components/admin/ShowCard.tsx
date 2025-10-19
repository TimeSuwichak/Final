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



import { Button } from "@/components/ui/button";

const ShowCard = ({ jobs }) => {
    return (
        <div >
            <div className="border border-border flex  mt-10">
                <Tabs>
                    <TabsList>
                        <TabsTrigger value="newjob">ใบงานใหม่</TabsTrigger>
                        <TabsTrigger value="prosate">กำลังดำเนินงาน</TabsTrigger>
                        <TabsTrigger value="finish">เสร็จ</TabsTrigger>
                    </TabsList>
                    <TabsContent value="newjob" className="mt-4">
                        {/* ▼▼▼ แก้ไข: วนลูปแสดง Card จาก State ที่เราสร้างขึ้น ▼▼▼ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* ใช้ .map() เพื่อวน loop ข้อมูลใน jobs state แล้วสร้าง Card ออกมา */}
                            {jobs.map((job) => (
                                <Card key={job.id}>
                                    <CardHeader>
                                        <CardTitle>{job.title}</CardTitle>
                                        <CardDescription>หัวหน้างาน: {job.teamLead}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {/* ใช้เทคนิคเดิมในการล็อคขนาดรูปภาพ */}
                                        <div className="relative w-full h-40 overflow-hidden rounded-md mb-4">
                                            <img
                                                src={job.imageUrl}
                                                alt={`ภาพงาน ${job.title}`}
                                                className="absolute w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="font-semibold">จำนวนสมาชิก: {job.members} คน</p>
                                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                                            {job.description}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full">อ่านรายละเอียดเพิ่มเติม</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="prosate">
                        <div>
                            <Card className="w-[350px]">

                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="finish">
                        <Card>

                        </Card>
                    </TabsContent>
                </Tabs>
            </div >
        </div>
    )
}

export default ShowCard