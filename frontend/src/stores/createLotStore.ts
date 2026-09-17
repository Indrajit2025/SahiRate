import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { MaterialClassificationResult } from '@/services/ai/inference';

interface CreateLotState {
  draft_id: string | null;
  step: 'ai_scan' | 'material' | 'weight' | 'price' | 'photo' | 'confirm';
  history: ('ai_scan' | 'material' | 'weight' | 'price' | 'photo' | 'confirm')[];
  material_id: string | null;
  approx_weight_kg: number | null;
  estimated_value: number | null;
  ai_confidence: number | null;
  
  // Transient UI State
  aiResult: MaterialClassificationResult | null;
  aiError: boolean;
  previewUri: string | null;
  processing: boolean;

  setMaterial: (id: string) => void;
  setWeight: (weight: number, value: number) => void;
  setEstimatedValue: (value: number) => void;
  setStep: (step: CreateLotState['step']) => void;
  goBack: () => void;
  setAiConfidence: (confidence: number) => void;
  setAiState: (state: Partial<Pick<CreateLotState, 'aiResult' | 'aiError' | 'previewUri' | 'processing'>>) => void;
  initDraft: () => void;
  reset: () => void;
}

export const useCreateLotStore = create<CreateLotState>()(
  persist(
    (set) => ({
      draft_id: null,
      step: 'ai_scan',
      history: [],
      material_id: null,
      approx_weight_kg: null,
      estimated_value: null,
      ai_confidence: null,
      aiResult: null,
      aiError: false,
      previewUri: null,
      processing: false,

      setMaterial: (id) => set((state) => ({ material_id: id, step: 'weight', history: [...state.history, state.step] })),
      setWeight: (weight, value) => set((state) => ({ approx_weight_kg: weight, estimated_value: value, step: 'confirm', history: [...state.history, state.step] })),
      setEstimatedValue: (value) => set((state) => ({ estimated_value: value, step: 'confirm', history: [...state.history, state.step] })),
      setStep: (step) => set((state) => ({ step, history: [...state.history, state.step] })),
      setAiConfidence: (confidence) => set({ ai_confidence: confidence }),
      goBack: () => set((state) => {
        const newHistory = [...state.history];
        const previousStep = newHistory.pop();
        if (previousStep) {
          return { step: previousStep, history: newHistory };
        }
        return state;
      }),
      setAiState: (newState) => set(newState),
      initDraft: () => set((state) => ({ draft_id: state.draft_id || uuidv4() })),
      reset: () => set({ 
        draft_id: null, step: 'ai_scan', material_id: null, approx_weight_kg: null, 
        estimated_value: null, ai_confidence: null, aiResult: null, aiError: false, 
        previewUri: null, processing: false 
      , history: []}),
    }),
    {
      name: 'sahirate-createlot-draft',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        draft_id: state.draft_id,
        step: state.step,
        material_id: state.material_id,
        approx_weight_kg: state.approx_weight_kg,
        estimated_value: state.estimated_value,
        ai_confidence: state.ai_confidence,
      }),
    }
  )
);
