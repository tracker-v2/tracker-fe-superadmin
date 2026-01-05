// store/useRightStore.ts
import { create } from "zustand";
import { Vehicle } from "@/types/types";

interface RightbarState {
  search: string;
  searchType: string; // ✅ Tambahkan ini
  vehicles: Vehicle[];
  selectedTypes: string[];
  setSearch: (search: string) => void;
  setSearchType: (searchType: string) => void; // ✅ Tambahkan ini
  setVehicles: (vehicles: Vehicle[]) => void;
  setSelectedTypes: (types: string[]) => void;
}

export const useRightbarStore = create<RightbarState>((set) => ({
  search: "",
  searchType: "all", // ✅ Tambahkan ini
  vehicles: [],
  selectedTypes: [], 
  setSearch: (search) => set({ search }),
  setSearchType: (searchType) => set({ searchType }), // ✅ Tambahkan ini
  setVehicles: (vehicles) => set({ vehicles }),
  setSelectedTypes: (types) => set({ selectedTypes: types }),
}));
