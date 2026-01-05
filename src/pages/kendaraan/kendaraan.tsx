// types
import { Vehicle, VehicleApiResponse } from "@/types/types";

// components
import VehicleMap2 from "@/components/vehicle-map2";

// ui components
import { Button } from "@/components/ui/button";
import UpdatedLaporanModal from "@/components/laporan-modal-activity";
// icons
import { Car, Files } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getVehiclesApi } from "@/api/vehicle";
import { fetchActivityDetail, fetchReportActivitySection } from "@/api/activity";
import { useAuthStore } from "@/store/useAuthStore";
import { useRightbarStore } from "@/store/useRightStore";
import { useUIStore } from "@/store/useUIStore";
import { useVehicleStore } from "@/store/useVehicleStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VehicleStatusTimeline from "@/components/vehicle-timeline";
import VehicleMonitoringChart from "@/components/vehicle-grafics";

// Interface untuk activity detail
interface ActivityDetail {
  total_kilometer: number;
  duration_off: number;
  operating_time: number;
  duration_idle: number;
  total_duration_active: number;
}



export const Kendaraan = () => {
  const companyId = useAuthStore((s) => s.user?.companyId);
  const activeTab = useVehicleStore((s) => s.activeTab);

  // Ambil vehicles dari store untuk sinkronisasi
  const vehicles = useVehicleStore((s) => s.vehicles);
  const setVehicles = useVehicleStore((s) => s.setVehicles);

  // Ambil data untuk activity detail
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const selectedDate = useVehicleStore((s) => s.selectedDate);

  const [hiddenStatus, setHiddenStatus] = useState<string[]>([]);
  const search = useRightbarStore((s) => s.search);
  const selectedTypes = useRightbarStore((s) => s.selectedTypes); // ✅ Ubah dari searchType
  const setShowTopbar = useUIStore((s) => s.setShowTopbar);
  const showTopbar = useUIStore((s) => s.showTopbar);
  const dateToUse = selectedDate || new Date().toISOString().split("T")[0];
  const [isLaporanModalOpen, setIsLaporanModalOpen] = useState(false);

  // State untuk activity detail
  const [activityDetail, setActivityDetail] = useState<ActivityDetail | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    setShowTopbar(!selectedVehicleId);
  }, [selectedVehicleId, setShowTopbar]);

  const setRightbarVehicles = useRightbarStore((s) => s.setVehicles);

  // Load initial vehicles data
  useEffect(() => {
    if (companyId) {
      getVehiclesApi(companyId).then((data) => {
        const mapped: Vehicle[] = data.map((item: VehicleApiResponse) => {
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
            vehicle_type: logsData.vehicle_type || item.vehicle_type || "",
            odometer: logsData.odometer || item.odometer || 0,
            hourmeter: logsData.hourmeter || item.hourmeter || 0,
            status: logsData.status === "OPERATING" ? "active" : logsData.status === "STOPPED" ? "inactive" : "idle",
          };
        });

        setVehicles(mapped);
        setRightbarVehicles(mapped);
      });
    }
  }, [companyId, setVehicles, setRightbarVehicles]);

  // Fetch activity detail when selectedVehicleId or selectedDate changes
  useEffect(() => {
    const fetchActivityData = async () => {
      if (!selectedVehicleId) {
        setActivityDetail(null);
        return;
      }

      setLoadingActivity(true);
      try {
        const dateToUse = selectedDate || new Date().toISOString().split("T")[0];
        const result = await fetchActivityDetail(selectedVehicleId, dateToUse);
        setActivityDetail(result);
      } catch (error) {
        console.error("Error fetching activity detail:", error);
        setActivityDetail(null);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchActivityData();
  }, [selectedVehicleId, selectedDate]);

  // Filter vehicles berdasarkan state + selectedTypes
  // Dan deduplikasi untuk menghindari duplikat dari API
  const filteredVehicles = useMemo(() => {
    if (selectedVehicleId) {
      return vehicles.filter((v) => v.id === selectedVehicleId);
    }

    return vehicles
      .filter((v) => {
        // Filter berdasarkan status (hide/show)
        const matchesStatus = !hiddenStatus.includes(v.status);

        // Filter berdasarkan search text
        const matchesSearch = v.license_plate.toLowerCase().includes(search.toLowerCase());

        // Filter berdasarkan vehicle type - gunakan langsung dari database
        let vehicleType = v.vehicle_type || "";

        // Jika vehicle type kosong atau tidak ada di filter options, masukkan ke LAINNYA
        const knownTypes = ["EXCAVATOR", "DUMP_TRUCK", "BULLDOZER", "WHEEL_LOADER", "GRADER", "ROAD_ROLLER", "MOBIL_BEBAN", "MOBIL_PENUMPANG", "MPV", "PICKUP_TRUCK",];
        if (!vehicleType || !knownTypes.includes(vehicleType)) {
          vehicleType = "LAINNYA";
        }

        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(vehicleType);

        return matchesStatus && matchesSearch && matchesType;
      })
      .filter((v, index, self) =>
        // Deduplikasi: ambil item pertama untuk setiap ID unik
        index === self.findIndex((vehicle) => vehicle.id === v.id)
      );
  }, [vehicles, hiddenStatus, search, selectedTypes, selectedVehicleId]);

  // ✅ Fungsi untuk toggle visibility status
  const toggleVisibility = (status: string) => {
    setHiddenStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));
  };

  // Hitung stats dari filteredVehicles (sync dengan filter di rightbar)
  const activeVehicles = filteredVehicles.filter((v) => v.status === "active").length;
  const idleVehicles = filteredVehicles.filter((v) => v.status === "idle").length;
  const inactiveVehicles = filteredVehicles.filter((v) => v.status === "inactive").length;

  // Format duration dalam detik ke format jam:menit:detik
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className='p-4 h-full '>
      <div className=' rounded-xl bg-white p-6 flex flex-col h-full w-full'>
        {showTopbar && (
          <div className='flex mb-4 flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between'>
            <div className='bg-[#F9FAFB] border border-[#E2E8F0] py-4 px-2 rounded-md flex flex-col items-center justify-center mb-4 md:mb-0 md:mr-4 w-32'>
              <p className='font-medium text-sm text-center'>Total Kendaraan</p>
              <p className='font-medium text-xl'>{filteredVehicles.length}</p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
              <div className='flex flex-col p-2 items-center border border-[#E0E0E0] py-3 rounded-md'>
                <div className='flex justify-between w-full gap-2 mb-2'>
                  <span className='bg-[#DEFCD8] p-2 rounded-md flex-shrink-0'>
                    <Car color='#16A34A' absoluteStrokeWidth />
                  </span>
                  <div className='flex-grow min-w-0'>
                    <p className='text-sm whitespace-nowrap'>Kendaraan Beroperasi</p>
                    <p className='font-medium'>{activeVehicles}</p>
                  </div>
                </div>
                <Button
                  size='sm'
                  className={`flex-shrink-0 w-full ${hiddenStatus.includes("active") ? "bg-white text-black hover:bg-green-50 border" : "bg-green-600 hover:bg-green-700"}`}
                  onClick={() => toggleVisibility("active")}
                >
                  {hiddenStatus.includes("active") ? "Tampilkan" : "Sembunyikan"}
                </Button>
              </div>

              <div className='flex flex-col p-2 items-center border border-[#E0E0E0] py-3 rounded-md'>
                <div className='flex justify-between w-full gap-2 mb-2'>
                  <span className='bg-yellow-100 p-2 rounded-md flex-shrink-0'>
                    <Car color='#EAB308' absoluteStrokeWidth />
                  </span>
                  <div className='flex-grow min-w-0'>
                    <p className='text-sm whitespace-nowrap'>Kendaraan Idle</p>
                    <p className='font-medium'>{idleVehicles}</p>
                  </div>
                </div>
                <Button
                  size='sm'
                  className={`flex-shrink-0 w-full ${hiddenStatus.includes("idle") ? "bg-white text-black hover:bg-yellow-50 border" : "bg-yellow-500 hover:bg-yellow-600"}`}
                  onClick={() => toggleVisibility("idle")}
                >
                  {hiddenStatus.includes("idle") ? "Tampilkan" : "Sembunyikan"}
                </Button>
              </div>

              <div className='flex flex-col p-2 items-center border border-[#E0E0E0] py-3 rounded-md'>
                <div className='flex justify-between w-full gap-2 mb-2'>
                  <span className='bg-red-100 p-2 rounded-md flex-shrink-0'>
                    <Car color='#DC2626' absoluteStrokeWidth />
                  </span>
                  <div className='flex-grow min-w-0'>
                    <p className='text-sm whitespace-nowrap'>Kendaraan Mati</p>
                    <p className='font-medium'>{inactiveVehicles}</p>
                  </div>
                </div>
                <Button
                  size='sm'
                  className={`flex-shrink-0 w-full ${hiddenStatus.includes("inactive") ? "bg-white text-black hover:bg-red-50 border" : "bg-red-600 hover:bg-red-700"}`}
                  onClick={() => toggleVisibility("inactive")}
                >
                  {hiddenStatus.includes("inactive") ? "Tampilkan" : "Sembunyikan"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className='w-full flex-1 rounded-md overflow-hidden relative z-0'>
          <VehicleMap2 vehicleLocations={filteredVehicles} />
        </div>

        {activeTab === "activity" && (
          <div className='mt-4 p-4 border rounded '>
            <Tabs defaultValue='riwayat'>
              <div className='flex items-center justify-between'>
                {/* Tabs section */}
                <TabsList className='flex gap-2  '>
                  <TabsTrigger value='riwayat'>Riwayat</TabsTrigger>
                  <TabsTrigger value='grafik'>Grafik</TabsTrigger>
                  <TabsTrigger value='laporan'>Laporan</TabsTrigger>
                </TabsList>

                {/* Info section dengan data dari API */}
                <div className='flex gap-6 text-sm text-right'>
                  {loadingActivity ? (
                    <div className='text-gray-500'>Loading...</div>
                  ) : (
                    <>
                      <div>
                        <div className='font-semibold'>{activityDetail?.total_kilometer ?? "0"} KM</div>
                        <div className='text-gray-600'>Total Kilometer</div>
                      </div>
                      <div>
                        <div className='font-semibold'>{activityDetail ? formatDuration(activityDetail.duration_off) : "00:00:00"}</div>
                        <div className='text-gray-600'>Durasi Mesin Mati</div>
                      </div>
                      <div>
                        <div className='font-semibold'>{activityDetail ? formatDuration(activityDetail.operating_time) : "00:00:00"}</div>
                        <div className='text-gray-600'>Durasi Beroperasi</div>
                      </div>
                      <div>
                        <div className='font-semibold'>{activityDetail ? formatDuration(activityDetail.duration_idle) : "00:00:00"}</div>
                        <div className='text-gray-600'>Durasi Idle</div>
                      </div>
                      <div>
                        <div className='font-semibold'>{activityDetail ? formatDuration(activityDetail.total_duration_active) : "00:00:00"}</div>
                        <div className='text-gray-600'>Durasi Mesin Aktif</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tab content */}
              <TabsContent value='riwayat'>
                <div>
                  <VehicleStatusTimeline />
                </div>
              </TabsContent>
              <TabsContent value='grafik'>
                <VehicleMonitoringChart />
              </TabsContent>
              <TabsContent value='laporan'>
                <div className='w-full h-fit p-6 '>
                  <div className=' flex  justify-center h-full  items-center '>
                    <div className='flex flex-col items-center'>
                      <Files color='#205986' size={56} />
                      <Button
                        className='mt-5 bg-[#205986] px-12 hover:bg-[#2d87cc]'
                        onClick={() => setIsLaporanModalOpen(true)}
                      >
                        Lihat Laporan
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Updated Modal Laporan with API Integration */}
                <UpdatedLaporanModal
                  isOpen={isLaporanModalOpen}
                  onClose={() => setIsLaporanModalOpen(false)}
                  vehicleId={selectedVehicleId}
                  selectedDate={dateToUse}
                  fetchReportActivitySection={fetchReportActivitySection}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};