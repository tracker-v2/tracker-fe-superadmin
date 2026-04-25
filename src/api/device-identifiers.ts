import axios from "@/lib/axios";

export const deviceIdentifiersApi = {
  // Get list semua device identifiers dengan pagination
  getList: async (page: number = 1, limit: number = 10) => {
    const res = await axios.get(`/device-identifiers/list`, {
      params: { page, limit },
    });
    return res.data.data;
  },

  // Get identifiers untuk specific device
  getByDevice: async (deviceId: number) => {
    const res = await axios.get(`/device-identifiers/device/${deviceId}`);
    return res.data.data;
  },

  // Get single device identifier by ID
  getDetail: async (id: number) => {
    const res = await axios.get(`/device-identifiers/${id}`);
    return res.data.data;
  },

  // Create device identifier
  create: async (data: {
    deviceId: number;
    identifierType: string;
    value: string;
  }) => {
    const res = await axios.post(`/device-identifiers/create`, data);
    return res.data.data;
  },

  // Update device identifier
  update: async (id: number, data: {
    identifierType?: string;
    value?: string;
  }) => {
    const res = await axios.patch(`/device-identifiers/${id}`, data);
    return res.data.data;
  },

  // Delete device identifier
  delete: async (id: number) => {
    const res = await axios.delete(`/device-identifiers/${id}`);
    return res.data;
  },
};