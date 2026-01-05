import { Fuel } from "lucide-react";

interface VehicleDetail {
  imei: string;
  simNumber: string;
  fuelTank: number;
}

interface TelemetryData {
  fuel_percent: number;
  operatingTime: number;
}

interface Props {
  vehicleDetail: VehicleDetail;
  telemetry: TelemetryData;
  address: string;
  totalMachineActiveTime?: number | null; // Tambahkan prop baru
}

//format detik ke

function formatSecondsToHMS(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs} jam ${mins} menit ${secs} detik`;
}

export const VehicleDetailSection: React.FC<Props> = ({ 
  vehicleDetail, 
  telemetry, 
  totalMachineActiveTime 
}) => {
  return (
    <>
      <div className='text-sm divide-y border rounded overflow-hidden'>
        {/* Bahan Bakar Section */}
        <div className='flex items-center justify-between px-4 py-2'>
          <div>
            <p className='font-medium text-gray-800'>Bahan Bakar</p>
            <div className='flex items-center space-x-2 text-gray-700 mt-1'>
              <Fuel className='w-4 h-4' />
              <span>
                {Number(telemetry?.fuel_percent ?? 0).toFixed(2)}% (
                {((Number(telemetry?.fuel_percent ?? 0) * vehicleDetail?.fuelTank) / 100).toFixed(2)} L / {vehicleDetail?.fuelTank} L)
              </span>
            </div>
          </div>
        </div>

        {/* IMEI Section */}
        <div className='px-4 py-2'>
          <p className='font-medium text-gray-800'>IMEI</p>
          <p className='text-gray-700 mt-1'>{vehicleDetail?.imei}</p>
        </div>

        {/* Nomor SIM Provider Section */}
        <div className='px-4 py-2'>
          <p className='font-medium text-gray-800'>Nomor SIM Provider</p>
          <p className='text-gray-700 mt-1'>{vehicleDetail?.simNumber}</p>
        </div>

        {/* Durasi Mesin Aktif Session (dari telemetry)
        <div className='px-4 py-2'>
          <p className='font-medium text-gray-800'>Durasi Mesin Aktif (Session)</p>
          <span className='inline-block bg-gray-100 text-gray-800 px-2 py-1 mt-1 text-xs rounded'>
            {typeof telemetry?.operatingTime === "number" ? formatSecondsToHMS(telemetry.operatingTime) : "-"}
          </span>
        </div> */}

        {/* Total Durasi Mesin Aktif (dari API getMachineActiveVehicle) */}
        <div className='px-4 py-2'>
          <p className='font-medium'>Total Durasi Mesin Aktif</p>
          <span className='inline-block  py-1 mt-1 text-xs rounded'>
            {totalMachineActiveTime !== null ? (
              typeof totalMachineActiveTime === "number" ? 
                formatSecondsToHMS(totalMachineActiveTime) : 
                "-"
            ) : (
              "Memuat..."
            )}
          </span>
        </div>
      </div>
    </>
  );
};