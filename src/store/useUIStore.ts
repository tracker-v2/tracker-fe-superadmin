// useUIStore.ts
import { create } from "zustand";

interface UIState {
  showTopbar: boolean;
  setShowTopbar: (val: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showTopbar: true,
  setShowTopbar: (val) => set({ showTopbar: val }),
}));
