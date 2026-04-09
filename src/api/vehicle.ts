// src/api/vehicle.ts
import axios from "@/lib/axios";
import useSWR from "swr";

export const getVehiclesApi = async (companyId: number) => {
  const res = await axios.get(`/vehicles/list/${companyId}`);
  // console.log("hi",res.data.data)
  return res.data.data;
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useVehicleTracking = (vehicleId: number | null) => {
  const { data, error, isLoading } = useSWR(vehicleId ? `/vehicles/tracking/${vehicleId}` : null, fetcher);

  return {
    trackingData: data,
    isLoading,
    error,
  };
};

export const getVehiclesDetailApi = async (vehicleId: number) => {
  const res = await axios.get(`/vehicles/vehicle-detail/${vehicleId}`);
  return res.data.data;
};

// api get license-plates
export const getLicensePlate = async (companyId: number) => {
  const res = await axios.get(`vehicles/license-plates/${companyId}`);
  // console.log("res", res)
  return res.data.data;
};

// api get all vehicle
export const getAllVehicle = async () => {
  const res = await axios.get(`vehicles/`);
  // console.log("res", res)
  return res.data.data;
};

//api for get route vehicle
export const getRouteVehicle = async (vehicleId: number, date: string) => {
  const res = await axios.get(`vehicles/${vehicleId}/routes`, { params: { date } });
  return res.data.data;
};

// api for get total duration mechine active
export const getMachineActiveVehicle = async (companyId: number) => {
  const res = await axios.get(`vehicles/total-operating/${companyId}`);
  // console.log(res, "res oprtanging")
  return res.data.data;
};


export const getVehicleActivityReport = async ( vehicleId: number, date: string ) => {
  const res = await axios.get(`vehicles/activity/trip-report/${vehicleId}/date`, { params: { date } });
  return res.data.data;
};
  

// api/vehicle.ts
export const getStatusFeature = async (vehicleId: number) => {
  const res = await axios.get(`vehicles/${vehicleId}/remote-starter/check`);
  return res.data;
};


export const toggleVehicleStarter = async (
  vehicleId: number,
  action: "PROCESS_ON" | "PROCESS_OFF",
  codeConfirm: string
) => {
  const res = await axios.post(
    `vehicles/${vehicleId}/remote-starter/toggle`,
    {
      code_confirm: codeConfirm,
      action: action,
    }
  );
  return res.data;
};

// API GET

// api to get detailed list of vehicles by company - super admin
export const getDetailedListVehiclesByCompany = async (companyId: number) => {
  const res = await axios.get(`vehicles/list/sa/${companyId}/detailed`);
  return res.data.data;
};

export const getVehicleByMarkingNumber = async (markingNumber: string, companyId: number) => {
  const res = await axios.get(`vehicles/marking-number/${markingNumber}`, {
    params: { companyId }
  });
  return res.data.data;
}

// count company - super admin

export const getVehiclesCountAllCompanies = async () => {
  const res = await axios.get(`vehicles/count/sa`);
  return res.data.data.vehicle_count ?? 0;
};

export const getVehiclesCountByCompany = async (companyId: number) => {
  const res = await axios.get(`vehicles/count/sa/${companyId}`);
  return res.data.data.vehicle_count ?? 0;
}

export const deleteVehicleById = async (vehicleId: number) => {
  const res = await axios.delete(`vehicles/${vehicleId}`);
  return res.data;
}

// Edit Vehicle Super Admin
export const editVehicleSuperAdmin = async (vehicleId: number, companyId: number, vehicleData: object) => {
  const payload = {
    ...vehicleData,
    companyId: companyId
  };

  const res = await axios.put(`vehicles/superadmin/${vehicleId}`, payload);
  return res.data;
};

export const getVehicleDetail = async (vehicleId: number, companyId: number) => {
  const res = await axios.get(`vehicles/vehicle-details/${vehicleId}`, {
    params: { companyId }
  });
  return res.data.data;
};

// MODEL VEHICLE API

export const addVehicleModel = async (modelData: number) => {
  const res = await axios.post(`vehicles/models`, modelData);
  return res.data;
}

export const editVehicleModelById = async (modelId: number, modelData: number) => {
  const res = await axios.put(`vehicles/models/${modelId}`, modelData);
  return res.data;
}

export const deleteVehicleModelById = async (modelId: number) => {
  const res = await axios.delete(`vehicles/models/${modelId}`);
  return res.data;
}

// POST VEHICLE API

// superadmin then integrate with maximus vehicles (DB Live)
export const addVehicleSuperAdmin = async (vehicleData: {
  vehicleModelId: number;
  companyId: number;
  licensePlate: string;
  image: string;
  color: string;
  year: number;
  frameNumber: string;
  engineNumber: string;
  marking_number: string;
  description?: string;
}) => {
  const res = await axios.post(`vehicles/superadmin`, vehicleData);
  return res.data;
};