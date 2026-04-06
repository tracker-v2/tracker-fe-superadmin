export interface Vehicle {
  logs_data: Record<string, unknown>;
  id: number;
  lat: number;
  lng: number;
  license_plate: string;
  status: "active" | "idle" | "inactive";
  company_name?: string;
  brand?: string;       
  model?: string;       
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
  company_name: string;
  brand: string;       
  model: string;       
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

// Device Types
export interface DeviceModel {
  id: number;
  model: string;
  brand: string;
}

export interface DeviceVehicle {
  id: number;
  name: string;
}
// Device Enums
export type CommunicationType = "GSM";
export type IdentifierType = "IMEI" | "ICCID"; // Atau type lain sesuai backend

// Device Feature
export interface DeviceFeature {
  id: number;
  deviceId: number;
  featureId: number;
  deviceModelPinoutId: number;
  createdAt: Date;
  updatedAt: Date | null;
}

// Device GSM
export interface DeviceGsm {
  id: number;
  deviceId: number;
  simNumber: string;
  simProvider: string;
  createdAt: Date;
  updatedAt: Date | null;
}

// Device Identifier
export interface DeviceIdentifier {
  id: number;
  deviceId: number;
  identifierType: IdentifierType;
  value: string;
  createdAt: Date;
  updatedAt: Date | null;
}

// Device Model
export interface DeviceModel {
  id: number;
  model: string;
  brand: string;
}

// Device Vehicle
export interface DeviceVehicle {
  id: number;
  name: string;
}

// Device - Basic (untuk list view)
export interface Device {
  id: number;
  name: string;
  communicationType: CommunicationType;
  isActive: boolean;
  deviceModelId: number;
  vehicleId: number;
  createdAt?: Date;
  updatedAt?: Date | null;
}

// Device Detail - Extended (dengan relasi)
export interface DeviceDetail extends Device {
  deviceModel: DeviceModel;
  vehicle: DeviceVehicle;
  deviceFeatures: DeviceFeature[];
  deviceGsm: DeviceGsm[];
  deviceIdentifiers: DeviceIdentifier[];
}

// Create Request
export interface CreateDeviceRequest {
  name: string;
  communicationType: CommunicationType;
  deviceModelId: number;
  vehicleId: number;
  isActive?: boolean;
}

// Update Request
export interface UpdateDeviceRequest {
  name?: string;
  communicationType?: CommunicationType;
  deviceModelId?: number;
  vehicleId?: number;
  isActive?: boolean;
}