// src/components/leader/TechSelectMultiDept.tsx (ฉบับอัปเกรดล่าสุด)
"use client";

import React, { useState, useMemo, useRef } from 'react';

import { useJobs } from '@/contexts/JobContext';
import { isDateRangeOverlapping } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

// (Import ข้อมูลช่างและพจนานุกรมแผนก)
import { user as ALL_USERS } from '@/data/user';
import { departments } from '@/data/departments'; // <-- ไฟล์ใหม่ที่เราเพิ่งสร้าง

interface TechSelectProps {
  jobStartDate: Date;
  jobEndDate: Date;
  selectedTechIds: string[];
  onTechsChange: (newTechIds: string[]) => void;
}

export function TechSelectMultiDept({
  jobStartDate,
  jobEndDate,
  selectedTechIds,
  onTechsChange
}: TechSelectProps) {
  
  const { jobs: allJobs } = useJobs();
  const inputRef = useRef<HTMLInputElement>(null);

  // --- State ภายใน Component ---
  const [selectedDept, setSelectedDept] = useState<string>(""); 
  const [positionFilter, setPositionFilter] = useState("all"); 
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // --- "สมอง" 1: ค้นหาช่างที่ "ว่าง" ใน "แผนกที่เลือก" ---
  const availableTechsInDept = useMemo(() => {
    if (!selectedDept) return []; 

    const overlappingJobs = allJobs.filter(job =>
      job.id !== "TEMP" &&
      isDateRangeOverlapping(jobStartDate, jobEndDate, job.startDate, job.endDate)
    );

    const busyTechIds = new Set<string>();
    overlappingJobs.forEach(job => {
      job.assignedTechs.forEach(techId => busyTechIds.add(techId));
    });

    return ALL_USERS.filter(user => {
      const inDept = user.department === selectedDept;
      const isFree = !busyTechIds.has(user.id);
      return inDept && isFree;
    });
  }, [selectedDept, jobStartDate, jobEndDate, allJobs]);

  // --- "สมอง" 2: (อัปเกรด!) อ่าน "รายชื่อตำแหน่ง" จาก "พจนานุกรม" ---
  const positionsInDept = useMemo(() => {
    if (!selectedDept) return [];
    // 1. หาแผนกที่เลือกใน "พจนานุกรม"
    const deptData = departments.find(d => d.id === selectedDept);
    // 2. ดึง "รายชื่อตำแหน่ง" ของแผนกนั้นออกมา
    return ["all", ...(deptData?.positions || [])];
  }, [selectedDept]); // <-- ทำงานเมื่อ `selectedDept` เปลี่ยน

  // --- "สมอง" 3: ดึง "Object" ของช่างที่ถูกเลือก (สำหรับแสดง Badge) ---
  const selectedTechObjects = useMemo(() => {
    return ALL_USERS.filter(user => selectedTechIds.includes(user.id));
  }, [selectedTechIds]);

// --- "สมอง" 4: (อัปเกรด!) กรองและ "เรียงลำดับ" Dropdown ---
  const dropdownOptions = useMemo(() => {
    // 1. กรองจาก "ช่างที่ว่างในแผนก"
    const filteredTechs = availableTechsInDept.filter(tech =>
      // 2. ต้องยังไม่ถูกเลือก
      !selectedTechIds.includes(tech.id) &&
      // 3. ต้องตรงกับ "ฟิลเตอร์ตำแหน่ง"
      (positionFilter === "all" || tech.position === positionFilter)
    );

    // ▼▼▼ (แก้ไข!) 4. เรียงลำดับ "น้อยไปมาก" (ตามที่คุณต้องการ) ▼▼▼
    return filteredTechs.sort((a, b) => 
      (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0)
    );

  }, [availableTechsInDept, selectedTechIds, positionFilter]);

  // --- Handlers (อัปเกรด) ---
  const handleDeptChange = (deptId: string) => {
    setSelectedDept(deptId);
    setPositionFilter("all"); 
    setInputValue("");
  };

  const handleSelect = (tech: any) => {
    onTechsChange([...selectedTechIds, tech.id]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleUnselect = (techId: string) => {
    onTechsChange(selectedTechIds.filter(id => id !== techId));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && inputValue === "" && selectedTechIds.length > 0) {
      handleUnselect(selectedTechIds[selectedTechIds.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      {/* --- 1. ตัวเลือกแผนก --- */}
      <Label>1. เลือกแผนก</Label>
      <Select value={selectedDept} onValueChange={handleDeptChange}>
        <SelectTrigger><SelectValue placeholder="เลือกแผนก..." /></SelectTrigger>
        <SelectContent>
          {departments.map(dep => (
            <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* --- 2. ตัวกรองตำแหน่ง --- */}
      <Label>2. กรองตามตำแหน่ง (ในแผนกนี้)</Label>
      <Select 
        value={positionFilter} 
        onValueChange={setPositionFilter} 
        disabled={!selectedDept} 
      >
        <SelectTrigger className="w-full h-9 text-xs">
          <SelectValue placeholder="กรองตามตำแหน่ง..." />
        </SelectTrigger>
        <SelectContent>
          {positionsInDept.map(pos => (
            <SelectItem key={pos} value={pos} className="text-xs">
              {pos === "all" ? "ตำแหน่งทั้งหมด" : pos}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* --- 3. ตัวเลือกช่าง (Multi-select) --- */}
      <Label>3. เลือกช่างที่ว่าง</Label>
      <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
        {/* กล่องแสดง Badge และ Input */}
        <div className="group rounded-md border border-input px-3 py-2 text-sm">
          <div className="flex flex-wrap gap-1">
            {selectedTechObjects.map(tech => (
              <Badge key={tech.id} variant="secondary">
                {tech.fname}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none"
                  onClick={() => handleUnselect(tech.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <CommandPrimitive.Input
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={!selectedDept ? "กรุณาเลือกแผนกก่อน..." : "ค้นหาชื่อช่าง..."}
              disabled={!selectedDept}
              className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        
        {/* Dropdown รายชื่อช่างที่ว่าง */}
        <div className="relative mt-2">
          {open && selectedDept && ( 
            <div className="absolute top-0 z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
              <CommandList>
                <CommandGroup className="h-full max-h-[150px] overflow-auto">
                  {dropdownOptions.length > 0 ? (
                    dropdownOptions.filter(tech => 
                      (tech.fname + " " + tech.lname).toLowerCase().includes(inputValue.toLowerCase())
                    ).map(tech => (
                      <CommandItem
                        key={tech.id}
                        onMouseDown={e => e.preventDefault()}
                        onSelect={() => handleSelect(tech)}
                        className="cursor-pointer"
                      >
                        {/* (UI แสดงรายชื่อช่าง... เหมือนเดิม) */}
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8"><AvatarImage src={tech.avatarUrl} /><AvatarFallback>{tech.fname[0]}</AvatarFallback></Avatar>
                            <div>
                              <span className="font-medium">{tech.fname} {tech.lname}</span>
                              <p className="text-xs text-muted-foreground">{tech.position}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{tech.jobsThisMonth || 0} งาน</span>
                        </div>
                      </CommandItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      ไม่พบช่างที่ว่าง (ในตำแหน่งนี้)
                    </div>
                  )}
                </CommandGroup>
              </CommandList>
            </div>
          )}
        </div>
      </Command>
    </div>
  );
}