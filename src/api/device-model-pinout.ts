import axios from "@/lib/axios";

export const deviceModelPinoutApi = {
  // Get list semua device model pinouts
  getList: async () => {
    const res = await axios.get(`/device-model-pinout/list`);
    return res.data.data;
  },

  // Get single device model pinout by ID
  getDetail: async (id: number) => {
    const res = await axios.get(`/device-model-pinout/detail/${id}`);
    return res.data.data;
  },

  // Get pinouts by device model ID
  getByDeviceModel: async (deviceModelId: number) => {
    const res = await axios.get(`/device-model-pinout/by-model/${deviceModelId}`);
    return res.data.data;
  },

  // Create device model pinout
  create: async (data: {
    deviceModelId: number;
    pinName: string;
    pinTypes: string[];
  }) => {
    const res = await axios.post(`/device-model-pinout/create`, data);
    return res.data.data;
  },

  // Update device model pinout
  update: async (id: number, data: {
    pinName?: string;
    pinTypes?: string[];
  }) => {
    const res = await axios.patch(`/device-model-pinout/edit/${id}`, data);
    return res.data.data;
  },

  // Delete device model pinout
  delete: async (id: number) => {
    const res = await axios.delete(`/device-model-pinout/delete/${id}`);
    return res.data;
  },
};
