import { useMap } from "react-leaflet";
import { useEffect } from "react";
import { Vehicle } from "@/types/types";

export const FitBoundsToVehicles = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const map = useMap();

  useEffect(() => {
    if (vehicles.length === 0) return;

    const bounds = vehicles.map((v) => [v.lat, v.lng]) as [number, number][];
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [vehicles, map]);

  return null;
};
