import axios from "@/lib/axios";

export interface StarterControlResponse {
  vehicleId: number;
  controlStarter: "PROCESS_ON" | "PROCESS_OFF" | "UPDATED_ON" | "UPDATED_OFF";
  createdAt: string;
  updatedAt: string;
}

export interface CreateStarterControlRequest {
  controlStarter: "PROCESS_ON" | "PROCESS_OFF" | "UPDATED_ON" | "UPDATED_OFF";
}

// CREATE Starter Control (endpoint belum ada di BE)
export const createStarterControlApi = async (
  vehicleId: number,
  data: CreateStarterControlRequest
): Promise<StarterControlResponse> => {
  const res = await axios.post(
    `/vehicles/${vehicleId}/starter-control`,
    data
  );
  return res.data.data;
};

// GET Starter Control (endpoint belum ada di BE)
export const getStarterControlApi = async (
  vehicleId: number
): Promise<StarterControlResponse> => {
  const res = await axios.get(`/vehicles/${vehicleId}/starter-control`);
  return res.data.data;
};

// UPDATE Starter Control (endpoint belum ada di BE)
export const updateStarterControlApi = async (
  vehicleId: number,
  data: CreateStarterControlRequest
): Promise<StarterControlResponse> => {
  const res = await axios.put(
    `/vehicles/${vehicleId}/starter-control`,
    data
  );
  return res.data.data;
};

// DELETE Starter Control (endpoint belum ada di BE)
export const deleteStarterControlApi = async (
  vehicleId: number
): Promise<void> => {
  await axios.delete(`/vehicles/${vehicleId}/starter-control`);
};