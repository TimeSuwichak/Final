// src/components/leader/TechSelectMultiDept.tsx (ฉบับอัปเกรด UI)
"use client";

import React, { useState, useMemo, useRef } from "react";

import { useJobs } from "@/contexts/JobContext";
import { isDateRangeOverlapping } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Separator } from "@/components/ui/separator"; // (เพิ่ม Separator)

// (Import ข้อมูลช่างและพจนานุกรมแผนก)
import { user as ALL_USERS } from "@/data/user";
import { departments } from "@/data/departments";

interface TechSelectProps {
  jobStartDate: Date;
  jobEndDate: Date;
  selectedTechIds: string[]; // (ต้องเป็น string[])
  onTechsChange: (newTechIds: string[]) => void;
  disabled?: boolean;
}

export function TechSelectMultiDept({
  jobStartDate,
  jobEndDate,
  selectedTechIds,
  onTechsChange,
  disabled = false,
}: TechSelectProps) {
  const { jobs: allJobs } = useJobs();
  const inputRef = useRef<HTMLInputElement>(null);

  // (State... เหมือนเดิม)
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // --- "สมอง" 1: (อัปเกรด!) ค้นหาช่างที่ "ว่าง" (แก้บั๊ก number/string) ---
  const availableTechsInDept = useMemo(() => {
    if (!selectedDept) return [];
    const overlappingJobs = allJobs.filter(
      (job) =>
        job.id !== "TEMP" &&
        isDateRangeOverlapping(
          jobStartDate,
          jobEndDate,
          job.startDate,
          job.endDate
        )
    );
    // (ใช้ String(id) เพื่อให้เทียบกันได้)
    const busyTechIds = new Set<string>();
    overlappingJobs.forEach((job) => {
      job.assignedTechs.forEach((techId) => busyTechIds.add(String(techId)));
    });

    return ALL_USERS.filter((user) => {
      const inDept = user.department === selectedDept;
      const isFree = !busyTechIds.has(String(user.id)); // (ใช้ String(id))
      return inDept && isFree;
    });
  }, [selectedDept, jobStartDate, jobEndDate, allJobs]);

  // ("สมอง" 2: อ่าน "รายชื่อตำแหน่ง"... เหมือนเดิม)
  const positionsInDept = useMemo(() => {
    if (!selectedDept) return [];
    const deptData = departments.find((d) => d.id === selectedDept);
    return ["all", ...(deptData?.positions || [])];
  }, [selectedDept]);

  // ▼▼▼ (ใหม่!) "สมอง" 3: จัดกลุ่มช่างที่ "ถูกเลือก" เพื่อแสดงผล ▼▼▼
  const groupedSelectedTechs = useMemo(() => {
    const techObjects = ALL_USERS.filter(
      (user) => selectedTechIds.includes(String(user.id)) // (ใช้ String(id))
    );

    // สร้าง Map สำหรับค้นหา "ชื่อแผนก" จาก "ID แผนก"
    const deptNameMap = new Map(departments.map((d) => [d.id, d.name]));

    // 1. จัดกลุ่มตาม "แผนก" (Department ID)
    const groupedByDept = techObjects.reduce((acc, tech) => {
      (acc[tech.department] = acc[tech.department] || []).push(tech);
      return acc;
    }, {} as Record<string, typeof techObjects>);

    // 2. แปลงโครงสร้าง และจัดกลุ่มย่อยตาม "ตำแหน่ง" (Position)
    return Object.entries(groupedByDept).map(([deptId, techsInDept]) => {
      const groupedByPos = techsInDept.reduce((acc, tech) => {
        (acc[tech.position] = acc[tech.position] || []).push(tech);
        return acc;
      }, {} as Record<string, typeof techObjects>);

      return {
        deptId: deptId,
        deptName: deptNameMap.get(deptId) || deptId, // (ใช้ชื่อเต็ม)
        positions: Object.entries(groupedByPos).map(([posName, techs]) => ({
          posName: posName,
          techs: techs, // (Array ของช่างในตำแหน่งนั้น)
        })),
      };
    });
  }, [selectedTechIds]); // (ทำงานใหม่ทุกครั้งที่ 'selectedTechIds' เปลี่ยน)

  // ("สมอง" 4: กรองและ "เรียงลำดับ" Dropdown... แก้บั๊ก number/string)
  const dropdownOptions = useMemo(() => {
    const filteredTechs = availableTechsInDept.filter(
      (tech) =>
        !selectedTechIds.includes(String(tech.id)) && // (ใช้ String(id))
        (positionFilter === "all" || tech.position === positionFilter)
    );
    return filteredTechs.sort(
      (a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0)
    );
  }, [availableTechsInDept, selectedTechIds, positionFilter]);

  // --- Handlers (แก้บั๊ก number/string) ---
  const handleDeptChange = (deptId: string) => {
    setSelectedDept(deptId);
    setPositionFilter("all");
    setInputValue("");
  };

  const handleSelect = (tech: any) => {
    onTechsChange([...selectedTechIds, String(tech.id)]); // (ใช้ String(id))
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleUnselect = (techId: string) => {
    // (รับ string อยู่แล้ว)
    onTechsChange(selectedTechIds.filter((id) => id !== techId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === "Backspace" &&
      inputValue === "" &&
      selectedTechIds.length > 0
    ) {
      handleUnselect(selectedTechIds[selectedTechIds.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      {/* (1. & 2. ตัวเลือกแผนก/ตำแหน่ง ... เหมือนเดิม) */}
      <Label>1. เลือกแผนก (เพื่อค้นหาช่าง)</Label>
      <Select
        value={selectedDept}
        onValueChange={handleDeptChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="เลือกแผนก..." />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dep) => (
            <SelectItem key={dep.id} value={dep.id}>
              {dep.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Label>2. กรองตามตำแหน่ง (ในแผนกนี้)</Label>
      <Select
        value={positionFilter}
        onValueChange={setPositionFilter}
        disabled={!selectedDept || disabled}
      >
        <SelectTrigger className="w-full h-9 text-xs">
          <SelectValue placeholder="กรองตามตำแหน่ง..." />
        </SelectTrigger>
        <SelectContent>
          {positionsInDept.map((pos) => (
            <SelectItem key={pos} value={pos} className="text-xs">
              {pos === "all" ? "ตำแหน่งทั้งหมด" : pos}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* --- 3. (อัปเกรด!) ส่วนแสดงผลและค้นหาช่าง --- */}
      <Label>3. ทีมช่างที่ถูกเลือก & ค้นหาช่างที่ว่าง</Label>
      <Command
        onKeyDown={handleKeyDown}
        className="overflow-visible bg-transparent"
      >
        {/* ▼▼▼ (ใหม่!) "กล่องแสดงผล" ที่อัปเกรดแล้ว ▼▼▼ */}
        <div className="group rounded-md border border-input px-3 py-2 text-sm">
          {/* (ส่วนแสดงผล "ทีมที่เลือก" แบบใหม่) */}
          <div className="mb-2 space-y-2">
            {groupedSelectedTechs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                ยังไม่ได้เลือกทีมช่าง...
              </p>
            ) : (
              groupedSelectedTechs.map((deptGroup) => (
                <div key={deptGroup.deptId}>
                  {/* (แสดงชื่อ "แผนก") */}
                  <Label className="text-xs font-semibold">
                    {deptGroup.deptName}
                  </Label>
                  {deptGroup.positions.map((posGroup) => (
                    <div key={posGroup.posName} className="pl-2">
                      {/* (แสดงชื่อ "ตำแหน่ง") */}
                      <p className="text-xs text-muted-foreground">
                        {posGroup.posName}
                      </p>
                      {/* (แสดง "ช่าง" ที่เลือก) */}
                      <div className="flex flex-wrap gap-1 py-1">
                        {posGroup.techs.map((tech) => (
                          <Badge
                            key={tech.id}
                            variant="secondary"
                            className="flex items-center gap-1.5 pr-1 py-0.5"
                          >
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={tech.avatarUrl} />
                              <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">
                              {tech.fname} {tech.lname}
                            </span>
                            <button
                              type="button"
                              className="rounded-full outline-none opacity-60 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              onClick={() => handleUnselect(String(tech.id))}
                              disabled={disabled}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* (เส้นคั่น) */}
          {groupedSelectedTechs.length > 0 && <Separator className="mb-2" />}

          {/* (Input สำหรับ "ค้นหา" ... เหมือนเดิม) */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={
              !selectedDept
                ? "กรุณาเลือกแผนกเพื่อเริ่มค้นหา..."
                : "ค้นหาชื่อช่างเพื่อเพิ่ม..."
            }
            disabled={!selectedDept || disabled}
            className="ml-0 w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        {/* ▲▲▲ (จบ "กล่องแสดงผล" ที่อัปเกรดแล้ว) ▲▲▲ */}

        {/* (Dropdown รายชื่อช่างที่ว่าง ... เหมือนเดิม) */}
        <div className="relative mt-2">
          {open && selectedDept && (
            <div className="absolute top-0 z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
              <CommandList>
                <CommandGroup className="h-full max-h-[150px] overflow-auto">
                  {dropdownOptions.length > 0 ? (
                    dropdownOptions
                      .filter((tech) =>
                        (tech.fname + " " + tech.lname)
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      )
                      .map((tech) => (
                        <CommandItem
                          key={tech.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onSelect={() => handleSelect(tech)}
                          className="cursor-pointer"
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={tech.avatarUrl} />
                                <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">
                                  {tech.fname} {tech.lname}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {tech.position}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {tech.jobsThisMonth || 0} งาน
                            </span>
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
