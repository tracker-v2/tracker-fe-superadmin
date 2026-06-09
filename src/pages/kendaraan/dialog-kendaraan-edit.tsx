"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getVehicleDetail, editVehicleSuperAdmin, getFuelCalibration, postFuelCalibration } from "@/api/vehicle";
import { toggleRemoteStarter } from "@/api/remote-starter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { KendaraanFormData, Vehicle } from "@/pages/kendaraan/types";
import { toast } from "sonner";
import { ConfirmCodeDialog } from "@/components/confirm-code-dialog";


interface DialogKendaraanEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  vehicle?: Vehicle | null;
  companyId?: number;
}

const initialFormData: KendaraanFormData = {
  licensePlate: "",
  description: "",
  vehicleType: "",
  odometer: "",
  tankCapacity: "",
  frameNumber: "",
  engineNumber: "",
  color: "",
  year: 0,
  brand: "",
  model: "",
  markingNumber: "",
  hasFuel: false,
  hasOnOff: false,
  fuelCalibration: "",
  imei: "",
  simNumber: "",
};

export function DialogKendaraanEdit({
  open,
  onOpenChange,
  onSuccess,
  vehicle,
  companyId,
}: DialogKendaraanEditProps) {
  const [formData, setFormData] = useState<KendaraanFormData>(initialFormData);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmCodeOpen, setConfirmCodeOpen] = useState(false);
  const [pendingVehicleId, setPendingVehicleId] = useState<number | null>(null);

  const fetchVehicleData = useCallback(async (vehicleId: number, compId: number) => {
    if (!vehicleId || !compId) {
      console.log("No vehicleId or companyId provided");
      return;
    }

    setLoadingVehicle(true);
    console.log("Fetching vehicle data for vehicleId:", vehicleId, "companyId:", compId);

    try {
      // Fetch vehicle detail and fuel calibration in parallel
      const [vehicleData, fuelCalibrationData] = await Promise.allSettled([
        getVehicleDetail(vehicleId, compId),
        getFuelCalibration(vehicleId),
      ]);

      const vehicle = vehicleData.status === "fulfilled" ? vehicleData.value : null;
      const fuelCalib = fuelCalibrationData.status === "fulfilled" ? fuelCalibrationData.value : null;

      console.log("Vehicle data received:", vehicle);
      console.log("Fuel calibration data:", fuelCalib);

      if (vehicle) {
        const imei = vehicle.imei || "";
        const simNumber = vehicle.simNumber || "";

        // console.log("Extracted IMEI:", imei);
        // console.log("Extracted SIM Number:", simNumber);
        // console.log("Full vehicle object:", vehicle);

        // Parse fuel calibration coefficients array back into a string for the input
        const hasFuelData = Array.isArray(fuelCalib) && fuelCalib.length > 0;
        const fuelCalibrationStr = hasFuelData
          ? (fuelCalib as number[]).join(", ")
          : "";

        const hasOnOffStatus = false;

        setFormData({
          vehicleId: vehicleId,
          licensePlate: vehicle.licensePlate || "",
          description: vehicle.description || "",
          vehicleType: vehicle.vehicleType || "",
          odometer: vehicle.lastOdometer?.toString() || "",
          tankCapacity: vehicle.fuelTank?.toString() || "",
          frameNumber: vehicle.frameNumber || "",
          engineNumber: vehicle.engineNumber || "",
          color: vehicle.color || "",
          year: vehicle.year || 0,
          brand: vehicle.brand || "",
          model: vehicle.model || "",
          markingNumber: vehicle.markingNumber || "",
          hasFuel: hasFuelData,
          hasOnOff: hasOnOffStatus,
          fuelCalibration: fuelCalibrationStr,
          imei: imei,
          simNumber: simNumber,
        });

        // DEBUG: Log form data after setting
        console.log("Form data set with IMEI:", imei, "SIM:", simNumber);
      } else {
        console.log("No vehicle data found");
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      setFormData(initialFormData);
    } finally {
      setLoadingVehicle(false);
    }
  }, []);

  // Load initial data and nge fetch vehicle detail ketika dialog open
  useEffect(() => {
    if (open && vehicle && companyId) {
      // Fetch full vehicle data menggunakan vehicle.id
      if (vehicle.id) {
        fetchVehicleData(vehicle.id, companyId);
      } else {
        setFormData(initialFormData);
      }
    } else if (!open) {
      setFormData(initialFormData);
    }
  }, [open, vehicle, companyId, fetchVehicleData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: "hasFuel" | "hasOnOff", checked: boolean) => {
    setFormData((prev) => {
      const updates: Partial<KendaraanFormData> = { [name]: checked };
      // Auto-clear fuelCalibration when Fuel is unchecked
      if (name === "hasFuel" && !checked) {
        updates.fuelCalibration = "";
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicle?.id || !companyId) {
      toast.error("Data kendaraan atau ID perusahaan tidak valid");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Menyimpan perubahan...");

    try {
      const vehiclePayload = {
        licensePlate: formData.licensePlate,
        description: formData.description,
        vehicleType: formData.vehicleType,
        odometer: formData.odometer,
        fuelTank: formData.tankCapacity,
        frameNumber: formData.frameNumber,
        engineNumber: formData.engineNumber,
        color: formData.color,
        year: formData.year,
        brand: formData.brand,
        model: formData.model,
        markingNumber: formData.markingNumber,
      };

      // Step 1: Update main vehicle data
      await editVehicleSuperAdmin(
        vehicle.id,
        Number(companyId),
        vehiclePayload
      );

      toast.success("Data kendaraan berhasil diperbarui", { id: toastId });

      // Step 2: Update fuel calibration if Fuel is checked and calibration value exists
      if (formData.hasFuel && formData.fuelCalibration?.trim()) {
        try {
          const coefficients = formData.fuelCalibration
            .split(/[,\s]+/)
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
            .map(Number)
            .filter((n) => !isNaN(n));

          if (coefficients.length > 0) {
            await postFuelCalibration(vehicle.id, coefficients);
          }
        } catch (fuelError) {
          console.error("Failed to update fuel calibration:", fuelError);
          toast.warning("Kendaraan berhasil diperbarui, namun gagal mengatur fitur Fuel");
        }
      }

      // Step 3: Toggle remote starter if On/Off is checked
      if (formData.hasOnOff) {
        setPendingVehicleId(vehicle.id);
        setConfirmCodeOpen(true);
        return; // Wait for user to confirm code
      }

      // If no On/Off, complete the flow
      setFormData(initialFormData);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Error updating vehicle:", error);

      let errorMessage = "Gagal mengupdate kendaraan. Silakan coba lagi.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as Record<string, any>;
        errorMessage = axiosError?.response?.data?.message ||
          axiosError?.response?.data?.error ||
          errorMessage;
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    onOpenChange(false);
  };

  const handleConfirmCodeSubmit = async (code: string) => {
    if (!pendingVehicleId) {
      toast.error("Vehicle ID tidak ditemukan");
      return;
    }

    try {
      setIsSubmitting(true);
      await toggleRemoteStarter(pendingVehicleId, code, "UPDATED_ON");
      toast.success("Fitur On/Off berhasil diaktifkan");
      setConfirmCodeOpen(false);
      setPendingVehicleId(null);
      setFormData(initialFormData);
      onOpenChange(false);
      onSuccess?.();
    } catch (starterError) {
      console.error("Failed to enable remote starter:", starterError);
      toast.error("Gagal mengaktifkan fitur On/Off. Kode konfirmasi mungkin salah.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit Kendaraan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              General Info
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="licensePlate" className="text-sm font-medium">
                  Plat Nomer/ID Kendaraan
                </Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  placeholder="Masukan plat nomor/id kendaraan"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  className="mt-1 text-sm bg-white"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Deskripsi
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Deskripsi"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="mt-1 text-sm resize-none h-20 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="vehicleType" className="text-sm font-medium">
                  Tipe Kendaraan
                </Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => handleSelectChange("vehicleType", value)}
                >
                  <SelectTrigger className="mt-1 text-sm font-semibold bg-white">
                    <SelectValue placeholder="Pilih tipe kendaraan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOBIL_PENUMPANG">Mobil Penumpang</SelectItem>
                    <SelectItem value="MOBIL_BEBAN">Mobil Beban</SelectItem>
                    <SelectItem value="PICKUP_TRUCK">Pickup Truck</SelectItem>
                    <SelectItem value="DUMP_TRUCK">Dump Truck</SelectItem>
                    <SelectItem value="EXCAVATOR">Excavator</SelectItem>
                    <SelectItem value="BULLDOZER">Bulldozer</SelectItem>
                    <SelectItem value="WHEEL_LOADER">Wheel Loader</SelectItem>
                    <SelectItem value="GRADER">Grader</SelectItem>
                    <SelectItem value="ROAD_ROLLER">Road Roller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Vehicle Details Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="frameNumber" className="text-sm font-medium">
                Nomor Rangka
              </Label>
              <Input
                id="frameNumber"
                name="frameNumber"
                placeholder="Masukan nomor rangka"
                value={formData.frameNumber}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            </div>

            <div>
              <Label htmlFor="engineNumber" className="text-sm font-medium">
                Nomor Mesin
              </Label>
              <Input
                id="engineNumber"
                name="engineNumber"
                placeholder="Masukan nomor mesin"
                value={formData.engineNumber}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            </div>

            <div>
              <Label htmlFor="color" className="text-sm font-medium">
                Warna
              </Label>
              <Input
                id="color"
                name="color"
                placeholder="Masukan warna kendaraan"
                value={formData.color}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            </div>
          </div>

          {/* Vehicle Year and Marking Number Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year" className="text-sm font-medium">
                Tahun
              </Label>
              <Input
                id="year"
                name="year"
                type="number"
                placeholder="Masukan tahun pembuatan"
                value={formData.year}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            </div>

            <div>
              <Label htmlFor="markingNumber" className="text-sm font-medium">
                Marking Number
              </Label>
              <Input
                id="markingNumber"
                name="markingNumber"
                placeholder="Masukan marking number"
                value={formData.markingNumber || ""}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            </div>
          </div>

          {/* Device Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Info Device
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imei" className="text-xs font-medium text-gray-600">
                  IMEI
                </Label>
                <Input
                  id="imei"
                  value={loadingVehicle ? "Loading..." : (formData.imei || "")}
                  readOnly
                  className="mt-1 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <Label htmlFor="simNumber" className="text-xs font-medium text-gray-600">
                  No Simcard
                </Label>
                <Input
                  id="simNumber"
                  value={loadingVehicle ? "Loading..." : (formData.simNumber || "")}
                  readOnly
                  className="mt-1 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Info Tambahan
            </h3>

            <div className="space-y-4">
              {/* Row 1: Fuel Checkbox & Kalibrasi Fuel Input */}
              <div className="grid grid-cols-2 gap-8 items-end">
                <div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hasFuel"
                      checked={formData.hasFuel ?? false}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("hasFuel", checked === true)
                      }
                    />
                    <Label
                      htmlFor="hasFuel"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Fuel
                    </Label>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="fuelCalibration"
                    className={`text-sm font-medium block mb-1 ${formData.hasFuel ? "text-gray-700" : "text-gray-400"}`}
                  >
                    Kalibrasi Fuel
                  </Label>
                  <Input
                    id="fuelCalibration"
                    name="fuelCalibration"
                    placeholder="Masukan koefisien kalibrasi fuel"
                    value={formData.fuelCalibration ?? ""}
                    onChange={handleInputChange}
                    disabled={!formData.hasFuel}
                    className="text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Row 2: On/Off Checkbox */}
              <div className="grid grid-cols-2 gap-8 items-end">
                <div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hasOnOff"
                      checked={formData.hasOnOff ?? false}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("hasOnOff", checked === true)
                      }
                    />
                    <Label
                      htmlFor="hasOnOff"
                      className="text-sm font-medium cursor-pointer"
                    >
                      On/Off
                    </Label>
                  </div>
                </div>
                <div>
                  {/* Empty or placeholder */}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 bg-white"
            >
              BATAL
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loadingVehicle}
              className="flex-1 bg-[#6B7BE5] hover:bg-[#5a6bce] text-white disabled:opacity-50"
            >
              {isSubmitting ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
            </Button>
          </div>
        </form>

        <ConfirmCodeDialog
          open={confirmCodeOpen}
          onOpenChange={setConfirmCodeOpen}
          onConfirm={handleConfirmCodeSubmit}
          action="UPDATED_ON"
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

export default DialogKendaraanEdit;