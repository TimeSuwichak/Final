"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { departmentMap } from "@/Data/departmentMapping";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaImage } from "react-icons/fa";
import { showWarning, showSuccess } from "@/lib/sweetalert";

const STORAGE_KEY = "techjob_personnel_data";

// โหลดข้อมูลจาก localStorage
const loadPersonnelFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading data:", error);
  }
  return [];
};

// ฟังก์ชันสำหรับบันทึกข้อมูลลง Local Storage
const savePersonnelToStorage = (data: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom event เพื่อแจ้งให้หน้าอื่นรู้ว่ามีการเปลี่ยนแปลง
    window.dispatchEvent(new Event("personnelDataChanged"));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};

// ฟังก์ชัน Normalize ให้ข้อมูลมีรูปแบบเหมือนกันเสมอ
const normalizePerson = (p: any) => ({
  id: p.id,
  originalId: p.originalId || p.id,
  fname: p.fname || "",
  lname: p.lname || "",
  name: `${p.fname || ""} ${p.lname || ""}`.trim(),
  email: p.email || "",
  role: p.role || "user",
  position: p.position || "พนักงาน",
  department: p.department || "other",
  phone: p.phone || "",
  address: p.address || "",
  idCard: p.idCard || "",
  startDate: p.startDate || "",
  status: (p.role === "admin" || p.role === "executive") ? undefined : (p.status || "available"),
  urlImage: p.urlImage || p.avatarUrl || "",
  religion: p.religion || "",
  nationality: p.nationality || "",
});

export default function MyProfile() {
  const { user: currentUser } = useAuth();
  const [person, setPerson] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [religion, setReligion] = useState("");
  const [nationality, setNationality] = useState("");
  const [idCard, setIdCard] = useState("");
  const [startDate, setStartDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // โหลดข้อมูล personnel ทั้งหมด
  const allPersonnelData = useMemo(() => {
    return loadPersonnelFromStorage();
  }, []);

  // สร้าง allDepartments และ positionsByDepartment
  const allDepartmentsForForm = useMemo(() => {
    const departments = [...new Set(allPersonnelData.map((p: any) => p.department))] as string[];
    if (person?.department && !departments.includes(person.department)) {
      return [person.department, ...departments];
    }
    return departments;
  }, [allPersonnelData, person]);

  const positionsByDepartmentForForm = useMemo(() => {
    const positionsMap: { [key: string]: string[] } = {};
    allPersonnelData.forEach((p: any) => {
      if (!positionsMap[p.department]) {
        positionsMap[p.department] = [];
      }
      if (!positionsMap[p.department].includes(p.position)) {
        positionsMap[p.department].push(p.position);
      }
    });
    if (person?.department && person?.position) {
      if (!positionsMap[person.department]) {
        positionsMap[person.department] = [];
      }
      if (!positionsMap[person.department].includes(person.position)) {
        positionsMap[person.department].push(person.position);
      }
    }
    return positionsMap;
  }, [allPersonnelData, person]);

  const availablePositions = useMemo(() => {
    if (!department) return [];
    let positions = positionsByDepartmentForForm[department] || [];
    if (person && person.department === department && person.position) {
      if (!positions.includes(person.position)) {
        positions = [person.position, ...positions];
      }
    }
    return positions;
  }, [department, person, positionsByDepartmentForForm]);

  // โหลดข้อมูลผู้ใช้จาก localStorage หรือใช้ข้อมูลจาก AuthContext
  const loadPersonData = useCallback(() => {
    if (!currentUser) return;

    // 1) โหลดจาก localStorage ก่อน
    const stored = loadPersonnelFromStorage();
    const fromLocal = stored.find((p: any) =>
      p.email === currentUser.email ||
      String(p.originalId) === String(currentUser.id) ||
      String(p.id) === String(currentUser.id)
    );

    if (fromLocal) {
      setPerson(normalizePerson(fromLocal));
      return;
    }

    // 2) ถ้าไม่เจอใน localStorage ใช้ข้อมูลจาก AuthContext
    setPerson(normalizePerson(currentUser));
  }, [currentUser]);

  useEffect(() => {
    loadPersonData();

    const onStorageUpdate = () => {
      loadPersonData();
    };

    window.addEventListener("storage", onStorageUpdate);
    window.addEventListener("personnelDataChanged", onStorageUpdate);

    return () => {
      window.removeEventListener("storage", onStorageUpdate);
      window.removeEventListener("personnelDataChanged", onStorageUpdate);
    };
  }, [loadPersonData]);

  // เติมข้อมูลใน form เมื่อเปิด dialog
  useEffect(() => {
    if (isDialogOpen && person) {
      setFname(person.fname || "");
      setLname(person.lname || "");
      setDepartment(person.department || "");
      setPosition(person.position || "");
      setImagePreview(person.urlImage || null);
      setPhone(person.phone || "");
      setAddress(person.address || "");
      setReligion(person.religion || "");
      setNationality(person.nationality || "");
      setIdCard(person.idCard || "");
      setStartDate(person.startDate || "");
      setEmail(person.email || "");
      setPassword(""); // ไม่แสดงรหัสผ่านเดิม
    }
  }, [isDialogOpen, person]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
    }
  };

  const handleUpdateProfile = () => {
    if (!fname || !lname || !department || !position) {
      showWarning("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (!person) return;

    const updatedUserData = {
      id: person.id,
      originalId: person.originalId,
      name: `${fname} ${lname}`,
      email: email || person.email,
      password: password || person.password || currentUser?.password,
      department,
      position,
      urlImage: imagePreview || person.urlImage,
      role: person.role,
      fname: fname,
      lname: lname,
      phone: phone,
      address: address,
      religion: religion,
      nationality: nationality,
      idCard: idCard,
      startDate: startDate,
      status: person.status,
    };

    // อัปเดตข้อมูลใน localStorage
    const stored = loadPersonnelFromStorage();
    const updated = stored.map((u: any) =>
      u.id === person.id || u.originalId === person.originalId
        ? { ...u, ...updatedUserData }
        : u
    );
    savePersonnelToStorage(updated);

    // อัปเดต state
    setPerson(normalizePerson(updatedUserData));
    setIsDialogOpen(false);

    showSuccess("บันทึกข้อมูลสำเร็จ");
  };

  // UI โหลดข้อมูล
  if (person === null) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold">กำลังโหลดข้อมูล...</h2>
      </div>
    );
  }

  // UI แสดงข้อมูล
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ข้อมูลส่วนตัว</h1>
          <p className="text-muted-foreground mt-2">ดูและจัดการข้อมูลส่วนตัวของคุณ</p>
        </div>
        {person?.role === "admin" && (
          <Button onClick={() => setIsDialogOpen(true)}>
            แก้ไขข้อมูล
          </Button>
        )}
      </div>

      {/* กล่องแสดงรายละเอียดโปรไฟล์ */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary">
            <AvatarImage src={person.urlImage} />
            <AvatarFallback className="text-4xl">
              {person.fname?.[0] || "U"}
              {person.lname?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{person.fname} {person.lname}</CardTitle>
          <CardDescription className="text-lg">{person.position}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-6 bg-muted rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">แผนก</p>
                <p className="font-medium text-lg">{departmentMap[person.department] || person.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">ตำแหน่ง</p>
                <p className="font-medium text-lg">{person.position}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">อีเมล</p>
                <p className="font-medium text-lg">{person.email}</p>
              </div>
              {person.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">ที่อยู่</p>
                  <p className="font-medium text-lg">{person.address}</p>
                </div>
              )}
              {person.idCard && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">เลขบัตรประชาชน</p>
                  <p className="font-medium text-lg">{person.idCard}</p>
                </div>
              )}
              {person.religion && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ศาสนา</p>
                  <p className="font-medium text-lg">{person.religion}</p>
                </div>
              )}
              {person.nationality && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">สัญชาติ</p>
                  <p className="font-medium text-lg">{person.nationality}</p>
                </div>
              )}
              {person.phone && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">เบอร์โทรศัพท์</p>
                  <p className="font-medium text-lg">{person.phone}</p>
                </div>
              )}
              {person.startDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">วันที่เข้าทำงาน</p>
                  <p className="font-medium text-lg">
                    {new Date(person.startDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              {person.status && person.role !== "admin" && person.role !== "executive" && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">สถานะ:</p>
                  <span
                    className={`capitalize px-3 py-1 rounded-full text-sm font-medium ${person.status === "available"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                  >
                    {person.status === "available" ? "พร้อมทำงาน" : "ไม่พร้อมทำงาน"}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">บทบาท:</p>
                <span className="capitalize px-3 py-1 bg-secondary rounded-full text-sm font-medium">
                  {person.role}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog สำหรับแก้ไขข้อมูล (เฉพาะ admin) */}
      {person?.role === "admin" && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <DialogHeader>
                <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* รูปโปรไฟล์ */}
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

                {/* เลขบัตรประชาชน */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="idCard" className="text-right">
                    บัตรประชาชน
                  </Label>
                  <Input
                    id="idCard"
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                    className="col-span-3"
                    placeholder="เช่น 1101700202001"
                  />
                </div>

                {/* ชื่อ-นามสกุล */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ชื่อ-นามสกุล</Label>
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <Input
                      id="fname"
                      value={fname}
                      onChange={(e) => setFname(e.target.value)}
                      placeholder="ชื่อจริง"
                    />
                    <Input
                      id="lname"
                      value={lname}
                      onChange={(e) => setLname(e.target.value)}
                      placeholder="นามสกุล"
                    />
                  </div>
                </div>

                {/* สัญชาติ-ศาสนา */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">สัญชาติ-ศาสนา</Label>
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <Input
                      id="nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="เช่น ไทย"
                    />
                    <Input
                      id="religion"
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                      placeholder="เช่น พุทธ"
                    />
                  </div>
                </div>

                {/* ที่อยู่ */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    ที่อยู่
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="col-span-3"
                    placeholder="ที่อยู่"
                  />
                </div>

                {/* เบอร์โทร */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    เบอร์โทรศัพท์
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="col-span-3"
                    placeholder="เช่น 081-234-5678"
                  />
                </div>

                {/* วันที่เริ่มงาน */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    วันที่เริ่มงาน
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                {/* อีเมล */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    อีเมล
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-3"
                    placeholder="เช่น user@techjob.com"
                  />
                </div>

                {/* รหัสผ่าน */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    รหัสผ่าน
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="col-span-3"
                    placeholder="เว้นว่างไว้เพื่อไม่เปลี่ยนรหัสผ่าน"
                  />
                </div>

                {/* แผนก */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">แผนก</Label>
                  <Select
                    value={department || undefined}
                    onValueChange={(value) => {
                      setDepartment(value);
                      const newPositions = positionsByDepartmentForForm[value] || [];
                      if (!newPositions.includes(position)) {
                        setPosition("");
                      }
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="เลือกแผนก..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allDepartmentsForForm.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {departmentMap[dept] || dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ตำแหน่ง */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ตำแหน่ง</Label>
                  <Select
                    value={position || undefined}
                    onValueChange={setPosition}
                    disabled={!department}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="เลือกตำแหน่ง..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePositions.length > 0 ? (
                        availablePositions.map((pos: string) => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          ไม่มีตำแหน่งในแผนกนี้
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="button" onClick={handleUpdateProfile}>
                  บันทึกข้อมูล
                </Button>
              </DialogFooter>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

