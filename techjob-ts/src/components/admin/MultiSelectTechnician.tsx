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

// 1. รับ props เข้ามา:
//    - technicians: Array ของ object ช่างที่กรองแล้ว
//    - onSelectionChange: ฟังก์ชันจากแม่ ที่จะถูกเรียกเมื่อมีการ เพิ่ม/ลบ ช่าง
//    - selectedTechs: Array ของช่างที่ถูกเลือกอยู่
//    - disabled: boolean
export function MultiSelectTechnician({ technicians = [], onSelectionChange, selectedTechs = [], disabled }: { technicians?: any[]; onSelectionChange?: React.Dispatch<React.SetStateAction<any[]>> | ((s: any[]) => void); selectedTechs?: any[]; disabled?: boolean }) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [inputValue, setInputValue] = React.useState("")
    const [open, setOpen] = React.useState(false);

    // 2. ไม่ใช้ State ภายในสำหรับเก็บค่าที่เลือกแล้ว แต่จะใช้ prop 'selectedTechs' แทน

    // 3. ฟังก์ชันสำหรับ "ลบ" ช่าง (เรียก onSelectionChange)
    const handleUnselect = React.useCallback((technician: any) => {
        // สร้าง array ใหม่โดยกรองเอาคนที่ต้องการลบออก
        const newSelection = selectedTechs.filter(s => s.id !== technician.id);
        // เรียกฟังก์ชันจากแม่เพื่ออัปเดต State หลัก
        onSelectionChange && onSelectionChange(newSelection);
    }, [selectedTechs, onSelectionChange]) // Dependency array

    // 4. ฟังก์ชันสำหรับ "เพิ่ม" ช่าง (เรียก onSelectionChange)
    const handleSelect = (technician: any) => {
        setInputValue("") // เคลียร์ช่องค้นหา
        // สร้าง array ใหม่โดยเพิ่มคนใหม่เข้าไป
        const newSelection = [...selectedTechs, technician];
        // เรียกฟังก์ชันจากแม่เพื่ออัปเดต State หลัก
        onSelectionChange && onSelectionChange(newSelection);
    }

    // 5. จัดการการกด Backspace (เรียก onSelectionChange)
    const handleKeyDown = React.useCallback((e: any) => {
            if (e.key === "Backspace" && inputValue === "") {
            // สร้าง array ใหม่โดยลบตัวสุดท้ายออก
            const newSelection = selectedTechs.slice(0, -1);
            // เรียกฟังก์ชันจากแม่เพื่ออัปเดต State หลัก
            onSelectionChange && onSelectionChange(newSelection);
        }
    }, [inputValue, selectedTechs, onSelectionChange]); // Dependency array

    // 6. ใช้ prop 'technicians' แทน TECHNICIANS เดิม
    const availableOptions = technicians.filter(tech => !selectedTechs.some(s => s.id === tech.id));

    return (
        // 7. เพิ่มเงื่อนไข disabled ให้กับ Command และ Input
        <Command onKeyDown={!disabled ? handleKeyDown : undefined} className="overflow-visible bg-transparent">
            <div className={`group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${disabled ? 'bg-muted opacity-50 cursor-not-allowed' : ''}`}>
                <div className="flex flex-wrap gap-1">
                    {/* 8. วนลูปจาก prop 'selectedTechs' */}
                    {selectedTechs.map((technician) => {
                        return (
                            <Badge key={technician.id} variant="secondary">
                                {technician.fname} {technician.lname} {/* แสดงชื่อเต็ม */}
                                <button
                                    type="button" // Important for forms
                                    disabled={disabled} // ปิดปุ่มลบด้วย
                                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                                    onClick={() => handleUnselect(technician)}
                                    // Add mouse down prevention to keep focus
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        )
                    })}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder={disabled ? "กรุณาเลือกแผนกก่อน" : "เลือกทีมช่าง..."}
                        disabled={disabled} // ปิด input ด้วย
                        className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                    />
                </div>
            </div>
            <div className="relative mt-2">
                {/* 9. ใช้ availableOptions ที่กรองแล้ว */}
                {open && !disabled && availableOptions.length > 0 ? (
                    <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <CommandList>
                            <CommandGroup heading="รายชื่อช่างในแผนก">
                                {availableOptions.map((technician) => (
                                    <CommandItem
                                        key={technician.id}
                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        onSelect={() => handleSelect(technician)}
                                        className={"cursor-pointer"}
                                    >
                                        {technician.fname} {technician.lname} {/* แสดงชื่อเต็ม */}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                ) : null}
                 {open && !disabled && availableOptions.length === 0 && selectedTechs.length < technicians.length && (
                    <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in p-2 text-sm text-muted-foreground">
                        ไม่พบช่างที่ตรงกับคำค้นหา หรือ เลือกครบแล้ว
                    </div>
                 )}
            </div>
        </Command>
    )
}