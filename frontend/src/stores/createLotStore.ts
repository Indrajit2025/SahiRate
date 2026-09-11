import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface CreateLotState {
  draft_id: string | null;
  step: 'material' | 'weight' | 'price' | 'photo' | 'confirm';
  material_id: string | null;
  approx_weight_kg: number | null;
  estimated_value: number | null;
  setMaterial: (id: string) => void;
  setWeight: (weight: number) => void;
  setEstimatedValue: (value: number) => void;
  setStep: (step: CreateLotState['step']) => void;
  initDraft: () => void;
  reset: () => void;
}

export const useCreateLotStore = create<CreateLotState>()(
  persist(
    (set) => ({
      draft_id: null,
      step: 'material',
      material_id: null,
      approx_weight_kg: null,
      estimated_value: null,
      setMaterial: (id) => set({ material_id: id, step: 'weight' }),
      setWeight: (weight) => set({ approx_weight_kg: weight, step: 'price' }),
      setEstimatedValue: (value) => set({ estimated_value: value, step: 'photo' }),
      setStep: (step) => set({ step }),
      initDraft: () => set((state) => ({ draft_id: state.draft_id || uuidv4() })),
      reset: () => set({ draft_id: null, step: 'material', material_id: null, approx_weight_kg: null, estimated_value: null }),
    }),
    {
      name: 'sahirate-createlot-draft',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
