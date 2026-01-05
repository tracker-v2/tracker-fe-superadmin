import { apiVehicleMaintenance } from "@/api/vehicle-maintenance";
import { MultiSelect } from "@/components/multi-select";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";

export interface VehicleMaintenanceDetailFilterVehicleProps {
    value: string[]
    onChange: (value: string[]) => void
}
export function VehicleMaintenanceDetailFilterVehicle({ value, onChange }: VehicleMaintenanceDetailFilterVehicleProps) {
    const { data, isLoading } = useSWR(['/vehicle-maintenance/reports/vehicle-select'], () => apiVehicleMaintenance.getVehicles('register'))

    if (isLoading) return <Skeleton />
    
    return (
        <MultiSelect 
            options={(data || []).map((item) => ({
                label: item.licensePlate,
                value: item.licensePlate,
            }))} 
            onValueChange={onChange} 
            defaultValue={value} 
            placeholder="Pilih Nomor Kendaraan" 
            variant="default" 
            animation={2} 
            maxCount={2} 
            className="min-w-full w-[310px]"
        />
    )
}