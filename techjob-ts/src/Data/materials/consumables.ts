import type { Material } from "@/types";

export const consumableMaterials: Material[] = [
  {
    id: "GEN-001",
    name: "เคเบิ้ลไทร์ (Cable Tie) 8 นิ้ว",
    category: "วัสดุติดตั้ง",
    usageType: "consumable",
    unit: "ถุง (100 เส้น)",
    stock: 50,
    minStock: 10,
  },
  {
    id: "GEN-002",
    name: "พุกพลาสติก เบอร์ 7",
    category: "วัสดุติดตั้ง",
    usageType: "consumable",
    unit: "กล่อง (100 ตัว)",
    stock: 30,
    minStock: 5,
  },
  {
    id: "GEN-003",
    name: "สกรูเกลียวปล่อย 1.5 นิ้ว",
    category: "วัสดุติดตั้ง",
    usageType: "consumable",
    unit: "กล่อง (100 ตัว)",
    stock: 40,
    minStock: 8,
  },
  {
    id: "GEN-004",
    name: "แคลมป์ก้ามปู (Saddle Clamp)",
    category: "วัสดุติดตั้ง",
    usageType: "consumable",
    unit: "ถุง (50 ตัว)",
    stock: 60,
    minStock: 12,
  },
  {
    id: "GEN-005",
    name: "ซิลิโคนยาแนว (สีใส)",
    category: "วัสดุติดตั้ง",
    usageType: "consumable",
    unit: "หลอด",
    stock: 20,
    minStock: 4,
  },
];
