import useSWR from "swr";
import { getStatusFeature } from "@/api/vehicle";

export const useVehicleRemoteStarter = (vehicleId: number | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    vehicleId ? `/vehicles/${vehicleId}/remote-starter/check` : null,
    () => getStatusFeature(vehicleId!),
    {
      refreshInterval: 5000, // Auto refresh every 5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
};