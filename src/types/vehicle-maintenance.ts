export interface VehicleMaintenance {
    id: number;
    vehicleId: number;
    lastMaintanance: string;
    monthReminder: number;
    distanceRemainder: number;
    vehicle: {
        id: number;
        licensePlate: string;
        status: "active" | "idle" | "inactive";
    }
    //   detail: TdataDummyPerawatanDetail | undefined;
}

export interface VehicleMaintenanceDetail {
    id: number;
    maintananceId: number;
    description: string;
    licensePlat: string;
    lastDateMaintanance: string;
    lastDistanceMaintanance: number;
    maintenanceReminder: VehicleMaintenance
}