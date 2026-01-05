import { DailyFuelItem } from "@/pages/laporan/komponen-detail/table-harian-bahan-bakar";
import { MonthlyFuelItem } from "@/pages/laporan/komponen-detail/table-bulanan-bahan-bakar";
import { YearlyFuelItem } from "@/pages/laporan/komponen-detail/table-tahunan-bahan-bakar";


export interface YearlyFuelReportResponse {
  vehicleId: number;
  year: string;
  totalFuelConsumption: number;
  totalTripDistance: number;
  monthlyReport: YearlyFuelItem[];
}

export interface MonthlyFuelReportResponse {
  // data: any;
  vehicleId: number;
  month: string;
  totalFuelConsumption: number;
  totalTripDistance: number;
  report: MonthlyFuelItem[];
}

export interface MonthlyFuelItems {
  date: string;
  tripDistance: number;
  fuelConsumption: number;
}

export interface MonthlyFuelData {
  vehicleId: number;
  month: string;
  totalFuelConsumption: number;
  totalTripDistance: number;
  report: MonthlyFuelItems[];
}

export interface MonthlyFuelReportResponses {
  data: MonthlyFuelData;
  status: boolean;
  message: string;
}


export interface DailyFuelReportResponse {
  vehicleId: number;
  date: string;
  totalFuelConsumption: number;
  totalTripDistance: number;
  report: DailyFuelItem[];
}

export type IdleSession = {
  startTime: string;
  endTime: string;
  idleTime: string;
  location: {
    latitude: string;
    longitude: string;
    address: string;
  };
};

export type IdleDetail = IdleSession;

export type RawIdleSession = {
  startTime: string;
  endTime: string;
  idleTime: string;
  location: {
    latitude: string;
    longitude: string;
  };
};
