// src/api/device.ts
import axios from "@/lib/axios";
import { Device, DeviceDetail, CreateDeviceRequest, UpdateDeviceRequest } from "@/types/types";

// GET all devices list
export const getDevicesListApi = async (): Promise<Device[]> => {
  const res = await axios.get(`/devices/list`);
  return res.data.data;
};

// GET device detail by id
export const getDeviceDetailApi = async (deviceId: number): Promise<DeviceDetail> => {
  const res = await axios.get(`/devices/detail/${deviceId}`);
  return res.data.data;
};

// POST - Create new device
export const createDeviceApi = async (data: CreateDeviceRequest): Promise<Device> => {
  const payload = {
    name: data.name,
    communicationType: data.communicationType,
    deviceModelId: data.deviceModelId,
    vehicleId: data.vehicleId,
    isActive: data.isActive ?? true,
  };
  
  console.log('POST /devices/create payload:', payload);
  
  const res = await axios.post(`/devices/create`, payload);
  return res.data.data;
};

// PATCH - Update device
export const updateDeviceApi = async (deviceId: number, data: UpdateDeviceRequest): Promise<Device> => {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.communicationType !== undefined) payload.communicationType = data.communicationType;
  if (data.deviceModelId !== undefined) payload.deviceModelId = data.deviceModelId;
  if (data.vehicleId !== undefined) payload.vehicleId = data.vehicleId;
  if (data.isActive !== undefined) payload.isActive = data.isActive;
  
  const res = await axios.patch(`/devices/edit/${deviceId}`, payload);
  return res.data.data;
};

// DELETE - Delete device
export const deleteDeviceApi = async (deviceId: number): Promise<void> => {
  const res = await axios.delete(`/devices/delete/${deviceId}`);
  return res.data;
};

export const getDeviceModelsApi = async () => {
  const res = await axios.get(`/devices-model/list`);
  return res.data.data;
};
