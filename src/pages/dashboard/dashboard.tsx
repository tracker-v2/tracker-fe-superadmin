// types
import { Vehicle, VehicleApiResponse } from "@/types/types";

// components
import VehicleMap from "@/components/vehicle-map ";

// ui components
import { Button } from "@/components/ui/button";

// icons
import { Car } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getVehiclesApi } from "@/api/vehicle";

const Dashboard = () => {
  const companyId = useAuthStore((s) => s.user?.companyId);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [hiddenStatus, setHiddenStatus] = useState<string[]>([]);

  // Filter visible vehicles
  const visibleVehicles = vehicles.filter(
    (v) => !hiddenStatus.includes(v.status)
  );

  // Toggle visibility of vehicle status
  const toggleVisibility = (status: string) => {
    setHiddenStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  useEffect(() => {
    if (companyId) {
      getVehiclesApi(companyId).then((data) => {
        // console.log("Raw API data:", data); // Debug: cek data mentah dari API

        const mapped: Vehicle[] = data.map((item: VehicleApiResponse) => {
          // console.log("Mapping item:", item); // Debug: cek setiap item

          // Handle case ketika logs_data null/kosong (websocket tidak ada data)
          const logsData = item.logs_data || {};

          return {
            id: item.vehicle_id,
            lat: parseFloat(logsData.latitude || "0"),
            lng: parseFloat(logsData.longitude || "0"),
            license_plate: item.license_plate,
            company_name: item.company_name,
            brand: item.brand,
            model: item.model,
            vehicle_type: logsData.vehicle_type || item.vehicle_type || '',
            odometer: logsData.odometer || item.odometer || 0, // ✅ Cek di logs_data atau root
            hourmeter: logsData.hourmeter || item.hourmeter || 0, // ✅ Cek di logs_data atau root
            status:
              logsData.status === "OPERATING"
                ? "active"
                : logsData.status === "STOPPED"
                  ? "inactive"
                  : "idle",
          };
        });

        // Deduplikasi: ambil item pertama untuk setiap ID unik
        const uniqueVehicles = mapped.filter((v, index, self) =>
          index === self.findIndex((vehicle) => vehicle.id === v.id)
        );

        // console.log("Mapped vehicles:", uniqueVehicles); // Debug: cek hasil mapping
        setVehicles(uniqueVehicles);
      });
    }
  }, [companyId]);

  // Count vehicles by status
  const activeVehicles = vehicles.filter((v) => v.status === "active").length;
  const idleVehicles = vehicles.filter((v) => v.status === "idle").length;
  const inactiveVehicles = vehicles.filter(
    (v) => v.status === "inactive"
  ).length;

  return (
    <div className="w-full h-full rounded-md px-[20px] bg-white py-[20px] flex flex-col space-y-4">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between">
        <div className="bg-[#F9FAFB] border border-[#E2E8F0] px-4 py-3 rounded-md flex flex-col items-center w-full md:w-auto">
          <p className="font-semibold text-base">Total Kendaraan</p>
          <p className="font-semibold text-lg">{vehicles.length}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-4 border border-[#E0E0E0] px-4 py-3 rounded-md">
            <span className="bg-[#DEFCD8] p-2 rounded-md flex-shrink-0">
              <Car color="#16A34A" absoluteStrokeWidth />
            </span>
            <div className="flex-grow min-w-0">
              <p className="text-sm whitespace-nowrap">Kendaraan <br /> Beroperasi</p>
              <p className="font-semibold">{activeVehicles}</p>
            </div>
            <Button
              size="sm"
              className={`flex-shrink-0 min-w-[110px] text-center ${hiddenStatus.includes("active")
                ? "bg-white text-black hover:bg-green-50 border"
                : "bg-green-600 hover:bg-green-700"
                }`}
              onClick={() => toggleVisibility("active")}
            >
              {hiddenStatus.includes("active") ? "Tampilkan" : "Sembunyikan"}
            </Button>
          </div>

          <div className="flex items-center space-x-4 border border-[#E0E0E0] px-4 py-3 rounded-md">
            <span className="bg-yellow-100 p-2 rounded-md flex-shrink-0">
              <Car color="#EAB308" absoluteStrokeWidth />
            </span>
            <div className="flex-grow min-w-0">
              <p className="text-sm whitespace-nowrap">Kendaraan Idle</p>
              <p className="font-semibold">{idleVehicles}</p>
            </div>
            <Button
              size="sm"
              className={`flex-shrink-0 min-w-[110px] text-center ${hiddenStatus.includes("idle")
                ? "bg-white text-black hover:bg-yellow-50 border"
                : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              onClick={() => toggleVisibility("idle")}
            >
              {hiddenStatus.includes("idle") ? "Tampilkan" : "Sembunyikan"}
            </Button>
          </div>

          <div className="flex items-center space-x-4 border border-[#E0E0E0] px-4 py-3 rounded-md">
            <span className="bg-red-100 p-2 rounded-md flex-shrink-0">
              <Car color="#DC2626" absoluteStrokeWidth />
            </span>
            <div className="flex-grow min-w-0">
              <p className="text-sm whitespace-nowrap">Kendaraan Mati</p>
              <p className="font-semibold">{inactiveVehicles}</p>
            </div>
            <Button
              size="sm"
              className={`flex-shrink-0 min-w-[110px] text-center ${hiddenStatus.includes("inactive")
                ? "bg-white text-black hover:bg-red-50 border"
                : "bg-red-600 hover:bg-red-700"
                }`}
              onClick={() => toggleVisibility("inactive")}
            >
              {hiddenStatus.includes("inactive") ? "Tampilkan" : "Sembunyikan"}
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full h-full rounded-md overflow-hidden relative z-0">
        <VehicleMap vehicleLocations={visibleVehicles} />
      </div>
    </div>
  );
};

export default Dashboard;
