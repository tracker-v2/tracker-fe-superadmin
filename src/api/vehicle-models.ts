import axios from "@/lib/axios";

export const getVehicleModels = async () => {
  const res = await axios.get(`vehicle-models`);
  return res.data.data;
};