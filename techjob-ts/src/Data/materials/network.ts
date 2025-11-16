import type { Material } from "@/types";

export const networkMaterials: Material[] = [
  {
    id: "NET-001",
    name: "สาย LAN Cat 6 (UTP)",
    category: "อุปกรณ์เครือข่ายและความปลอดภัย",
    usageType: "consumable",
    unit: "เมตร",
    stock: 1500,
  },
  {
    id: "NET-002",
    name: "หัวแลน RJ45 (Cat 6)",
    category: "อุปกรณ์เครือข่ายและความปลอดภัย",
    usageType: "consumable",
    unit: "ตัว",
    stock: 500,
  },
  {
    id: "NET-003",
    name: "Access Point Wi-Fi 6",
    category: "อุปกรณ์เครือข่ายและความปลอดภัย",
    usageType: "returnable",
    unit: "เครื่อง",
    stock: 45,
  },
  {
    id: "NET-004",
    name: "กล้องวงจรปิด CCTV (IP Camera)",
    category: "อุปกรณ์เครือข่ายและความปลอดภัย",
    usageType: "returnable",
    unit: "ตัว",
    stock: 80,
  },
  {
    id: "NET-005",
    name: "Router / Switch ขนาดเล็ก (8-Port)",
    category: "อุปกรณ์เครือข่ายและความปลอดภัย",
    usageType: "returnable",
    unit: "เครื่อง",
    stock: 20,
  },
  {
    id: "NET-006",
    name: "ตู้แร็ค (Rack) ติดผนัง ขนาด 6U",
    category: "อุปกรณ์เครือข่ายและความปลอดภัย",
    usageType: "returnable",
    unit: "ตู้",
    stock: 10,
  },
];
