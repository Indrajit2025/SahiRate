import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  failNextSync: boolean;
  setOnline: (status: boolean) => void;
  setIsSyncing: (status: boolean) => void;
  setFailNextSync: (fail: boolean) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  failNextSync: false,
  setOnline: (status) => set({ isOnline: status }),
  setIsSyncing: (status) => set({ isSyncing: status }),
  setFailNextSync: (fail) => set({ failNextSync: fail }),
}));
