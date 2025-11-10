// พจนานุกรมสำหรับแปลง key แผนกเป็นชื่อภาษาไทยที่สวยงาม
export const departmentMap: { [key: string]: string } = {
  network_security: "แผนกระบบเครือข่ายและความปลอดภัย",
  smart_building_multimedia: "แผนกระบบอาคารอัจฉริยะและมัลติมีเดีย",
  infrastructure_electrical: "แผนกโครงสร้างพื้นฐานและไฟฟ้า",
  // เพิ่มแผนกอื่นๆ ที่นี่ถ้ามี
  project_management: "ฝ่ายควบคุมงาน", // (สำหรับ Leader)
  administration: "ฝ่ายบริหาร", // (สำหรับ Admin)
  executive: "ฝ่ายผู้บริหาร", // (สำหรับ Executive)
};

// ฟังก์ชันสำหรับแปลงกลับ (เผื่อต้องใช้)
export const getDepartmentKey = (value: string): string | undefined => {
  return Object.keys(departmentMap).find((key) => departmentMap[key] === value);
};
