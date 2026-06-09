import { useVehicleStore } from "@/store/useVehicleStore";
import { useVehicleLiveTracking } from "@/hooks/useVehicleLiveTracking";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";
import { useVehicleRemoteStarter } from "@/hooks/useVehicleRemoteStarter";
import { MapPin, Share2, Power, PowerOff, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VehicleDetailSection } from "./vehicle-detial-section";
import { VehicleActivitySection } from "./vehicle-activity-section";
import { useVehicleDetail } from "@/hooks/useVehicleDetail";
import { getStatusStyle } from "@/lib/helper";
import { useEffect, useState } from "react";
import { getMachineActiveVehicle, toggleVehicleStarter } from "@/api/vehicle";
import VehicleProfileDialog from "./vehicle-profile-dialog";
import { ConfirmCodeDialog } from "./confirm-code-dialog";
import { toast } from "sonner";

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
  status: string
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

export const VehicleDetail = () => {
  const vehicle = useVehicleStore((s) => s.selectedVehicle);
  const updateVehiclePosition = useVehicleStore((s) => s.updateVehiclePosition);
  const setTrackingData = useVehicleStore((s) => s.setTrackingData);
  const vehicleId = vehicle?.id ?? null;
  const clearRoute = useVehicleStore((s) => s.clearRoute);

  const [totalMachineActiveTime, setTotalMachineActiveTime] = useState<number | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<"UPDATED_ON" | "UPDATED_OFF" | null>(null);

  const { trackingData, isLoading } = useVehicleLiveTracking(vehicleId);
  const { vehicleDetail } = useVehicleDetail(vehicleId);

  // Fetch remote starter status with SWR
  const { data: remoteStarterData, mutate: mutateRemoteStarter } = useVehicleRemoteStarter(vehicleId);

  const telemetry = trackingData?.telemetry;
  const lat = telemetry?.latitude ? parseFloat(telemetry.latitude) : null;
  const lng = telemetry?.longitude ? parseFloat(telemetry.longitude) : null;
  const address = useReverseGeocode(lat, lng);

  // Compute display values for meters and speed (prioritize telemetry fields, with fallbacks)
  const telemetryOdometer = telemetry?.odometer !== undefined && telemetry?.odometer !== null ? Number(telemetry.odometer) : undefined;
  const telemetryOperatingTime = telemetry?.operating_time !== undefined && telemetry?.operating_time !== null ? Number(telemetry.operating_time) : undefined;
  const telemetryHourmeterRaw = telemetry?.hourmeter !== undefined && telemetry?.hourmeter !== null ? Number(telemetry.hourmeter) : undefined;
  const displayHourmeterValue = telemetryHourmeterRaw ?? (telemetryOperatingTime ? telemetryOperatingTime / 3600 : undefined);
  const displayOdometerValue = telemetryOdometer;
  const telemetrySpeed = telemetry?.speed !== undefined && telemetry?.speed !== null ? Number(telemetry.speed) : undefined;
  const displaySpeedValue = telemetrySpeed ?? 0;

  const activeTab = useVehicleStore((s) => s.activeTab);
  const setActiveTab = useVehicleStore((s) => s.setActiveTab);

  // Remote starter data
  const hasRemoteStarter = remoteStarterData?.hasRemoteStarter ?? false;
  const lastStatus = remoteStarterData?.lastStatus;

  // Get vehicle type from database; fallback to selected vehicle's type if detail not loaded
  const finalVehicleType = vehicleDetail?.vehicle_type ?? vehicle?.vehicle_type;

  const vehicleIconPath = getVehicleIconPath(
    finalVehicleType,
    telemetry?.status || "IDLE"
  );

  // Helper function untuk styling button berdasarkan status
  const getStarterButtonStyle = (status: string | null) => {
    switch (status) {
      case "UPDATED_ON":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-600",
          textColor: "text-green-600",
          icon: PowerOff,
          label: "Nonaktifkan Kendaraan",
          statusLabel: "Update On",
          statusBg: "bg-green-50 border-green-500 text-green-600",
          isProcessing: false,
        };
      case "UPDATED_OFF":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-600",
          textColor: "text-red-600",
          icon: Power,
          label: "Aktifkan Kendaraan",
          statusLabel: "Update Off",
          statusBg: "bg-red-50 border-red-500 text-red-600",
          isProcessing: false,
        };
      case "PROCESS_ON":
        return {
          bgColor: "bg-gray-50",
          borderColor: "border-gray-400",
          textColor: "text-gray-600",
          icon: Loader2,
          label: "Memproses Menghidupkan...",
          statusLabel: "Processing On",
          statusBg: "bg-gray-50 border-gray-400 text-gray-600",
          isProcessing: true,
        };
      case "PROCESS_OFF":
        return {
          bgColor: "bg-gray-50",
          borderColor: "border-gray-400",
          textColor: "text-gray-600",
          icon: Loader2,
          label: "Memproses Mematikan...",
          statusLabel: "Processing Off",
          statusBg: "bg-gray-50 border-gray-400 text-gray-600",
          isProcessing: true,
        };
      default:
        return {
          bgColor: "bg-gray-50",
          borderColor: "border-gray-400",
          textColor: "text-gray-600",
          icon: Power,
          label: "Aktifkan Kendaraan",
          statusLabel: "Status Tidak Di Ketahui",
          statusBg: "bg-gray-50 border-gray-400 text-gray-600",
          isProcessing: false,
        };
    }
  };

  const buttonStyle = getStarterButtonStyle(lastStatus);
  const ButtonIcon = buttonStyle.icon;

  useEffect(() => {
    const fetchTotalMachineActiveTime = async () => {
      try {
        const result = await getMachineActiveVehicle(vehicleId!);
        setTotalMachineActiveTime(result.totalOperatingTime);
      } catch (error) {
        console.error("Error fetching total machine active time:", error);
        setTotalMachineActiveTime(0);
      }
    };

    if (vehicleId) fetchTotalMachineActiveTime();
  }, [vehicleId]);

  useEffect(() => {
    if (vehicleId && telemetry && lat !== null && lng !== null) {
      const newStatus = telemetry.status === "OPERATING" ? "active" : telemetry.status === "STOPPED" ? "inactive" : "idle";

      // Parse odometer/hourmeter/speed to numbers when possible
      const parsedOdometer = telemetry.odometer !== undefined && telemetry.odometer !== null ? Number(telemetry.odometer) : undefined;
      const parsedHourmeterRaw = telemetry.hourmeter !== undefined && telemetry.hourmeter !== null ? Number(telemetry.hourmeter) : undefined;

      // Jika hourmeter tidak tersedia, fallback ke operating_time (dikonversi ke jam)
      const parsedOperatingTime = telemetry.operating_time !== undefined && telemetry.operating_time !== null ? Number(telemetry.operating_time) : undefined;
      const parsedHourmeter = parsedHourmeterRaw ?? (parsedOperatingTime ? parsedOperatingTime / 3600 : undefined);

      const parsedSpeed = telemetry.speed !== undefined && telemetry.speed !== null ? Number(telemetry.speed) : undefined;

      // Update vehicles in store so map tooltips (hover) reflect realtime telemetry
      updateVehiclePosition(
        vehicleId,
        lat,
        lng,
        newStatus,
      );

      // Store trackingData in store with consistent numeric fields
      setTrackingData({
        lat,
        lng,
        speed: parsedSpeed ?? 0,
        timestamp: telemetry.timestamp || new Date().toISOString(),
        fuel_percent: telemetry.fuel_percent,
        odometer: parsedOdometer,
        hourmeter: parsedHourmeter,
        angle: telemetry.angle,
        operating_time: telemetry.operating_time,
        status: newStatus,
      });
    }
  }, [vehicleId, telemetry, lat, lng, updateVehiclePosition, setTrackingData]);

  function formatSafeDate(dateString?: string) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "-" : format(date, "HH:mm - dd/MM/yyyy");
  }

  const handleToggleStarter = () => {
    const action = lastStatus === "UPDATED_ON" ? "UPDATED_OFF" : "UPDATED_ON";
    setPendingAction(action);
    setIsDialogOpen(true);
  };

  const handleConfirmToggle = async (code: string) => {
    if (!vehicleId || !pendingAction) return;

    setIsSubmitting(true);
    try {
      const result = await toggleVehicleStarter(vehicleId, pendingAction, code);

      // Refetch remote starter data to get updated status
      await mutateRemoteStarter();

      // Show success message
      toast.success(result.message || "Berhasil memproses permintaan");

      // Close dialog
      setIsDialogOpen(false);
      setPendingAction(null);
    } catch (error: any) {
      // Show error message
      const errorMessage = error?.response?.data?.message || "Gagal memproses permintaan";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vehicle) return <div>Pilih kendaraan</div>;
  if (isLoading || !trackingData?.telemetry)
    return (
      <div className='w-[255px] h-full p-4 space-y-4 rounded flex flex-col justify-center items-center'>
        <Loader2 className='w-8 h-8 animate-spin text-[#253A8B]' />
        <p>Mengambil data kendaraan...</p>
      </div>
    );

  const statusInfo = getStatusStyle(telemetry?.status);

  return (
    <div className='w-[275px] h-fit p-4 space-y-4 rounded'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h2 className='text-lg font-semibold'>Detail Kendaraan</h2>
        <button
          onClick={() => {
            useVehicleStore.getState().setSelectedVehicle(null);
            useVehicleStore.getState().setSelectedVehicleId(null);
            useVehicleStore.getState().setTrackingData(null);
            clearRoute();
          }}
          className='text-gray-500 hover:text-gray-800 text-xl font-bold'
        >
          ×
        </button>
      </div>

      {/* Time & Status */}
      <div className='flex items-center justify-between text-sm'>
        <div className='flex items-center space-x-2'>
          <span className={`${statusInfo.bg} ${statusInfo.color} rounded-full py-1 px-2 circle text-xs font-medium`}>{statusInfo.text}</span>
        </div>
        <span className='text-gray-500 font-bold text-xs'>{formatSafeDate(telemetry?.timestamp)}</span>
      </div>

      {/* Plat & Model */}
      <div>
        <div className='flex space-x-2 items-center'>
          <Avatar className='w-10 h-10'>
            <AvatarFallback className="bg-transparent border-0 p-0">
              <img
                src={vehicleIconPath}
                alt={`${finalVehicleType || 'Vehicle'} icon`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback jika gambar tidak ditemukan
                  e.currentTarget.src = '/assets/icons/icon_car_default.webp';
                }}
              />
            </AvatarFallback>
          </Avatar>
          <h1 className='text-base font-bold'>{vehicleDetail?.licensePlate}</h1>
        </div>

        {/* Nama Kendaraan */}
        <p className='text-sm text-gray-600 ml-12'>
          {vehicleDetail?.brand} {vehicleDetail?.model} {vehicleDetail?.year}, {vehicleDetail?.color}
        </p>

        {/* Tombol Pergi ke Profil */}
        <div className='ml-9'>
          <VehicleProfileDialog vehicleDetail={vehicleDetail} vehicleId={vehicleId} />
        </div>
      </div>

      {/* Lokasi */}
      <div className='space-y-3'>
        <div className='flex items-start space-x-2 text-sm text-gray-700'>
          <MapPin className='w-4 h-4 mt-1 text-gray-500' />
          <p>{address}</p>
        </div>

        {/* Tombol Bagikan Lokasi - Disabled */}
        <Button variant='outline' size='sm' disabled className='w-full flex items-center justify-center space-x-2 text-xs opacity-60 cursor-not-allowed'>
          <Share2 className='w-3 h-3' />
          <span>Bagikan Lokasi</span>
        </Button>

        {/* Status Update dan Tombol Starter - Hanya tampil jika hasRemoteStarter = true */}
        {hasRemoteStarter && (
          <div className='space-y-3'>
            {/* Status Update Badge */}
            <div className='flex justify-center'>
              <span className={`text-xs px-3 py-1 rounded-full border ${buttonStyle.statusBg}`}>{buttonStyle.statusLabel}</span>
            </div>

            {/* Tombol Starter */}
            <div className='flex justify-center'>
              <Button
                variant='outline'
                size='sm'
                disabled={buttonStyle.isProcessing}
                onClick={handleToggleStarter}
                className={`flex items-center space-x-1 text-xs ${buttonStyle.textColor} ${buttonStyle.borderColor} ${buttonStyle.bgColor}`}
              >
                <ButtonIcon className={`w-3 h-3 ${buttonStyle.isProcessing ? "animate-spin" : ""}`} />
                <span>{buttonStyle.label}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Telemetry Info segitu */}
      <div className='grid grid-cols-2 gap-2 text-center border rounded p-2 text-sm'>
        <div>
          <p className='font-semibold'>{displaySpeedValue} KM/H</p>
          <p className='text-xs text-gray-500'>KECEPATAN</p>
        </div>
        <div>
          {finalVehicleType === "EXCAVATOR" ||
            finalVehicleType === "BULLDOZER" ||
            finalVehicleType === "WHEEL_LOADER" ||
            finalVehicleType === "GRADER" ? (
            <>
              <p className='font-semibold'>{displayHourmeterValue !== undefined ? displayHourmeterValue.toFixed(2) : 0} Jam</p>
              <p className='text-xs text-gray-500'>HOURMETER</p>
            </>
          ) : (
            <>
              <p className='font-semibold'>{displayOdometerValue !== undefined ? displayOdometerValue.toLocaleString() : 0} KM</p>
              <p className='text-xs text-gray-500'>ODOMETER</p>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className='flex space-x-1 border rounded overflow-hidden text-sm'>
        <button className={`w-1/2 py-2 ${activeTab === "detail" ? "bg-[#253A8B] text-white" : "text-[#253A8B] bg-white"}`} onClick={() => setActiveTab("detail")}>
          Detail
        </button>
        <button className={`w-1/2 py-2 ${activeTab === "activity" ? "bg-[#253A8B] text-white" : "text-[#253A8B] bg-white"}`} onClick={() => setActiveTab("activity")}>
          Aktivitas
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "detail" && telemetry ? (
        <VehicleDetailSection
          vehicleDetail={vehicleDetail}
          telemetry={{
            fuel_percent: parseFloat(telemetry.fuel_percent ?? "0"),
            operatingTime: telemetry?.operating_time ?? 0,
          }}
          totalMachineActiveTime={totalMachineActiveTime}
          address={address}
        />
      ) : (
        <VehicleActivitySection vehicleId={vehicleId} />
      )}

      {/* Confirm Code Dialog */}
      <ConfirmCodeDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onConfirm={handleConfirmToggle} action={pendingAction || "UPDATED_ON"} isLoading={isSubmitting} />
    </div>
  );
};