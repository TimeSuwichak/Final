import React, { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// รายชื่อสุ่มภาษาไทย
const thaiNames = [
  "สมชาย", "สมหญิง", "กิตติ", "พิมพ์", "อนันต์", "อรพิน", "จักริน", "ธนิดา", "ประยูร", "รัตนา",
  "ชัยวัฒน์", "พรทิพย์", "สิริพร", "มานพ", "สายใจ", "ธีรศักดิ์", "จันทร์เพ็ญ", "นพดล", "ขวัญใจ", "บุญมี",
  "รัชนี", "อดิศักดิ์", "ดารารัตน์", "วีระ", "สุนีย์", "วรพล", "เกศินี", "บุญส่ง", "อารีย์", "พิชิต",
  "พัชรี", "วิทยา", "นฤมล", "จิรศักดิ์", "มัลลิกา", "วุฒิชัย", "สุพัตรา", "ณรงค์", "อัญชัน", "จิตรา",
  "เสาวนีย์", "ภานุ", "ปวีณา", "กาญจนา", "เอกชัย"
]

const positions = ["ช่าง", "แอดมิน", "หัวหน้าช่าง", "ผู้บริหาร"]
const types = ["ไฟฟ้า", "เครื่องกล", "โยธา"]

// สร้าง mock data 45 รายการ
const userInfo = Array.from({ length: 45 }).map((_, i) => {
  const name = thaiNames[i % thaiNames.length]
  const position =
    i < 3 ? "ผู้บริหาร" : positions[Math.floor(Math.random() * (positions.length - 1))]
  const type = types[i % types.length]
  const email = `${name.toLowerCase().replace(/\s/g, "")}${i + 1}@gmail.com`
  return {
    id: i + 1,
    name,
    email,
    type,
    position,
    urlImage:
      "https://img.freepik.com/free-vector/cute-watermelon-fruit-cartoon-vector-icon-illustration-fruit-summer-icon-isolated-flat-vector_138676-12807.jpg?w=740&q=80",
  }
})

export default function Datauser() {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [filterType, setFilterType] = useState("ทั้งหมด")
  const [filterPosition, setFilterPosition] = useState("ทั้งหมด")

  // ✅ state สำหรับ popup
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const pageSize = 10

  // กรองข้อมูลด้วย search, filterType และ filterPosition
  const filteredData = useMemo(() => {
    return userInfo.filter((item) => {
      const matchQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase())
      const matchType =
        filterType === "ทั้งหมด" || item.type === filterType
      const matchPosition =
        filterPosition === "ทั้งหมด" || item.position === filterPosition
      return matchQuery && matchType && matchPosition
    })
  }, [query, filterType, filterPosition])

  // pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (page - 1) * pageSize
  const pagedData = filteredData.slice(startIndex, startIndex + pageSize)

  return (
    <div className="w-full space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-2 items-center">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ค้นหาชื่อหรืออีเมล..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filterPosition}
            onValueChange={(v) => {
              setFilterPosition(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="เลือกตำแหน่ง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">เลือกตำแหน่ง (ทั้งหมด)</SelectItem>
              <SelectItem value="ช่าง">ช่าง</SelectItem>
              <SelectItem value="หัวหน้าช่าง">หัวหน้าช่าง</SelectItem>
              <SelectItem value="แอดมิน">แอดมิน</SelectItem>
              <SelectItem value="ผู้บริหาร">ผู้บริหาร</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterType}
            onValueChange={(v) => {
              setFilterType(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="เลือกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">เลือกประเภท (ทั้งหมด)</SelectItem>
              <SelectItem value="ไฟฟ้า">ไฟฟ้า</SelectItem>
              <SelectItem value="เครื่องกล">เครื่องกล</SelectItem>
              <SelectItem value="โยธา">โยธา</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[250px]">ชื่อ</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead className="text-right w-[60px]">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagedData.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={item.urlImage}
                      className="w-8 h-8 rounded-full object-cover"
                      alt={item.name}
                    />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.position}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>การทำงาน</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => alert(`ดูข้อมูลของ ${item.name}`)}>
                        ดูรายละเอียด
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(item)
                          setOpenEdit(true)
                        }}
                      >
                        แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => alert(`ลบ ${item.name}`)}
                      >
                        ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {pagedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end">
        <PaginationDemo page={page} setPage={setPage} totalPages={totalPages} />
      </div>

      {/* ✅ Popup (Modal) แก้ไข */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
          </DialogHeader>

          {/* ตอนนี้ยังว่างเปล่า */}
          <div className="py-6 text-center text-muted-foreground">
            (ยังไม่มีข้อมูลใน popup — จะเพิ่มฟอร์มแก้ไขภายหลัง)
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Pagination Component
function PaginationDemo({
  page,
  setPage,
  totalPages,
}: {
  page: number
  setPage: (page: number) => void
  totalPages: number
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={() => setPage(Math.max(1, page - 1))} />
        </PaginationItem>
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink href="#" isActive={page === p} onClick={() => setPage(p)}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        {totalPages > 5 && <PaginationEllipsis />}
        <PaginationItem>
          <PaginationNext href="#" onClick={() => setPage(Math.min(totalPages, page + 1))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
