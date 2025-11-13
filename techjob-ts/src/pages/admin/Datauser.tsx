// src/pages/Datauser.tsx (หรือ Path ที่คุณใช้งาน)
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // ✨ Import useNavigate ✨
// ==========================================================
// ข้อมูล Mock Data (สมมติว่า import มาจากไฟล์อื่น)
// ==========================================================
import { user } from "@/Data/user"; // (ปรับ path ให้ตรงกับที่เก็บไฟล์)
import { leader } from "@/Data/leader"; // (ปรับ path ให้ตรงกับที่เก็บไฟล์)
import { executive } from "@/Data/executive";
import { admin } from "@/Data/admin";

// ==========================================================
// แปลพจนานุกรมแผนก (department mapping)
// ==========================================================
import { departmentMap } from "@/Data/departmentMapping"; // ✨ 1. Import พจนานุกรมเข้ามา

// ==========================================================
// 1. เตรียมข้อมูลเริ่มต้น (ทำนอก Component)
// ==========================================================
const allPersonnel = [...user, ...leader, ...executive, ...admin];
const initialFormattedPersonnel = allPersonnel.map((person, index) => {
  const fullName = `${person.fname} ${person.lname}`;
  const email = `${person.email}`;
  const iconProflie = `${person.avatarUrl}`;
  return {
    id: `${person.department.slice(0, 4)}-${person.id}-${index}`,
    originalId: person.id,
    name: fullName,
    email: email,
    position: person.position,
    department: person.department,
    urlImage: iconProflie,
    role: (person as any).role || "user",
  };
});

const allDepartments = [
  ...new Set(initialFormattedPersonnel.map((p) => p.department)),
];
const positionsByDepartment = {
  แผนกระบบเครือข่ายและความปลอดภัย: [
    "หัวหน้าแผนกระบบเครือข่ายและความปลอดภัย",
    "วิศวกรระบบโครงสร้างพื้นฐาน",
    "วิศวกรระบบความปลอดภัย",
    "ช่างเทคนิคระบบความปลอดภัย",
    "ช่างเทคนิคเครือข่าย",
  ],
  แผนกระบบอาคารอัจฉริยะและมัลติมีเดีย: [
    "หัวหน้าแผนกระบบอาคารอัจฉริยะ",
    "ช่างเทคนิคระบบอาคารอัตโนมัติ/IoT",
    "ช่างเทคนิคระบบภาพและเสียง",
    "ผู้เชี่ยวชาญระบบสื่อสาร",
  ],
  แผนกโครงสร้างพื้นฐานและไฟฟ้า: [
    "หัวหน้าแผนกโครงสร้างพื้นฐาน",
    "ช่างไฟฟ้าสื่อสาร",
    "ช่างเทคนิคติดตั้งสายสัญญาณ",
  ],
};

// ==========================================================
// 2. COMPONENT: UserForm (สำหรับฟอร์มเพิ่ม/แก้ไข)
// ==========================================================
function UserForm({ initialData, onSubmit, onClose }) {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      const [firstName, ...lastNameParts] = initialData.name.split(" ");
      setFname(firstName);
      setLname(lastNameParts.join(" "));
      setDepartment(initialData.department);
      setPosition(initialData.position);
      setImagePreview(initialData.urlImage);
    } else {
      setFname("");
      setLname("");
      setDepartment("");
      setPosition("");
      setImagePreview(null);
    }
  }, [initialData]);

  const availablePositions = useMemo(() => {
    if (!department) return [];
    return positionsByDepartment[department] || [];
  }, [department]);

  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImagePreview(reader.result as null);
      };
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (!fname || !lname || !department || !position) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    const finalUserData = {
      id: initialData?.id,
      name: `${fname} ${lname}`,
      email: `${fname.toLowerCase()}.${lname.toLowerCase()}${
        (initialData?.id || "").toString().split("-")[1] || Date.now()
      }@techjob.com`,
      department,
      position,
      // urlImage: imagePreview || `https://api.dicebear.com/7.x/initials/svg?seed=${fname} ${lname}`,
    };
    onSubmit(finalUserData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="fname" className="text-right">
            ชื่อจริง
          </Label>
          <Input
            id="fname"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lname" className="text-right">
            นามสกุล
          </Label>
          <Input
            id="lname"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">แผนก</Label>
          <Select
            value={department}
            onValueChange={(value) => {
              setDepartment(value);
              setPosition("");
            }}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="เลือกแผนก..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(departmentMap).map((key) => (
                <SelectItem key={key} value={key}>
                  {departmentMap[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">ตำแหน่ง</Label>
          <Select
            value={position}
            onValueChange={setPosition}
            disabled={!department}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="เลือกตำแหน่ง..." />
            </SelectTrigger>
            <SelectContent>
              {availablePositions.map((pos: any) => (
                <SelectItem key={pos} value={pos}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="picture" className="text-right pt-2">
            รูปโปรไฟล์
          </Label>
          <div className="col-span-3 flex items-center gap-4">
            <div className="w-24 h-24 border rounded-full flex items-center justify-center bg-muted/50 overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaImage className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Label
              htmlFor="picture"
              className="cursor-pointer text-sm text-primary hover:underline"
            >
              เลือกรูปภาพ
            </Label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button type="submit">บันทึกข้อมูล</Button>
      </DialogFooter>
    </form>
  );
}

// ==========================================================
// 3. COMPONENT หลัก: Datauser
// ==========================================================
export default function Datauser() {
  const [personnelData, setPersonnelData] = useState(initialFormattedPersonnel);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("ทั้งหมด");
  const [filterPosition, setFilterPosition] = useState("ทั้งหมด");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const pageSize = 10;

  const availablePositionsForFilter = useMemo(() => {
    if (filterDepartment === "ทั้งหมด")
      return [...new Set(personnelData.map((p) => p.position))];
    return [
      ...new Set(
        personnelData
          .filter((p) => p.department === filterDepartment)
          .map((p) => p.position)
      ),
    ];
  }, [filterDepartment, personnelData]);

  const filteredData = useMemo(() => {
    return personnelData.filter((item) => {
      const matchQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase());
      const matchDepartment =
        filterDepartment === "ทั้งหมด" || item.department === filterDepartment;
      const matchPosition =
        filterPosition === "ทั้งหมด" || item.position === filterPosition;
      return matchQuery && matchDepartment && matchPosition;
    });
  }, [query, filterDepartment, filterPosition, personnelData]);

  const handleAddUser = (newUserData: any) => {
    setPersonnelData((prev) => [
      ...prev,
      { ...newUserData, id: `NEW-${Date.now()}` },
    ]);
    setIsDialogOpen(false);
  };

  const handleUpdateUser = (updatedUserData: any) => {
    setPersonnelData((prev) =>
      prev.map((user) =>
        user.id === updatedUserData.id ? updatedUserData : user
      )
    );
    setIsDialogOpen(false);
  };

  const handleDeleteUser = (userId: any) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?")) {
      setPersonnelData((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pagedData = filteredData.slice(startIndex, startIndex + pageSize);
  // Simple client-side navigate helper to avoid depending on react-router in this file
  const navigate = (url: string) => {
    window.location.href = url;
  };

  return (
  <div className="w-full `max-w-screen-xl` mx-auto space-y-4 p-4 md:p-6 overflow-x-hidden">
    {/* ✅ ส่วนค้นหา / ฟิลเตอร์ */}
    <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
      <div className="relative w-full md:w-auto md:flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาชื่อ หรือ อีเมล..."
          className="pl-8 w-full"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
        <Select
          value={filterDepartment}
          onValueChange={(v) => {
            setFilterDepartment(v);
            setFilterPosition("ทั้งหมด");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue placeholder="เลือกแผนก" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ทั้งหมด">แผนก (ทั้งหมด)</SelectItem>
            {Object.keys(departmentMap).map((key) => (
              <SelectItem key={key} value={key}>
                {departmentMap[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterPosition}
          onValueChange={(v) => {
            setFilterPosition(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue placeholder="เลือกตำแหน่ง" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ทั้งหมด">
              {filterDepartment === "ทั้งหมด"
                ? "ตำแหน่ง (ทั้งหมด)"
                : `ตำแหน่ง (${departmentMap[filterDepartment]})`}
            </SelectItem>
            {availablePositionsForFilter.map((pos) => (
              <SelectItem key={pos} value={pos}>
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => {
            setEditingUser(null);
            setIsDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          เพิ่มผู้ใช้
        </Button>
      </div>
    </div>

    {/* ✅ ตาราง / รายการ */}
    <div className="rounded-xl border shadow-sm w-full overflow-hidden">
      {/* 📱 Mobile View */}
  <div className="flex flex-col gap-3 md:hidden p-2">
        {pagedData.length > 0 ? (
          pagedData.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg p-3 shadow-sm border"
            >
              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                <img
                  src={item.urlImage}
                  className="w-8 h-8 rounded-full object-cover bg-muted"
                  alt={item.name}
                />
                <div className="overflow-hidden min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {item.email}
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground truncate">
                    {item.position}
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground truncate">
                    {departmentMap[item.department] || item.department}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-1 shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(`/admin/user-detail/${item.originalId}`)
                    }
                  >
                    ดูรายละเอียด
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingUser(item);
                      setIsDialogOpen(true);
                    }}
                  >
                    แก้ไข
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDeleteUser(item.id)}
                  >
                    ลบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-6">
            ไม่พบข้อมูล
          </div>
        )}
      </div>

      {/* 💻 Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <Table className="w-full min-w-full table-auto border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">ชื่อ</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead className="w-[280px]">แผนก</TableHead>
              <TableHead className="w-[280px]">บทบาท</TableHead>
              <TableHead className="text-right w-20">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.length > 0 ? (
              pagedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.urlImage}
                        className="w-8 h-8 rounded-full object-cover bg-muted"
                        alt={item.name}
                      />
                      <span className="font-medium truncate">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-0 truncate">{item.email}</TableCell>
                  <TableCell className="min-w-0 truncate">
                    {departmentMap[item.department] || item.department}
                  </TableCell>
                  <TableCell className="min-w-0 truncate">{item.role}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/admin/user-detail/${item.originalId}`)
                          }
                        >
                          ดูรายละเอียด
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingUser(item);
                            setIsDialogOpen(true);
                          }}
                        >
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteUser(item.id)}
                        >
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>

    {pagedData.length > 0 && (
      <PaginationDemo page={page} setPage={setPage} totalPages={totalPages} />
    )}

    {/* Dialog */}
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className="sm:max-w-[500px]"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
          </DialogTitle>
        </DialogHeader>
        <UserForm
          initialData={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleAddUser}
          onClose={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  </div>
);

}

function PaginationDemo({
  page,
  setPage,
  totalPages,
}: {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}) {
  // Logic to create pagination items can be complex, this is a simplified version\

  const pageNumbers: number[] = [];
  // This logic can be improved to show ellipsis `...` for many pages
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(Math.max(1, page - 1));
            }}
          />
        </PaginationItem>
        {pageNumbers.map((number) => (
          <PaginationItem key={number}>
            <PaginationLink
              href="#"
              isActive={page === number}
              onClick={(e) => {
                e.preventDefault();
                setPage(number);
              }}
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(Math.min(totalPages, page + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
