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

// (mock data เหมือนเดิม)
const thaiNames = [
  "สมชาย", "สมหญิง", "กิตติ", "พิมพ์", "อนันต์", "อรพิน", "จักริน", "ธนิดา", "ประยูร", "รัตนา",
  "ชัยวัฒน์", "พรทิพย์", "สิริพร", "มานพ", "สายใจ", "ธีรศักดิ์", "จันทร์เพ็ญ", "นพดล", "ขวัญใจ", "บุญมี",
  "รัชนี", "อดิศักดิ์", "ดารารัตน์", "วีระ", "สุนีย์", "วรพล", "เกศินี", "บุญส่ง", "อารีย์", "พิชิต",
  "พัชรี", "วิทยา", "นฤมล", "จิรศักดิ์", "มัลลิกา", "วุฒิชัย", "สุพัตรา", "ณรงค์", "อัญชัน", "จิตรา",
  "เสาวนีย์", "ภานุ", "ปวีณา", "กาญจนา", "เอกชัย"
]

const positions = ["ช่าง", "แอดมิน", "หัวหน้าช่าง", "ผู้บริหาร"]
const types = ["ไฟฟ้า", "เครื่องกล", "โยธา"]

const userInfo = Array.from({ length: 45 }).map((_, i) => {
  const name = thaiNames[i % thaiNames.length]
  const position =
    i < 3 ? "ผู้บริหาร" : positions[Math.floor(Math.random() * (positions.length - 1))]
  const type = types[i % types.length]
  const email = `${name.toLowerCase().replace(/\s/g, "")}${i + 1}@teachjob.com`
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

  // popup edit
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const pageSize = 10

  const filteredData = useMemo(() => {
    return userInfo.filter((item) => {
      const matchQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase())
      const matchType = filterType === "ทั้งหมด" || item.type === filterType
      const matchPosition = filterPosition === "ทั้งหมด" || item.position === filterPosition
      return matchQuery && matchType && matchPosition
    })
  }, [query, filterType, filterPosition])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const startIndex = (page - 1) * pageSize
  const pagedData = filteredData.slice(startIndex, startIndex + pageSize)

  return (
    <div className="w-full space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-2 items-center">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <div className="relative w-full ml-10">
            <Search className="absolute left-2 top-2.5 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ค้นหาชื่อหรืออีเมล..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="pl-8 "
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

      {/* Container ของข้อมูล: มี overflow-x-auto ป้องกัน table เกินจอ */}
      <div className="rounded-xl border shadow-sm overflow-hidden">
        <div className="p-2 md:p-0">
          {/* --- Mobile: Card / List view --- */}
          <div className="flex flex-col gap-3 md:hidden p-1">
            {pagedData.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img src={item.urlImage} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{item.email}</div>
                    <div className="text-xs mt-1 flex gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs border">{item.position}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs border">{item.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="p-1">
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
                      <DropdownMenuItem className="text-destructive" onClick={() => alert(`ลบ ${item.name}`)}>
                        ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {pagedData.length === 0 && (
              <div className="text-center text-muted-foreground py-6">ไม่พบข้อมูล</div>
            )}
          </div>

          {/* --- Desktop/Tablet: Table view --- */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[250px]">ชื่อ</TableHead>
                  <TableHead className="min-w-[220px]">อีเมล</TableHead>
                  <TableHead className="hidden md:table-cell w-[140px]">ตำแหน่ง</TableHead>
                  <TableHead className="hidden md:table-cell w-[120px]">ประเภท</TableHead>
                  <TableHead className="text-right w-[60px]">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pagedData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={item.urlImage} className="w-8 h-8 rounded-full object-cover" alt={item.name} />
                        <div className="min-w-0">
                          <div className="font-medium">{item.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <div className="truncate max-w-[300px]">{item.email}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.position}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.type}</TableCell>
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
                          <DropdownMenuItem className="text-destructive" onClick={() => alert(`ลบ ${item.name}`)}>
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
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center gap-2">
        {/* Mobile compact pagination */}
        <div className="w-full md:hidden flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            หน้า {page} / {totalPages} — {filteredData.length} รายการ
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ก่อนหน้า
            </Button>
            <Button
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ต่อไป
            </Button>
          </div>
        </div>

        {/* Desktop full pagination */}
        <div className="hidden md:block ml-auto">
          <PaginationDemo page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>

      {/* Popup แก้ไข */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
          </DialogHeader>

          <div className="py-6 text-center text-muted-foreground">
            (ยังไม่มีข้อมูลใน popup — จะเพิ่มฟอร์มแก้ไขภายหลัง)
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Pagination Component (unchanged แต่ responsive บางส่วนถูกจัดไว้ข้างบน)
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

  // จำกัดการแสดงหน้าใน desktop (เช่น แสดง 1..n) - คุณอาจปรับ logic ถ้าต้องการ
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={() => setPage(Math.max(1, page - 1))} />
        </PaginationItem>

        {/* แสดงลิงก์หน้า (hide บนมือถือ ด้วย class ภายนอก) */}
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
