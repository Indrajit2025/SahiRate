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
  midpoint: number;
  min: number;
  max: number;
  unit: "kg" | "piece";
  unitLabel: string;
  trend?: "up" | "down" | "stable";
  pctChange?: number;
  observations?: number;
}

export const DEMO_REF_RATES: RefRate[] = [
  { id: "BATTERY", label: "Battery",       midpoint: 90,   min: 80,  max: 100,  unit: "kg",    unitLabel: "kg",      trend: "up", pctChange: 2.5, observations: 18 },
  { id: "DISPLAY", label: "Display",       midpoint: 485,  min: 450, max: 520,  unit: "piece", unitLabel: "display", trend: "up", pctChange: 4.2, observations: 18 },
  { id: "MOTOR",   label: "Motor",         midpoint: 515,  min: 450, max: 580,  unit: "kg",    unitLabel: "kg",      trend: "up", pctChange: 3.1, observations: 14 },
  { id: "PCB",     label: "PCB Board",     midpoint: 100,  min: 90,  max: 110,  unit: "piece", unitLabel: "board",   trend: "up", pctChange: 5.0, observations: 18 },
  { id: "WIRE",    label: "Wire (Copper)", midpoint: 1015, min: 980, max: 1050, unit: "kg",    unitLabel: "kg",      trend: "up", pctChange: 6.8, observations: 22 },
  { id: "METAL",   label: "Metal",         midpoint: 148,  min: 120, max: 175,  unit: "kg",    unitLabel: "kg",      trend: "up", pctChange: 1.8, observations: 18 },
  { id: "PLASTIC", label: "Plastic",       midpoint: 83,   min: 75,  max: 90,   unit: "kg",    unitLabel: "kg",      trend: "up", pctChange: 3.5, observations: 12 },
  { id: "CABLE",   label: "Wire (Copper)", midpoint: 1015, min: 980, max: 1050, unit: "kg",    unitLabel: "kg",      trend: "up", pctChange: 6.8, observations: 22 }, // Compatibility alias
];

/** Look up the demo reference rate for a material ID. Returns undefined if not found. */
export function getDemoRefRate(materialId?: string): RefRate | undefined {
  if (!materialId) return undefined;
  return DEMO_REF_RATES.find((r) => r.id === materialId.toUpperCase());
}

/** Midpoint rate or undefined */
export function getDemoMidRate(materialId?: string): number | undefined {
  return getDemoRefRate(materialId)?.midpoint;
}

/** The 7 primary material IDs recognized by the model and system */
export const DEMO_MATERIAL_IDS = ["BATTERY", "DISPLAY", "MOTOR", "PCB", "WIRE", "METAL", "PLASTIC"];
