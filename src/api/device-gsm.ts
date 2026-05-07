import axios from "@/lib/axios";

export const deviceGsmApi = {
  // Get list semua device GSM dengan pagination
  getList: async (page: number = 1, limit: number = 10) => {
    const res = await axios.get(`/device-gsm/list`, {
      params: { page, limit },
    });
    return res.data.data;
  },

  // Get GSM untuk specific device
  getByDevice: async (deviceId: number) => {
    const res = await axios.get(`/device-gsm/device/${deviceId}`);
    return res.data.data;
  },

  // Get single device GSM by ID
  getDetail: async (id: number) => {
    const res = await axios.get(`/device-gsm/detail/${id}`);
    return res.data.data;
  },

  // Create device GSM
  create: async (data: {
    deviceId: number;
    simNumber: string;
    simProvider: string;
  }) => {
    const res = await axios.post(`/device-gsm/create`, data);
    return res.data.data;
  },

  // Update device GSM
  update: async (id: number, data: {
    simNumber?: string;
    simProvider?: string;
  }) => {
    const res = await axios.patch(`/device-gsm/edit/${id}`, data);
    return res.data.data;
  },

  // Delete device GSM
  delete: async (id: number) => {
    const res = axios.delete(`/device-gsm/delete/${id}`);
    return (await res).data;
  },

  // Get by SIM number (search)
  getBySim: async (simNumber: string) => {
    const res = await axios.get(`/device-gsm/sim/${simNumber}`);
    return res.data.data;
  },
};