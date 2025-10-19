import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const TeamLeadSelector = () => {
    return (
        <div>
            <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="ยังไม่เลือกหัวหน้างาน" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light">คุณเอตลอด ปัดเอฟ</SelectItem>
                    <SelectItem value="dark">คุณเจริญพร ฮับบดิน</SelectItem>
                    <SelectItem value="system">คุณเกาหลี ไมตรีเกาเหลา</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}

export default TeamLeadSelector