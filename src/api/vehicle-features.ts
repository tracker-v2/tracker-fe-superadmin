import axios from "@/lib/axios";

export const getVehicleFeatures = async () => {
  const res = await axios.get(`vehicle-features`);
  return res.data.data;
};

export const getVehicleFeatureDetail = async (id: string | number) => {
  const res = await axios.get(`vehicle-features/${id}`);
  return res.data.data;
};

export const assignFeatureToVehicle = async (vehicleId: number, featureId: number) => {
  const res = await axios.post(`vehicle-features/create`, {
    vehicleId,
    featureId,
  });
  return res.data.data;
};

export const updateVehicleFeatures = async (vehicleId: string | number, featureIds: number[]) => {
  const res = await axios.put(`vehicle-features/${vehicleId}`, {
    featureIds,
  });
  return res.data.data;
};

export const deleteVehicleFeature = async (id: string | number) => {
  const res = await axios.delete(`vehicle-features/${id}`);
  return res.data;
};