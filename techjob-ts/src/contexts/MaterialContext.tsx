// src/contexts/MaterialContext.tsx
// Context สำหรับจัดการข้อมูลวัสดุอุปกรณ์ (Materials)
// ทำหน้าที่:
// 1. โหลดข้อมูลวัสดุเริ่มต้น (Seed Data)
// 2. ซิงค์ข้อมูลกับ Firestore (Realtime)
// 3. จัดการการเบิก-จ่าย และเติมสต็อกวัสดุ

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Material } from "@/types";
import { electricalMaterials } from "@/data/materials/electrical";
import { networkMaterials } from "@/data/materials/network";
import { toolMaterials } from "@/data/materials/tools";
import { multimediaMaterials } from "@/data/materials/multimedia";
import { consumableMaterials } from "@/data/materials/consumables";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  query as firestoreQuery,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

// Key สำหรับเก็บข้อมูลใน LocalStorage
const STORAGE_KEY = "techJobMaterials_v1";

// ข้อมูลเริ่มต้น (Seed Data) - ใช้กรณีที่ยังไม่มีข้อมูลในระบบ หรือ Offline ครั้งแรก
const SEED_MATERIALS: Material[] = [
  ...electricalMaterials,
  ...networkMaterials,
  ...toolMaterials,
  ...multimediaMaterials,
  ...consumableMaterials,
].map((item) => ({ ...item, isLocal: true })); // Mark as local เพื่อให้รู้ว่าเป็นข้อมูลที่ยังไม่ได้ซิงค์

// ประเภทข้อมูลสำหรับการขอเบิกวัสดุ
type WithdrawRequest = {
  materialId: string;
  quantity: number;
};

// ผลลัพธ์การเบิกวัสดุ
type WithdrawResult = { success: true } | { success: false; errors: string[] };

// Interface ของ Context
interface MaterialContextType {
  materials: Material[]; // รายการวัสดุทั้งหมด
  addMaterial: (material: Omit<Material, "id"> & { id?: string }) => Material; // เพิ่มวัสดุใหม่
  updateMaterial: (
    materialId: string,
    updates: Partial<Omit<Material, "id">>
  ) => void; // แก้ไขข้อมูลวัสดุ
  restockMaterial: (materialId: string, quantity: number) => void; // เติมสต็อก
  withdrawMaterials: (requests: WithdrawRequest[]) => WithdrawResult; // เบิกวัสดุ (ตัดสต็อก)
  getMaterialById: (materialId: string) => Material | undefined; // ค้นหาวัสดุตาม ID
}

const MaterialContext = createContext<MaterialContextType | undefined>(
  undefined
);

// ฟังก์ชันโหลดข้อมูลจาก LocalStorage
function loadMaterialsFromStorage(): Material[] {
  if (typeof window === "undefined") {
    return SEED_MATERIALS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_MATERIALS;
    const parsed = JSON.parse(raw) as Material[];
    // ถ้าข้อมูลว่างเปล่า (อาจเกิดจาก error) ให้ใช้ Seed Data แทน
    if (parsed.length === 0) return SEED_MATERIALS;
    return parsed.map((item) => ({ ...item }));
  } catch (error) {
    console.error("Failed to load materials from storage", error);
    return SEED_MATERIALS;
  }
}

export function MaterialProvider({ children }: { children: ReactNode }) {
  // State เก็บรายการวัสดุ
  const [materials, setMaterials] = useState<Material[]>(
    loadMaterialsFromStorage
  );

  // --- Effect 1: เชื่อมต่อ Firestore Realtime ---
  useEffect(() => {
    try {
      const q = firestoreQuery(
        collection(db, "materials"),
        orderBy("name", "asc")
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const items: Material[] = snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as any) } as Material)
          );

          // Merge ข้อมูลจาก Server กับข้อมูล Local-only (ที่ยังไม่ได้ซิงค์)
          setMaterials((prev) => {
            const localOnly = prev.filter((m) => m.isLocal);
            // เอาเฉพาะ local item ที่ไม่มี id ซ้ำกับ server item
            const uniqueLocal = localOnly.filter(
              (l) => !items.some((s) => s.id === l.id)
            );
            return [...items, ...uniqueLocal];
          });
        },
        (err) => console.error("materials onSnapshot error", err)
      );

      return () => unsub();
    } catch (e) {
      // กรณีเชื่อมต่อไม่ได้ ให้ใช้ข้อมูล LocalStorage ต่อไป
      console.error("Firestore connection failed", e);
      return;
    }
  }, []);

  // --- Effect 2: บันทึกลง LocalStorage เมื่อข้อมูลเปลี่ยน ---
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
    } catch (error) {
      console.error("Failed to persist materials", error);
    }
  }, [materials]);

  // --- ฟังก์ชัน: เพิ่มวัสดุใหม่ ---
  const addMaterial: MaterialContextType["addMaterial"] = (materialInput) => {
    const newMaterial: Material = {
      id: materialInput.id ?? `MAT-${Date.now()}`,
      stock: materialInput.stock ?? 0,
      minStock: materialInput.minStock ?? 0,
      ...materialInput,
    };

    (async () => {
      try {
        await addDoc(collection(db, "materials"), {
          ...newMaterial,
          createdAt: serverTimestamp(),
        } as any);
      } catch (e) {
        console.error("Failed to add material to Firestore", e);
        // Fallback: เพิ่มลง Local State และระบุว่าเป็น Local Only
        setMaterials((prev) => [{ ...newMaterial, isLocal: true }, ...prev]);
      }
    })();

    return newMaterial;
  };

  // --- ฟังก์ชัน: แก้ไขข้อมูลวัสดุ ---
  const updateMaterial: MaterialContextType["updateMaterial"] = (
    materialId,
    updates
  ) => {
    (async () => {
      try {
        await updateDoc(doc(db, "materials", materialId), updates as any);
      } catch (e) {
        console.error("Failed to update material in Firestore", e);
        // Fallback: อัปเดต Local State
        setMaterials((prev) =>
          prev.map((material) =>
            material.id === materialId ? { ...material, ...updates } : material
          )
        );
      }
    })();
  };

  // --- ฟังก์ชัน: เติมสต็อก (Restock) ---
  const restockMaterial: MaterialContextType["restockMaterial"] = (
    materialId,
    quantity
  ) => {
    if (quantity <= 0) return;

    (async () => {
      try {
        const targetRef = doc(db, "materials", materialId);
        // อ่านค่าปัจจุบันจาก Firestore ก่อนอัปเดต (เพื่อความถูกต้อง)
        const snapshot = await getDoc(targetRef);
        if (snapshot.exists()) {
          const currentStock = snapshot.data().stock || 0;
          await updateDoc(targetRef, {
            stock: currentStock + quantity,
          } as any);
        } else {
          // ถ้าไม่พบใน Firestore (อาจเป็น Local Item) ให้อัปเดต Local State
          throw new Error("Material not found in Firestore");
        }
      } catch (e) {
        console.error("Failed to restock material in Firestore", e);
        // Fallback: อัปเดต Local State
        setMaterials((prev) =>
          prev.map((material) =>
            material.id === materialId
              ? { ...material, stock: material.stock + quantity }
              : material
          )
        );
      }
    })();
  };

  // --- ฟังก์ชัน: เบิกวัสดุ (Withdraw) ---
  const withdrawMaterials: MaterialContextType["withdrawMaterials"] = (
    requests
  ) => {
    if (requests.length === 0) {
      return { success: false, errors: ["ไม่มีรายการเบิกวัสดุ"] };
    }

    // รวมยอดเบิกของวัสดุเดียวกัน (กรณีมีการเลือกซ้ำ)
    const aggregated = requests.reduce((acc, req) => {
      const current = acc.get(req.materialId) ?? 0;
      acc.set(req.materialId, current + req.quantity);
      return acc;
    }, new Map<string, number>());

    const errors: string[] = [];

    // ตรวจสอบสต็อกว่าพอหรือไม่
    aggregated.forEach((quantity, materialId) => {
      const target = materials.find((mat) => mat.id === materialId);
      if (!target) {
        errors.push(`ไม่พบวัสดุรหัส ${materialId}`);
        return;
      }
      if (quantity <= 0) {
        errors.push(`จำนวนเบิกของ ${target.name} ต้องมากกว่า 0`);
        return;
      }
      if (target.stock < quantity) {
        errors.push(
          `${target.name} คงเหลือไม่พอ (${target.stock} ${target.unit})`
        );
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // ดำเนินการตัดสต็อก
    (async () => {
      try {
        // อัปเดตทีละรายการ
        const updates = Array.from(aggregated.entries()).map(
          async ([materialId, qty]) => {
            const ref = doc(db, "materials", materialId);
            // อ่านค่าปัจจุบันก่อนตัด
            const snapshot = await getDoc(ref);
            if (snapshot.exists()) {
              const currentStock = snapshot.data().stock || 0;
              // ป้องกันสต็อกติดลบ
              const newStock = Math.max(0, currentStock - qty);
              await updateDoc(ref, { stock: newStock } as any);
            }
          }
        );
        await Promise.all(updates);
      } catch (e) {
        console.error("Failed to withdraw materials in Firestore", e);
        // Fallback: อัปเดต Local State
        setMaterials((prev) =>
          prev.map((material) => {
            const requestedQty = aggregated.get(material.id);
            if (!requestedQty) return material;
            return {
              ...material,
              stock: Math.max(0, material.stock - requestedQty),
            };
          })
        );
      }
    })();

    return { success: true };
  };

  const getMaterialById: MaterialContextType["getMaterialById"] = (
    materialId
  ) => materials.find((material) => material.id === materialId);

  const value = useMemo<MaterialContextType>(
    () => ({
      materials,
      addMaterial,
      updateMaterial,
      restockMaterial,
      withdrawMaterials,
      getMaterialById,
    }),
    [materials]
  );

  return (
    <MaterialContext.Provider value={value}>
      {children}
    </MaterialContext.Provider>
  );
}

export const useMaterials = () => {
  const ctx = useContext(MaterialContext);
  if (!ctx) {
    throw new Error("useMaterials must be used within MaterialProvider");
  }
  return ctx;
};
