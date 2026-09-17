/**
 * Demo reference rate catalog.
 * Source of truth: reuses the same data as collector/PriceBoard.tsx.
 * In M12, this will be replaced by a live price_cache Dexie query backed by the FastAPI backend.
 *
 * DO NOT present these as live market prices. Always display with "REFERENCE DATA" or "DEMO" label.
 */
export interface RefRate {
  id: string;
  label: string;
  midpoint: number; // ₹/kg — used for lot cards and offer pre-fill
  min: number;
  max: number;
}

export const DEMO_REF_RATES: RefRate[] = [
  { id: "PCB",     label: "PCB Board",  midpoint: 125, min: 115, max: 135 },
  { id: "CABLE",   label: "Wires",      midpoint: 70,  min: 60,  max: 80  },
  { id: "BATTERY", label: "Battery",    midpoint: 100, min: 90,  max: 110 },
  { id: "DISPLAY", label: "Screen",     midpoint: 45,  min: 40,  max: 50  },
];

/** Look up the demo reference rate for a material ID. Returns undefined if not found. */
export function getDemoRefRate(materialId?: string): RefRate | undefined {
  if (!materialId) return undefined;
  return DEMO_REF_RATES.find((r) => r.id === materialId.toUpperCase());
}

/** Midpoint ₹/kg or undefined */
export function getDemoMidRate(materialId?: string): number | undefined {
  return getDemoRefRate(materialId)?.midpoint;
}

/** All material IDs in the catalog */
export const DEMO_MATERIAL_IDS = DEMO_REF_RATES.map((r) => r.id);
