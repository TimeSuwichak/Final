export default function AdminDashboard() {
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

                <div className="border border-border flex justify-between p-6">
                    <div className="text-foreground border border-border">งานใหม่</div>
                    <div className="text-foreground border border-border">กำลังดำเนินการ</div>
                    <div className="text-foreground border border-border">เสร็จแล้ว</div>
                </div>
            </div>
        </div>
    );
}