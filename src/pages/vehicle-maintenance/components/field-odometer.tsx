import { apiVehicleMaintenance } from "@/api/vehicle-maintenance";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";

export interface VehicleMaintenanceFieldOdometerProps {
    vehicleId: number
    isExcavator?: boolean
}
export function VehicleMaintenanceFieldOdometer({ vehicleId, isExcavator = false }: VehicleMaintenanceFieldOdometerProps) {
    const { data, isLoading } = useSWR(['/vehicle-maintenance/vehicle/odometer', vehicleId], ([, id]) => apiVehicleMaintenance.getVehicleOdometer(id))

    if (isLoading) return <Skeleton />

    const unit = isExcavator ? "Jam" : "KM";

    return (
        <div className="relative">
            <Input
                disabled
                className="pr-10 bg-inherit"
                value={isLoading ? 'Loading...' : new Intl.NumberFormat().format(data ?? 0)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center px-3 h-full item text-gray-500">{unit}</div>
        </div>
    )
}