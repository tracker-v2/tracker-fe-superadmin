import axios from "@/lib/axios";

export const getFeatures = async () => {
  const res = await axios.get(`features/list`);
  return res.data.data;
}

export const getFeatureById = async (id: string | number) => {
  const res = await axios.get(`features/detail/${id}`);
  return res.data.data;
}