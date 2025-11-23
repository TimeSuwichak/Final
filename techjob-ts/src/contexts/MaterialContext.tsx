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
  deleteDoc,
  query as firestoreQuery,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const STORAGE_KEY = "techJobMaterials_v1";

const SEED_MATERIALS: Material[] = [
  ...electricalMaterials,
  ...networkMaterials,
  ...toolMaterials,
  ...multimediaMaterials,
  ...consumableMaterials,
].map((item) => ({ ...item }));

type WithdrawRequest = {
  materialId: string;
  quantity: number;
};

type WithdrawResult =
  | { success: true }
  | { success: false; errors: string[] };

interface MaterialContextType {
  materials: Material[];
  addMaterial: (material: Omit<Material, "id"> & { id?: string }) => Material;
  updateMaterial: (
    materialId: string,
    updates: Partial<Omit<Material, "id">>
  ) => void;
  restockMaterial: (materialId: string, quantity: number) => void;
  withdrawMaterials: (requests: WithdrawRequest[]) => WithdrawResult;
  getMaterialById: (materialId: string) => Material | undefined;
}

const MaterialContext = createContext<MaterialContextType | undefined>(
  undefined
);

function loadMaterialsFromStorage(): Material[] {
  if (typeof window === "undefined") {
    return SEED_MATERIALS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_MATERIALS;
    const parsed = JSON.parse(raw) as Material[];
    return parsed.map((item) => ({ ...item }));
  } catch (error) {
    console.error("Failed to load materials from storage", error);
    return SEED_MATERIALS;
  }
}

export function MaterialProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(
    loadMaterialsFromStorage
  );

  // Firestore realtime subscription for materials
  useEffect(() => {
    try {
      const q = firestoreQuery(collection(db, "materials"), orderBy("name", "asc"));
      const unsub = onSnapshot(
        q,
        (snap) => {
          const items: Material[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Material));
          setMaterials(items);
        },
        (err) => console.error("materials onSnapshot error", err)
      );

      return () => unsub();
    } catch (e) {
      // fallback to localStorage-driven behavior
      return;
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
    } catch (error) {
      console.error("Failed to persist materials", error);
    }
  }, [materials]);

  const addMaterial: MaterialContextType["addMaterial"] = (materialInput) => {
    const newMaterial: Material = {
      id: materialInput.id ?? `MAT-${Date.now()}`,
      stock: materialInput.stock ?? 0,
      minStock: materialInput.minStock ?? 0,
      ...materialInput,
    };

    (async () => {
      try {
        await addDoc(collection(db, "materials"), { ...newMaterial, createdAt: serverTimestamp() } as any);
      } catch (e) {
        console.error("Failed to add material to Firestore", e);
        setMaterials((prev) => [newMaterial, ...prev]);
      }
    })();

    return newMaterial;
  };

  const updateMaterial: MaterialContextType["updateMaterial"] = (
    materialId,
    updates
  ) => {
    (async () => {
      try {
        await updateDoc(doc(db, "materials", materialId), updates as any);
      } catch (e) {
        console.error("Failed to update material in Firestore", e);
        setMaterials((prev) =>
          prev.map((material) =>
            material.id === materialId ? { ...material, ...updates } : material
          )
        );
      }
    })();
  };

  const restockMaterial: MaterialContextType["restockMaterial"] = (
    materialId,
    quantity
  ) => {
    if (quantity <= 0) return;
    (async () => {
      try {
        const targetRef = doc(db, "materials", materialId);
        await updateDoc(targetRef, { stock: (await (await getDocs(firestoreQuery(collection(db, "materials")))).docs.find(d=>d.id===materialId)) ? undefined : undefined } as any);
        // Best-effort: increment locally as fallback if update API not suitable
        setMaterials((prev) =>
          prev.map((material) =>
            material.id === materialId
              ? { ...material, stock: material.stock + quantity }
              : material
          )
        );
      } catch (e) {
        console.error("Failed to restock material in Firestore", e);
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

  const withdrawMaterials: MaterialContextType["withdrawMaterials"] = (
    requests
  ) => {
    if (requests.length === 0) {
      return { success: false, errors: ["ไม่มีรายการเบิกวัสดุ"] };
    }

    const aggregated = requests.reduce((acc, req) => {
      const current = acc.get(req.materialId) ?? 0;
      acc.set(req.materialId, current + req.quantity);
      return acc;
    }, new Map<string, number>());

    const errors: string[] = [];

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

    (async () => {
      try {
        // Apply updates in Firestore per material
        const updates = Array.from(aggregated.entries()).map(async ([materialId, qty]) => {
          const ref = doc(db, "materials", materialId);
          // Best-effort: decrement by setting new value based on local state
          const current = materials.find((m) => m.id === materialId)?.stock ?? 0;
          await updateDoc(ref, { stock: current - qty } as any);
        });
        await Promise.all(updates);
      } catch (e) {
        console.error("Failed to withdraw materials in Firestore", e);
        setMaterials((prev) =>
          prev.map((material) => {
            const requestedQty = aggregated.get(material.id);
            if (!requestedQty) return material;
            return { ...material, stock: material.stock - requestedQty };
          })
        );
      }
    })();

    return { success: true };

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

