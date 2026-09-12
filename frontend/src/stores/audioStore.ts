import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  isAudioEnabled: boolean;
  toggleAudio: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      isAudioEnabled: true,
      toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
    }),
    {
      name: "sahirate-audio",
    }
  )
);
