import axios from "@/lib/axios";

// Types for remote starter API
export interface RemoteStarterToggleRequest {
  code_confirm: string;
  action: "PROCESS_ON" | "PROCESS_OFF";
}

export interface RemoteStarterToggleResponse {
  success: boolean;
  message: string;
  data?: {
    vehicleId: number;
    action: "PROCESS_ON" | "PROCESS_OFF";
    timestamp: string;
  };
}

export interface RemoteStarterAvailabilityResponse {
  vehicleId: number;
  isAvailable: boolean;
  featureStatus: string;
}

/**
 * Toggle remote starter ON/OFF for a vehicle
 * @param vehicleId - The vehicle ID
 * @param codeConfirm - Confirmation code from user
 * @param action - Action to perform: "PROCESS_ON" or "PROCESS_OFF"
 */
export const toggleRemoteStarter = async (
  vehicleId: string | number,
  codeConfirm: string,
  action: "PROCESS_ON" | "PROCESS_OFF"
): Promise<RemoteStarterToggleResponse> => {
  const payload: RemoteStarterToggleRequest = {
    code_confirm: codeConfirm,
    action,
  };
  return axios.post(
    `/api/v1/vehicles/${vehicleId}/remote-starter/toggle`,
    payload
  );
};

/**
 * Check if remote starter feature is available for a vehicle
 * @param vehicleId - The vehicle ID
 */
export const checkRemoteStarterAvailability = async (
  vehicleId: string | number
): Promise<RemoteStarterAvailabilityResponse> => {
  const res = await axios.get(
    `/api/v1/vehicles/${vehicleId}/remote-starter/check`
  );
  return res.data.data;
};


