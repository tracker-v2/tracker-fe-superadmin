// Form data types untuk kendaraan

export interface KendaraanFormData {
  vehicleId?: number;
  licensePlate: string;
  description: string;
  vehicleType?: string;
  odometer?: string;
  tankCapacity?: string;
  frameNumber: string;
  engineNumber: string;
  color: string;
  year: number;
  brand?: string;
  model?: string;
  markingNumber: string;
  hasFuel?: boolean;
  hasOnOff?: boolean;
  fuelCalibration?: string;
  vehicleModelId?: number;
  image: string;
  imei?: string;
  simNumber?: string;
}

export interface ModelKendaraanFormData {
  vehicleType: string;
  brand: string;
  model: string;
  fuelTankCapacity: string;
  numberOfWheels: string;
  enginePower: string;
  torque: string;
}

export interface Vehicle {
  id: number;
  companyId: number;
  licensePlate: string;
  description: string | null;
  image: string;
  vehicleType: string;
  fuelTank: number;
  frameNumber: string;
  engineNumber: string;
  color: string;
  year: number;
  brand: string;
  model: string;
  lastOdometer: number;
  markingNumber: string;
  enginePower?: number;
  tireCount?: number;
  torque?: number;
}
