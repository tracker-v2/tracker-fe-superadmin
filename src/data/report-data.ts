// Define types for each report type
export interface FuelReport {
  id: number; // ID record laporan
  vehicleId: number; // ID kendaraan yang dibutuhkan API download
  noPolisi: string;
  namaKendaraan: string;
  totalKonsumsi: number;
  jarakTempuh: number;
}

export interface TravelReport {
  id: number;
  vehicleId: number;
  noPolisi: string;
  namaKendaraan: string;
  jarakTempuh: number;
  jumlahPerjalanan: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  driveTime: string;
  idleTime: string;
  stopTime: string;
  durasi: string;
}

export interface IdleReport {
  id: number;
  vehicleId: number;
  noPolisi: string;
  tanggal: string;
  koordinat: {
    lat: number | null;
    lon: number | null;
  };
  totalIdle: string;
}

// Define the structure of the entire data object
export interface ReportData {
  "Bahan Bakar": FuelReport[];
  Perjalanan: TravelReport[];
  Idle: IdleReport[];
}
