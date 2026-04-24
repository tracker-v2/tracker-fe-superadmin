import axios from "@/lib/axios";

// request body
// control-starter
export const toggleRemoteStarter = async (vehicleId: string | number) => {
  return axios.post(`/api/v1/vehicles/${vehicleId}/remote-starter/toggle`);
};


