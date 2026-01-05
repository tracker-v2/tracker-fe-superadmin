import axios from "@/lib/axios";

export async function fetchVehicleFuelLevelTime(vehicleId: number, date: string) {
    const res = await axios.get(`/vehicles/${vehicleId}/fuel-level/time`, {
        params: { date },
    });
    return res.data.data;
}

export async function fetchVehicleFuelLevelDistance(vehicleId: number, date: string) {
    const res = await axios.get(`/vehicles/${vehicleId}/fuel-level/distance`, {
        params: { date },
    });
    return res.data.data;
}

export async function fetchVehicleSpeedTime(vehicleId: number, date: string) {
    const res = await axios.get(`/vehicles/${vehicleId}/speed/time`, {
        params: { date },
    });
    return res.data.data;
}

export async function fetchVehicleSpeedDistance(vehicleId: number, date: string) {
    const res = await axios.get(`/vehicles/${vehicleId}/speed/distance`, {
        params: { date },
    });
    return res.data.data;
}

// get activity details on activities section
export async function fetchActivityDetail(vehicleId: number, date: string) {
    const res = await axios.get(`/vehicles/activity-details/${vehicleId}/date`, {
        params: { date },
    });
    return res.data.data;
}

// get report for activity section get trip and log agg
export async function fetchReportActivitySection(vehicleId: number, date: string) {
    const res = await axios.get(`/vehicles/activity/trip-report/${vehicleId}/date`, {
        params: { date },
    });
    return res.data.data;
}