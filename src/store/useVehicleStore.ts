// Update untuk useVehicleStore.ts yang sudah ada
import { Vehicle } from "@/types/types";
import { create } from "zustand";

type TrackingData = {
  lat: number;
  lng: number;
  speed?: number;
  timestamp?: string;
  [key: string]: unknown;
};

// Route types
interface RoutePoint {
  latitude: string;
  longitude: string;
  status: 'OPERATING' | 'IDLE' | 'STOPPED';
}

// Helper function untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

type State = {
  selectedVehicleId: number | null;
  selectedVehicle: Vehicle | null;
  activeTab: "detail" | "activity";
  trackingData: TrackingData | null;
  vehicles: Vehicle[];
  
  // Route management
  selectedDate: string | null;
  routeData: RoutePoint[];
  isShowingRoute: boolean;
  isLoadingRoute: boolean;
  
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setTrackingData: (data: TrackingData | null) => void;
  setActiveTab: (tab: "detail" | "activity") => void;
  setSelectedVehicleId: (id: number | null) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  updateVehiclePosition: (vehicleId: number, lat: number, lng: number, status?: string) => void;
  
  // Route actions
  setSelectedDate: (date: string | null) => void;
  setRouteData: (data: RoutePoint[]) => void;
  setIsShowingRoute: (showing: boolean) => void;
  setIsLoadingRoute: (loading: boolean) => void;
  clearRoute: () => void;
  
  // Helper untuk mendapatkan tanggal yang efektif (selectedDate atau hari ini)
  getEffectiveDate: () => string;
};

export const useVehicleStore = create<State>((set, get) => ({
  selectedVehicleId: null,
  selectedVehicle: null,
  trackingData: null,
  activeTab: "detail",
  vehicles: [],
  
  // Route initial state
  selectedDate: null,
  routeData: [],
  isShowingRoute: false,
  isLoadingRoute: false,
  
  setSelectedVehicle: (vehicle) =>
    set({
      selectedVehicle: vehicle,
      selectedVehicleId: vehicle?.id ?? null,
      activeTab: vehicle ? "detail" : "detail",
    }),
  
  setTrackingData: (data) => set({ trackingData: data }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  
  setVehicles: (vehicles) => set({ vehicles }),
  
  updateVehiclePosition: (vehicleId, lat, lng, status) => {
    const state = get();
    
    // Update vehicles array
    const updatedVehicles = state.vehicles.map((vehicle) =>
      vehicle.id === vehicleId
        ? {
            ...vehicle,
            lat,
            lng,
            ...(status && { status: status as "active" | "idle" | "inactive" }),
          }
        : vehicle
    );
    
    // Update selected vehicle jika sedang dipilih
    const updatedSelectedVehicle =
      state.selectedVehicle?.id === vehicleId
        ? {
            ...state.selectedVehicle,
            lat,
            lng,
            ...(status && { status: status as "active" | "idle" | "inactive" }),
          }
        : state.selectedVehicle;
    
    // Update tracking data juga
    const updatedTrackingData = state.selectedVehicleId === vehicleId ? { ...state.trackingData, lat, lng } : state.trackingData;
    
    set({
      vehicles: updatedVehicles,
      selectedVehicle: updatedSelectedVehicle,
      trackingData: updatedTrackingData,
    });
  },
  
  // Route actions
  setSelectedDate: (date) => set({ selectedDate: date }),
  setRouteData: (data) => set({ routeData: data }),
  setIsShowingRoute: (showing) => set({ isShowingRoute: showing }),
  setIsLoadingRoute: (loading) => set({ isLoadingRoute: loading }),
  clearRoute: () => set({ 
    selectedDate: null, 
    routeData: [], 
    isShowingRoute: false,
    isLoadingRoute: false 
  }),
  
  // Computed property untuk mendapatkan tanggal efektif
  getEffectiveDate: () => {
    const state = get();
    return state.selectedDate || getTodayDate();
  },
  
  // Computed property sebagai getter
  get currentDate() {
    const state = get();
    return state.selectedDate || getTodayDate();
  }
}));