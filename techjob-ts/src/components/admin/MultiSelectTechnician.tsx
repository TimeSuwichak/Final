// components/admin/MultiSelectTechnician.tsx
"use client"

import * as React from "react"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

// --- ข้อมูลจำลองของช่าง ---
const TECHNICIANS = [
  { id: "tech-01", name: "สมชาย ใจดี" },
  { id: "tech-02", name: "วิชัย มีสุข" },
  { id: "tech-03", name: "มานะ อดทน" },
  { id: "tech-04", name: "ปิติ ยินดี" },
  { id: "tech-05", name: "สมศักดิ์ รักสงบ" },
  { id: "tech-05", name: "หมูแดง เทคโน" },
];
// --------------------------

export function MultiSelectTechnician() {
  // State สำหรับเก็บค่าที่พิมพ์ในช่อง input
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = React.useState("")
  
  // State สำหรับเก็บ "ช่างที่ถูกเลือก" (เป็น array เพราะเลือกได้หลายอัน)
  const [selected, setSelected] = React.useState([TECHNICIANS[0]]); // เลือกสมชายเป็นค่าเริ่มต้น

  // State สำหรับควบคุมการเปิด/ปิด dropdown
  const [open, setOpen] = React.useState(false);

  // ฟังก์ชันสำหรับ "ลบ" ช่างออกจากรายการที่เลือก
  const handleUnselect = React.useCallback((technician) => {
    setSelected(prev => prev.filter(s => s.id !== technician.id))
  }, [])

  // ฟังก์ชันสำหรับ "เพิ่ม" ช่างเข้าไปในรายการที่เลือก
  const handleSelect = (technician) => {
    setInputValue("") // เคลียร์ช่องค้นหา
    setSelected(prev => [...prev, technician]) // เพิ่มช่างคนใหม่เข้าไป
  }

  return (
    <Command onKeyDown={(e) => {
        // จัดการการกด backspace เพื่อลบ tag ล่าสุด
        if (e.key === "Backspace" && inputValue === "") {
            setSelected(prev => prev.slice(0, -1))
        }
    }} className="overflow-visible bg-transparent">

      {/* ส่วน Input ที่แสดง Tag */}
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((technician) => {
            return (
              <Badge key={technician.id} variant="secondary">
                {technician.name}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(technician);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(technician)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          {/* Input จริงๆ ที่ใช้พิมพ์ค้นหา */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder="เลือกช่าง..."
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* ส่วน Dropdown ที่แสดงตัวเลือก */}
      <div className="relative mt-2">
        {open && selected.length < TECHNICIANS.length ? (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandGroup heading="รายชื่อช่าง">
                {TECHNICIANS.filter(tech => !selected.some(s => s.id === tech.id)).map((technician) => (
                  <CommandItem
                    key={technician.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => handleSelect(technician)}
                    className={"cursor-pointer"}
                  >
                    {technician.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  )
}