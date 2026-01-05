import { useEffect, useState } from "react";
import { getVehiclesDetailApi } from "@/api/vehicle";

export const useVehicleDetail = (vehicleId: number | null) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vehicleId) return;

    setLoading(true);
    getVehiclesDetailApi(vehicleId)
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  return { vehicleDetail: data, isLoading: loading };
};
