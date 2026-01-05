import axios from "@/lib/axios";
import { PaginateRequest, PaginateResponse } from "@/types/types";
import { VehicleMaintenance, VehicleMaintenanceDetail } from "@/types/vehicle-maintenance";

const endpoint = '/vehicle-maintenances'

export class apiVehicleMaintenance {
    static async paginate(params: PaginateRequest<{ search?: string }>) {
        const { data } = await axios.get<PaginateResponse<VehicleMaintenance>>(endpoint, {
            params
        });

        return data;
    }

    static async getVehicles(path: 'register' | 'unregister') {
        const { data } = await axios.get<{ data: { id: number; licensePlate: string; }[] }>(`${endpoint}/vehicles/${path}`);

        return data.data;
    }

    static async getVehicleOdometer(vehicleId: number) {
        const { data } = await axios.get<{ data: number }>(`${endpoint}/vehicles/${vehicleId}/odometer`);

        return data.data;

    }
    
    static async create(body: Pick<VehicleMaintenance, 'vehicleId' | 'lastMaintanance' | 'monthReminder' | 'distanceRemainder'>) {
        const { data } = await axios.post<VehicleMaintenance>(endpoint, body);

        return data;
    }

    static async detail(id: number) {
        const { data } = await axios.get<VehicleMaintenance>(`${endpoint}/${id}`);

        return data
    }

    static async edit(id: number, body: Partial<Pick<VehicleMaintenance, 'lastMaintanance' | 'monthReminder' | 'distanceRemainder'>>) {
        const { data } = await axios.patch<VehicleMaintenance>(`${endpoint}/${id}`, body);
        
        return data
    }

    static async delete(id: number) {
        const { data } = await axios.delete<VehicleMaintenance>(`${endpoint}/${id}`);

        return data;
    }

    static async reports(params: PaginateRequest<{ licensePlates?: string[]; startDate?: string; endDate?: string; maintananceId?: number }>) {
        const { data } = await axios.get<PaginateResponse<VehicleMaintenanceDetail>>(`${endpoint}/reports`, {
            params
        });

        return data;
    }

    static async reportExcel(params: { licensePlates?: string[]; startDate?: string; endDate?: string; maintananceId?: number }) {
        return await axios.get(`${endpoint}/reports/excel`, {
            params,
            responseType: 'blob'
        });
    }
    
    static async detailCreate(maintananceId: number, body: Pick<VehicleMaintenanceDetail, 'description'>) {
        const { data } = await axios.post<VehicleMaintenanceDetail>(`${endpoint}/${maintananceId}/details`, body);

        return data;
    }
    
    static async detailEdit(maintananceId: number, id: number, body: Pick<VehicleMaintenanceDetail, 'description'>) {
        const { data } = await axios.patch<VehicleMaintenanceDetail>(`${endpoint}/${maintananceId}/details/${id}`, body);

        return data;
    }
}