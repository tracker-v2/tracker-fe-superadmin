import axios from "@/lib/axios";

export const deviceModelApi = {
  // Get list semua device models
  getList: async () => {
    const res = await axios.get(`/devices-model/list`);
    return res.data.data;
  },

  // Get single device model by ID
  getDetail: async (id: number) => {
    const res = await axios.get(`/devices-model/detail/${id}`);
    return res.data.data;
  },

  // Create device model
  create: async (data: {
    brand: string;
    model: string;
    communicationTypes: string[];
  }) => {
    const res = await axios.post(`/devices-model/create`, data);
    return res.data.data;
  },

  // Update device model
  update: async (id: number, data: {
    brand?: string;
    model?: string;
    communicationTypes?: string[];
  }) => {
    const res = await axios.patch(`/devices-model/edit/${id}`, data);
    return res.data.data;
  },

  // Delete device model
  delete: async (id: number) => {
    const res = await axios.delete(`/devices-model/delete/${id}`);
    return res.data;
  },
};
