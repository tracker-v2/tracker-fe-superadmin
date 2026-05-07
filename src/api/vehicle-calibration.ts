import axios from "@/lib/axios";

// Types
export interface FuelCalibrationResponse {
  id: number;
  vehicleId: number;
  fuelCalibrationCoefficients: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFuelCalibrationRequest {
  fuelCalibrationCoefficients: number[];
}

export interface UpdateFuelCalibrationRequest {
  fuelCalibrationCoefficients: number[];
}

// CREATE Fuel Calibration
export const createFuelCalibrationApi = async (
  vehicleId: number,
  data: CreateFuelCalibrationRequest
): Promise<FuelCalibrationResponse> => {
  const res = await axios.post(
    `/vehicles/${vehicleId}/fuel-calibration`,
    data
  );
  return res.data.data;
};

// GET Fuel Calibration
export const getFuelCalibrationApi = async (
  vehicleId: number
): Promise<FuelCalibrationResponse> => {
  const res = await axios.get(`/vehicles/${vehicleId}/fuel-calibration`);
  return res.data.data;
};

// UPDATE Fuel Calibration
export const updateFuelCalibrationApi = async (
  vehicleId: number,
  data: UpdateFuelCalibrationRequest
): Promise<FuelCalibrationResponse> => {
  const res = await axios.put(
    `/vehicles/${vehicleId}/fuel-calibration`,
    data
  );
  return res.data.data;
};

// DELETE Fuel Calibration
export const deleteFuelCalibrationApi = async (
  vehicleId: number
): Promise<void> => {
  await axios.delete(`/vehicles/${vehicleId}/fuel-calibration`);
};