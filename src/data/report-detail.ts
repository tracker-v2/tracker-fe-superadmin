// Mock data for different report types

// Bahan Bakar - Harian
export interface FuelDailyData {
  id: string;
  time: string;
  distance: number;
  fuelConsumption: number;
}


// Bahan Bakar - Bulanan
export interface FuelMonthlyData {
  id: string;
  date: string;
  distance: number;
  fuelConsumption: number;
}


// Bahan Bakar - Tahunan
export interface FuelYearlyData {
  id: string;
  month: string;
  distance: number;
  fuelConsumption: number;
}


// Perjalanan
export interface TravelData {
  id: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: string;
}

// Idle
export interface IdleData {
  id: string;
  startTime: string;
  endTime: string;
  location: string;
  idleTime: string;
}


