import axios from "@/lib/axios";

export const deviceFeaturesApi = {
  // Get list semua device features dengan pagination
  getList: async (page: number = 1, limit: number = 10) => {
    const res = await axios.get(`/device-features/list`, {
      params: { page, limit },
    });
    return res.data.data;
  },

  // Get features untuk specific device
  getByDevice: async (deviceId: number) => {
    const res = await axios.get(`/device-features/device/${deviceId}`);
    return res.data.data;
  },

  // Get single device feature by ID
  getDetail: async (id: number) => {
    const res = await axios.get(`/device-features/detail/${id}`);
    return res.data.data;
  },

  // Create device feature
  create: async (data: {
    deviceId: number;
    featureId: number;
    deviceModelPinoutId: number;
  }) => {
    const res = await axios.post(`/device-features/create`, data);
    return res.data.data;
  },

  // Update device feature
  update: async (id: number, data: {
    featureId?: number;
    deviceModelPinoutId?: number;
  }) => {
    const res = await axios.patch(`/device-features/edit/${id}`, data);
    return res.data.data;
  },

  // Delete device feature
  delete: async (id: number) => {
    const res = await axios.delete(`/device-features/delete/${id}`);
    return res.data;
  },

  // Get by device and feature combination
  getByDeviceAndFeature: async (deviceId: number, featureId: number) => {
    const res = await axios.get(`/device-features/device/${deviceId}/feature/${featureId}`);
    return res.data.data;
  },
};
