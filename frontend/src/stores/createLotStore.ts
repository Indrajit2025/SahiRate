import { create } from 'zustand';

interface CreateLotState {
  step: 'material' | 'weight' | 'price' | 'confirm';
  material_id: string | null;
  approx_weight_kg: number | null;
  estimated_value: number | null;
  setMaterial: (id: string) => void;
  setWeight: (weight: number) => void;
  setEstimatedValue: (value: number) => void;
  setStep: (step: CreateLotState['step']) => void;
  reset: () => void;
}

export const useCreateLotStore = create<CreateLotState>((set) => ({
  step: 'material',
  material_id: null,
  approx_weight_kg: null,
  estimated_value: null,
  setMaterial: (id) => set({ material_id: id, step: 'weight' }),
  setWeight: (weight) => set({ approx_weight_kg: weight, step: 'price' }),
  setEstimatedValue: (value) => set({ estimated_value: value, step: 'confirm' }),
  setStep: (step) => set({ step }),
  reset: () => set({ step: 'material', material_id: null, approx_weight_kg: null, estimated_value: null }),
}));
