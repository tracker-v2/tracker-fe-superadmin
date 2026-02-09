"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Circle,
  CircleArrowRight,
  Share,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { VehicleActivity, VehicleDetail } from "@/types/types";
import { getVehicleActivityReport, getVehicleDetail } from "@/api/vehicle";
import { format } from "date-fns";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";
import { useVehicleStore } from "@/store/useVehicleStore";
import { useAuthStore } from "@/store/useAuthStore";

// Helper to format vehicle type for display
function formatVehicleType(type: string | undefined) {
  if (!type || type === "") return "";
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

// Normalize status to handle both formats
const normalizeStatus = (status: string): "on" | "off" | "idle" | "default" => {
  const statusUpper = status.toUpperCase();
  if (statusUpper === "OPERATING" || statusUpper === "ACTIVE") return "on";
  if (statusUpper === "STOPPED" || statusUpper === "INACTIVE") return "off";
  if (statusUpper === "IDLE") return "idle";
  return "default";
};

// Helper to get icon path
const getVehicleIconPath = (
  vehicleType: string | undefined,
  status: string = "default"
): string => {
  const finalVehicleType = vehicleType;

  if (!finalVehicleType || finalVehicleType === "") {
    return "/assets/icons/icon_car_default.webp";
  }

  const statusSuffix = normalizeStatus(status);
  const type = finalVehicleType.toLowerCase().replace(/_/g, "-");

  const iconMapping: { [key: string]: string } = {
    excavator: "exca",
    "dump-truck": "truck",
    bulldozer: "bulldozer",
    "pickup-truck": "car",
    truck: "truck",
    "wheel-loader": "wheel-loader",
    grader: "grader",
    "mobil-penumpang": "car",
    "mobil-beban": "car",
    "road-roller": "road-roller",
  };

  const iconName = iconMapping[type] || "car";

  return `/assets/icons/icon_${iconName}_${statusSuffix}.webp`;
};

interface VehicleProfilePageProps {
  vehicleDetail?: VehicleDetail;
  vehicleId?: number | null;
}

interface VehicleProfilePageProps {
  vehicleDetail?: VehicleDetail;
  vehicleId?: number | null;
}

const AktivitasBaruContent = ({
  activities,
  isLoading,
}: {
  activities: VehicleActivity[];
  isLoading: boolean;
}) => {
  // Helper function to format timestamp
  const formatDateTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "dd/MM/yyyy, HH:mm");
    } catch {
      return timestamp;
    }
  };

  // Helper component to get address from coordinates
  const LocationDisplay = ({ lat, lng }: { lat: string; lng: string }) => {
    const address = useReverseGeocode(parseFloat(lat), parseFloat(lng));
    return (
      <span className="text-xs text-gray-500">{address || "Memuat lokasi..."}</span>
    );
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Aktivitas Baru</h2>
      </div>
      <div className="p-4 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#253A8B]" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada aktivitas untuk ditampilkan
          </div>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-4 bg-white border-b">
                <h3 className="font-semibold text-gray-800">Perjalanan</h3>
                <span className="text-sm font-bold text-gray-700">
                  {activity.trip_distance.toFixed(2)} Km
                </span>
              </CardHeader>
              <CardContent className="p-4 bg-white space-y-3">
                <div className="flex items-start space-x-3">
                  <Circle className="w-4 h-4 mt-1 text-gray-400 fill-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Mulai {formatDateTime(activity.origin_timestamp)} {" "}
                      <LocationDisplay
                        lat={activity.origin_latitude}
                        lng={activity.origin_longitude}
                      />
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Circle className="w-4 h-4 mt-1 text-blue-600 fill-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Akhir {formatDateTime(activity.destination_timestamp)} {" "}
                      <LocationDisplay
                        lat={activity.destination_latitude}
                        lng={activity.destination_longitude}
                      />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const DetailKendaraanContent = ({
  detail,
  isLoading,
}: {
  detail: VehicleDetail;
  isLoading: boolean;
}) => {
  // Use vehicleType from fetched detail, but fallback to selectedVehicle type from store
  const selectedVehicleType = useVehicleStore((s) => s.selectedVehicle?.vehicle_type);
  const displayType = detail.vehicleType || selectedVehicleType;

  // Ambil trackingData dari store (jika ada) agar dialog menampilkan nilai yang sama
  // dengan panel detail (telemetry lebih real-time)
  const trackingData = useVehicleStore((s) => s.trackingData);

  const isMachine =
    displayType === "EXCAVATOR" ||
    displayType === "BULLDOZER" ||
    displayType === "WHEEL_LOADER" ||
    displayType === "GRADER";

  // Prioritaskan trackingData (telemetry) dari store; fallback ke lastOdometer / odometer dari detail
  const rawMeter = isMachine
    ? trackingData?.hourmeter ?? detail.lastOdometer ?? detail.odometer
    : trackingData?.odometer ?? detail.lastOdometer ?? detail.odometer;

  const meterDisplay = rawMeter !== undefined && rawMeter !== null
    ? isMachine
      ? Number(rawMeter).toFixed(2)
      : Number(rawMeter).toLocaleString()
    : "-";

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Detail Kendaraan</h2>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#253A8B]" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">General Info</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <Label>Plat Nomer / ID Kendaraan</Label>
                <Input
                  value={detail.licensePlate}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="col-span-3">
                <Label>{isMachine ? "Hourmeter" : "Odometer"}</Label>
                <div className="relative">
                  <Input value={meterDisplay} readOnly className="bg-gray-50 pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    {isMachine ? "Jam" : "Km"}
                  </span>
                </div>
              </div>
              <div>
                <Label>Tipe Kendaraan</Label>
                <Input
                  value={formatVehicleType(displayType)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="col-span-2">
                <Label>Kapasitas Tangki</Label>
                <div className="relative">
                  <Input
                    value={detail.fuelTank}
                    readOnly
                    className="bg-gray-50 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    L
                  </span>
                </div>
              </div>
              <div>
                <Label>Nomor Rangka</Label>
                <Input
                  value={detail.frameNumber}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Nomor Mesin</Label>
                <Input
                  value={detail.engineNumber}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Warna</Label>
                <Input value={detail.color} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Tahun</Label>
                <Input value={detail.year} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Merek</Label>
                <Input value={detail.brand} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Model</Label>
                <Input value={detail.model} readOnly className="bg-gray-50" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function VehicleProfilePage({
  vehicleDetail,
  vehicleId,
}: VehicleProfilePageProps) {
  // State untuk melacak tampilan mana yang aktif
  const [activeView, setActiveView] = useState<"aktivitas" | "detail">(
    "aktivitas"
  );
  const [isOpen, setIsOpen] = useState(false);

  // State untuk activities data
  const [activities, setActivities] = useState<VehicleActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // State untuk vehicle detail data
  const [detail, setDetail] = useState<VehicleDetail>({
    licensePlate: vehicleDetail?.licensePlate || "AB 9277 UH",
    odometer: vehicleDetail?.odometer || 145167,
    vehicleType: vehicleDetail?.vehicleType || "SUV",
    fuelTank: vehicleDetail?.fuelTank || 200,
    frameNumber: vehicleDetail?.frameNumber || "MHMFE71P18K007182",
    engineNumber: vehicleDetail?.engineNumber || "4D34TD66878",
    color: vehicleDetail?.color || "White",
    year: vehicleDetail?.year || 2019,
    brand: vehicleDetail?.brand || "Mitsubishi",
    model: vehicleDetail?.model || "FE 71 MT 4x2",
    image: vehicleDetail?.image,
  });
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Get vehicle status from store untuk icon
  const trackingData = useVehicleStore((s) => s.trackingData);
  // trackingData.status may be unknown typed; ensure we pass a string to getVehicleIconPath
  const vehicleStatus = typeof trackingData?.status === "string" ? trackingData.status : "idle";

  // Gunakan vehicleType dari detail atau dari store
  const selectedVehicleType = useVehicleStore((s) => s.selectedVehicle?.vehicle_type);
  const displayVehicleType = detail.vehicleType || selectedVehicleType;

  // Generate icon path berdasarkan vehicle type dan status
  const vehicleIconPath = getVehicleIconPath(displayVehicleType, vehicleStatus);

  // Fetch vehicle detail 
  useEffect(() => {
    const companyId = useAuthStore((s) => s.user?.companyId);

    const fetchVehicleDetail = async () => {
      if (!vehicleId || !isOpen || !companyId) return;

      setIsLoadingDetail(true);
      try {
        console.log("Fetching vehicle detail for:", vehicleId);
        const data = await getVehicleDetail(vehicleId, companyId);
        console.log("Vehicle detail received:", data);
        setDetail({
          id: data.id,
          companyId: data.companyId,
          licensePlate: data.licensePlate,
          odometer: data.odometer,
          vehicleType: data.vehicleType,
          fuelTank: data.fuelTank,
          frameNumber: data.frameNumber,
          engineNumber: data.engineNumber,
          color: data.color,
          year: data.year,
          brand: data.brand,
          model: data.model,
          image: data.image,
          lastOdometer: data.lastOdometer,
        });
      } catch (error) {
        console.error("Error fetching vehicle detail:", error);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    if (isOpen && activeView === "detail") {
      fetchVehicleDetail();
    }
  }, [vehicleId, activeView, isOpen]);

  // Fetch activities 
  useEffect(() => {
    const fetchActivities = async () => {
      if (!vehicleId || !isOpen) return;

      setIsLoadingActivities(true);
      try {
        // Get today's date in YYYY-MM-DD format
        const today = format(new Date(), "yyyy-MM-dd");
        const data = await getVehicleActivityReport(vehicleId, today);
        console.log("Activities data received:", data);
        setActivities(data || []);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    if (isOpen && activeView === "aktivitas") {
      fetchActivities();
    }
  }, [vehicleId, activeView, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-800 text-xs flex items-center cursor-pointer"
        >
          <CircleArrowRight className="w-3 h-3" />
          <span>Pergi ke Profil</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[80vw] max-w-[80vw] h-[90vh] max-h-[90vh] p-6 overflow-hidden">
        <div className="flex w-full h-full overflow-hidden">
          {/* Sidebar Kiri (Navigasi) */}
          <aside className="w-72 flex-shrink-0 border-r bg-white p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Info Kendaraan dengan Icon Berdasarkan Vehicle Type */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-transparent border-0 p-0">
                    <img
                      src={vehicleIconPath}
                      alt={`${displayVehicleType || 'Vehicle'} icon`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback jika gambar tidak ditemukan
                        e.currentTarget.src = '/assets/icons/icon_car_default.webp';
                      }}
                    />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-md font-semibold">
                    {detail.licensePlate}
                  </h2>
                  <p className="text-gray-500 text-xs">
                    {detail.brand} {detail.model}, {detail.year} •{" "}
                    {detail.color}
                  </p>
                </div>
              </div>

              {/* Tombol Aksi */}
              <Button variant="outline" className="w-full">
                <Share className="w-4 h-4 mr-2" />
                Bagikan Lokasi
              </Button>

              {/* Menu Navigasi */}
              <nav className="flex flex-col space-y-1 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setActiveView("aktivitas")}
                  className={cn(
                    "w-full justify-start text-sm",
                    activeView === "aktivitas"
                      ? "bg-gray-100 font-semibold text-gray-900"
                      : "text-gray-600"
                  )}
                >
                  Aktivitas Baru
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveView("detail")}
                  className={cn(
                    "w-full justify-start text-sm",
                    activeView === "detail"
                      ? "bg-gray-100 font-semibold text-gray-900"
                      : "text-gray-600"
                  )}
                >
                  Detail Kendaraan
                </Button>
              </nav>
            </div>
          </aside>

          {/* Konten Kanan (Area Tampilan) */}
          <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
            {/* Render konten secara kondisional berdasarkan state 'activeView' */}
            {activeView === "aktivitas" && (
              <AktivitasBaruContent
                activities={activities}
                isLoading={isLoadingActivities}
              />
            )}
            {activeView === "detail" && (
              <DetailKendaraanContent
                detail={detail}
                isLoading={isLoadingDetail}
              />
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}