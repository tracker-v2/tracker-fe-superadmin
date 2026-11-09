// Form data types untuk kendaraan
export type DtcProtocol = "J1939" | "OBD2";

export interface KendaraanFormData {
  vehicleId?: number;
  licensePlate: string;
  description: string;
  vehicleType?: string;
  odometer?: string;
  hourmeter?: string;
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
  onOffProcess?: string;
  vehicleModelId?: number;
  image?: string;
  imei?: string;
  simNumber?: string;
  hasObd?: boolean; // [OBD]
  dtcProtocol?: DtcProtocol | null; // [OBD]
  customerId?: number | null;
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
  customerId?: number | null;
  customerName?: string | null;
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
