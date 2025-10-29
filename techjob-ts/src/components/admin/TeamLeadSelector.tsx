// components/admin/TeamLeadSelector.tsx
"use client"

// 'React' default import not needed with the current JSX transform
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// 1. รับ props เข้ามา:
//    - leaders: Array ของ object หัวหน้างานที่กรองแล้วตามแผนก
//    - onSelectLead: ฟังก์ชันจากแม่ (CreateJobForm) ที่จะถูกเรียกเมื่อมีการเลือก
//    - selectedLead: object ของหัวหน้างานที่ถูกเลือกอยู่ (ถ้ามี)
//    - disabled: boolean บอกว่าให้ปิดการใช้งานหรือไม่
const TeamLeadSelector = ({ leaders = [], onSelectLead, selectedLead, disabled }: { leaders?: any[]; onSelectLead?: (lead: any | null) => void; selectedLead?: any | null; disabled?: boolean }) => {
    
    // 2. ฟังก์ชันเมื่อมีการเปลี่ยนแปลงค่าใน Select
    const handleValueChange = (leaderId: string) => {
        // หา object ของ leader ทั้งหมดจาก id ที่ได้รับมา
        const leadObject = leaders.find(l => l.id.toString() === leaderId);
        // เรียกใช้ฟังก์ชัน onSelectLead ที่ส่งมาจากแม่ พร้อมส่ง object กลับไป
        onSelectLead && onSelectLead(leadObject || null);
    };

    return (
        <div>
            <Select
                // 3. กำหนดค่า value ให้ตรงกับ id ของหัวหน้าที่เลือกอยู่ (ถ้ามี)
                value={selectedLead ? selectedLead.id.toString() : ""}
                onValueChange={handleValueChange}
                disabled={disabled} // 4. ใช้ prop disabled ที่รับมา
            >
                <SelectTrigger className="w-full"> {/* ปรับให้เต็มความกว้าง */}
                    {/* 5. แสดงชื่อหัวหน้าที่เลือก หรือข้อความ placeholder */}
                    <SelectValue placeholder="เลือกหัวหน้างาน..." />
                </SelectTrigger>
                <SelectContent>
                    {/* 6. วนลูปสร้าง SelectItem จาก array 'leaders' ที่รับมา */}
                    {leaders.map((lead) => (
                        // ใช้ id เป็น value และแสดง ชื่อ-นามสกุล
                        <SelectItem key={lead.id} value={lead.id.toString()}>
                            {lead.fname} {lead.lname}
                        </SelectItem>
                    ))}
                    {/* แสดงข้อความเมื่อไม่มีข้อมูล */}
                    {leaders.length === 0 && !disabled && (
                         <SelectItem value="no-options" disabled>
                           ไม่มีหัวหน้างานในแผนกนี้
                         </SelectItem>
                    )}
                     {disabled && (
                         <SelectItem value="select-dept" disabled>
                           กรุณาเลือกแผนกก่อน
                         </SelectItem>
                     )}
                </SelectContent>
            </Select>
        </div>
    )
}

export default TeamLeadSelector