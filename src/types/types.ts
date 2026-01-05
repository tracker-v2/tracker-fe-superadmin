export interface Vehicle {
  logs_data: any;
  id: number;
  lat: number;
  lng: number;
  license_plate: string;
  status: "active" | "idle" | "inactive";
  company_name?: string;  // ✅ Tambahan
  brand?: string;         // ✅ Tambahan
  model?: string;         // ✅ Tambahan
  odometer?: string; 
  hourmeter?: string; 
  vehicle_type?: string; 
}

export type VehicleLogData = {
  latitude: string;
  longitude: string;
  status: "OPERATING" | "STOPPED" | "IDLE";
};

export interface VehicleApiResponse {
  hourmeter?: string;
  odometer?: string;
  vehicle_type?: string;
  vehicle_id: number;
  license_plate: string;
  company_name: string;    // ✅ Tambahkan
  brand: string;           // ✅ Tambahkan
  model: string;           // ✅ Tambahkan
  logs_data: {
    hourmeter?: string;
    odometer?: string;
    vehicle_type?: string;
    log_vehicle_id: number;
    status: string;
    latitude: string;
    longitude: string;
  };
}

export type VehicleTypeDetailVehicle = {
  imei: string;
  simNumber: string;
  fuelTank: number;
}

export type TrackingTypeVehicleData = {
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export type PaginateRequest<T = unknown> = T & { page: number; limit: number }; 

export type PaginateResponse<T> = {
  data: T[];
  meta: {
    total: number;
  }
}

// Vehicle Activity Report Types
export interface ActivityLog {
  timestamp: string;
  status: "OPERATING" | "STOPPED" | "IDLE";
  latitude: string;
  longitude: string;
  odometer: number;
}

export interface VehicleActivity {
  id: number;
  vehicle_id: number;
  origin_timestamp: string;
  origin_latitude: string;
  origin_longitude: string;
  destination_timestamp: string;
  destination_latitude: string;
  destination_longitude: string;
  trip_distance: number;
  idle_time: number;
  stopped_time: number;
  operating_time: number;
  logs: ActivityLog[];
}

export interface VehicleDetail {
  id?: number;
  companyId?: number;
  licensePlate?: string;
  odometer?: number;
  vehicleType?: string;
  fuelTank?: number;
  frameNumber?: string;
  engineNumber?: string;
  color?: string;
  year?: number;
  brand?: string;
  model?: string;
  image?: string;
  lastOdometer?:number;
}