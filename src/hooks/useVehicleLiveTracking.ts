//useVehicleLiveTrack

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "@/lib/axios";

type VehicleData = {
  id: number;
  timestamp: string;
  latitude: string;
  longitude: string;
  speed: number;
  status: string;
  fuel_level?: string;
  odometer?: number;
  fuel_percent?: string;
  angle?: number;
  operating_time?: number;
  hourmeter?: string,
  vehicle_type?: string,
};

type TrackingResult = {
  trackingData: { telemetry: VehicleData } | null;
  isLoading: boolean;
};

export function useVehicleLiveTracking(vehicleId: number | null): TrackingResult {
  const [trackingData, setTrackingData] = useState<{ telemetry: VehicleData } | null>(null);
  // console.log(trackingData, "tracking data")
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const socketRef = useRef<Socket | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!vehicleId) return;

    const socket = io(import.meta.env.VITE_WEB_SOCKET);
    // console.log(socket, "socket")
    socketRef.current = socket;

    socket.on("connect", () => {
      // console.log("✅ WebSocket connected:", socket.id);
      // console.log("subscribe_vehicle", vehicleId.toString());
      socket.emit("subscribe_vehicle", vehicleId.toString());
    });

    socket.on("vehicle_update", (data: VehicleData) => {
      // console.log(data, "data vehicle_update ");
      if (data.id === vehicleId) {
        setTrackingData({ telemetry: data });
        lastUpdateRef.current = Date.now();
        setIsLoading(false);
      }
    });

    // socket.on("disconnect", () => {
    //   console.warn("🔌 WebSocket disconnected");
    // });

    // socket.on("connect_error", (err) => {
    //   console.error("❌ Connection error:", err.message);
    // });

    const fallbackInterval = setInterval(() => {
      const now = Date.now();
      const isStale = now - lastUpdateRef.current > 2_000;

      if (isStale) {
        // console.log("📡 WebSocket stale → fetching fallback from API...");
        axios
          .get(`vehicles/${vehicleId}/latest`)
          .then((res) => {
            // console.log("resp :",res)
            setTrackingData({ telemetry: res.data });
            setIsLoading(false);
          })
          .catch((err) => {
            console.error("❌ Error fetching fallback:", err);
          });
      }
    }, 5_000); // Cek setiap 5 detik

    return () => {
      socket.emit("unsubscribe_vehicle", vehicleId.toString());
      socket.disconnect();
      clearInterval(fallbackInterval);
    };
  }, [vehicleId]);

  return { trackingData, isLoading };
}
