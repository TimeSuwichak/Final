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
      stock: 0,
      minStock: 0,
      ...materialInput,
    };
    setMaterials((prev) => [newMaterial, ...prev]);
    return newMaterial;
  };

  const updateMaterial: MaterialContextType["updateMaterial"] = (
    materialId,
    updates
  ) => {
    setMaterials((prev) =>
      prev.map((material) =>
        material.id === materialId ? { ...material, ...updates } : material
      )
    );
  };

  const restockMaterial: MaterialContextType["restockMaterial"] = (
    materialId,
    quantity
  ) => {
    if (quantity <= 0) return;
    setMaterials((prev) =>
      prev.map((material) =>
        material.id === materialId
          ? { ...material, stock: material.stock + quantity }
          : material
      )
    );
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

    setMaterials((prev) =>
      prev.map((material) => {
        const requestedQty = aggregated.get(material.id);
        if (!requestedQty) return material;
        return { ...material, stock: material.stock - requestedQty };
      })
    );

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

