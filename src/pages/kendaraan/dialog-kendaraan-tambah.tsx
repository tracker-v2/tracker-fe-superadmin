"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getVehicleModels } from "@/api/vehicle-models";
import { addVehicleSuperAdmin, postFuelCalibration } from "@/api/vehicle";
import { toast } from "sonner";
import { KendaraanFormData } from "@/pages/kendaraan/types";

interface DialogKendaraanTambahProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  onSuccess?: () => void;
}

interface VehicleModel {
  id: number;
  vehicleType: string;
  brand: string;
  model: string;
}

const initialFormData: KendaraanFormData = {
  licensePlate: "",
  description: "",
  vehicleModelId: 0,
  frameNumber: "",
  engineNumber: "",
  color: "",
  year: 0,
  markingNumber: "",
  image: "",
  hasFuel: false,
  hasOnOff: false,
  fuelCalibration: "",
};

export function DialogKendaraanTambah({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: DialogKendaraanTambahProps) {
  const [formData, setFormData] = useState<KendaraanFormData>(initialFormData);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vehicle models when dialog opens
  useEffect(() => {
    if (open) {
      fetchVehicleModels();
    }
  }, [open]);

  const fetchVehicleModels = async () => {
    try {
      setLoading(true);
      const data = await getVehicleModels();
      setVehicleModels(data);
    } catch (error) {
      console.error("Failed to fetch vehicle models:", error);
      toast.error("Gagal memuat model kendaraan");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "vehicleModelId" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - hanya untuk field yang wajib
    if (!formData.vehicleModelId) {
      toast.error("Pilih model kendaraan terlebih dahulu");
      return;
    }

    if (!formData.licensePlate.trim()) {
      toast.error("Plat nomor/ID kendaraan tidak boleh kosong");
      return;
    }

    if (!formData.engineNumber.trim()) {
      toast.error("Nomor mesin tidak boleh kosong");
      return;
    }

    if (!formData.color.trim()) {
      toast.error("Warna kendaraan tidak boleh kosong");
      return;
    }

    if (!formData.year || formData.year <= 0) {
      toast.error("Tahun pembuatan harus valid");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Menambahkan kendaraan...");

    try {
      // Send optional fields as empty string if not filled
      const payload = {
        vehicleModelId: formData.vehicleModelId,
        companyId: companyId,
        licensePlate: formData.licensePlate,
        image: formData.image?.trim() || "-",
        color: formData.color,
        year: formData.year,
        frameNumber: formData.frameNumber?.trim() || "-",
        engineNumber: formData.engineNumber,
        marking_number: formData.markingNumber?.trim() || "",
        description: formData.description?.trim() || "",
      };

      console.log("Sending payload:", payload);

      const response = await addVehicleSuperAdmin(payload);
      const vehicleId = response?.data?.id || response?.id;

      if (!vehicleId) {
        throw new Error("Vehicle ID tidak diterima dari server");
      }
      
      // Handle fuel calibration if enabled
      if (formData.hasFuel && formData.fuelCalibration?.trim()) {
        try {
          toast.loading("Mengatur kalibrasi fuel...", { id: toastId });
          
          // Parse fuel calibration coefficient (bisa single number atau array)
          const calibrationValue = formData.fuelCalibration.trim();
          const coefficients = calibrationValue.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
          
          if (coefficients.length === 0) {
            throw new Error("Format kalibrasi fuel tidak valid. Gunakan format: 3.45 atau 3.45,2.1");
          }

          await postFuelCalibration(vehicleId, coefficients);
          toast.success("Kalibrasi fuel berhasil diatur", { id: toastId });
        } catch (calibrationError) {
          console.error("Error setting fuel calibration:", calibrationError);
          const calibrationErrorMsg = calibrationError instanceof Error ? calibrationError.message : "Gagal mengatur kalibrasi fuel";
          toast.warning(`Kendaraan ditambahkan, tetapi: ${calibrationErrorMsg}`, { id: toastId });
        }
      }

      toast.success("Kendaraan berhasil ditambahkan", { id: toastId });
      setFormData(initialFormData);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Error adding vehicle:", error);

      // Get detailed error message from backend
      let errorMessage = "Gagal menambahkan kendaraan. Silakan coba lagi.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as Record<string, any>;
        errorMessage = axiosError?.response?.data?.message ||
          axiosError?.response?.data?.error ||
          errorMessage;
      }

      console.error("Error response:", error);

      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Tambah Kendaraan
          </h2>
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
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 text-sm resize-none h-20 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="vehicleModelId" className="text-sm font-medium">
                  Model Kendaraan
                </Label>
                <Select
                  value={(formData.vehicleModelId || 0).toString()}
                  onValueChange={(value) => handleSelectChange("vehicleModelId", value)}
                  disabled={loading}
                >
                  <SelectTrigger className="mt-1 text-sm font-semibold bg-white">
                    <SelectValue placeholder="Pilih model kendaraan" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleModels.map((model) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.vehicleType} - {model.brand} - {model.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Display Selected Model Info */}
          {(() => {
            const selected = vehicleModels.find((m) => m.id === formData.vehicleModelId);
            return selected ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Tipe</p>
                    <p className="text-gray-900">{selected.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Merk</p>
                    <p className="text-gray-900">{selected.brand}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Model</p>
                    <p className="text-gray-900">{selected.model}</p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

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

          {/* Vehicle Year, Brand, Model Row */}
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
                value={formData.markingNumber}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            </div>
          </div>

          {/* Image String */}
          <div>
            <Label htmlFor="image" className="text-sm font-medium">
              Gambar Kendaraan
            </Label>
            <Input
              id="image"
              name="image"
              type="text"
              placeholder="Masukan URL atau identitas gambar kendaraan"
              value={formData.image}
              onChange={handleInputChange}
              className="mt-1 text-sm bg-white"
            />
          </div>

          {/* Info Tambahan Section */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Info Tambahan
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Fitur Section - Left Column */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Fitur</h4>
                <div className="space-y-3">
                  {/* Fuel Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasFuel"
                      checked={formData.hasFuel || false}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("hasFuel", checked as boolean)
                      }
                      className="rounded"
                    />
                    <Label htmlFor="hasFuel" className="text-sm font-medium cursor-pointer">
                      Fuel
                    </Label>
                  </div>

                  {/* On/Off Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasOnOff"
                      checked={formData.hasOnOff || false}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("hasOnOff", checked as boolean)
                      }
                      className="rounded"
                    />
                    <Label htmlFor="hasOnOff" className="text-sm font-medium cursor-pointer">
                      On/Off
                    </Label>
                  </div>
                </div>
              </div>

              {/* Fuel Calibration - Right Column */}
              <div>
                <Label htmlFor="fuelCalibration" className="text-sm font-medium">
                  Kalibrasi Fuel
                </Label>
                <Input
                  id="fuelCalibration"
                  name="fuelCalibration"
                  type="text"
                  placeholder="Contoh: 3.454251"
                  value={formData.fuelCalibration || ""}
                  onChange={handleInputChange}
                  disabled={!formData.hasFuel}
                  className="mt-1 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              BATAL
            </Button>
            <Button
              type="submit"
              disabled={!formData.vehicleModelId || isSubmitting}
              className="flex-1 bg-[#6B7BE5] hover:bg-[#5a6bce] text-white disabled:opacity-50"
            >
              {isSubmitting ? "Menambahkan..." : "TAMBAH KENDARAAN"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DialogKendaraanTambah;