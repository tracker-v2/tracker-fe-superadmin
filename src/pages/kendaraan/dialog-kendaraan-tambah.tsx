"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getVehicleModels } from "@/api/vehicle-models";
import { addVehicleSuperAdmin, postFuelCalibration } from "@/api/vehicle";
import { toggleRemoteStarter } from "@/api/remote-starter";
import { assignFeatureToVehicle } from "@/api/vehicle-features";
import { getCompaniesApi } from "@/api/companies";
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

interface Company {
  id: number;
  name: string;
  codeConfirm: string;
  [key: string]: unknown;
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
  onOffProcess: "PROCESS_ON",
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

  const handleCheckboxChange = (name: "hasFuel" | "hasOnOff", checked: boolean) => {
    setFormData((prev) => {
      const updates: Partial<KendaraanFormData> = { [name]: checked };
      // Auto-clear fuelCalibration when Fuel is unchecked
      if (name === "hasFuel" && !checked) {
        updates.fuelCalibration = "";
      }
      // Reset onOffProcess to default when On/Off is unchecked
      if (name === "hasOnOff" && !checked) {
        updates.onOffProcess = "PROCESS_ON";
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.vehicleModelId) {
      toast.error("Pilih model kendaraan terlebih dahulu");
      return;
    }

    if (!formData.licensePlate.trim()) {
      toast.error("Plat nomor/ID kendaraan tidak boleh kosong");
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

    // Validation: Cannot have both Fuel and On/Off checked (backend only supports 1 feature per vehicle)
    if (formData.hasFuel && formData.hasOnOff) {
      toast.error("Hanya boleh memilih satu fitur antara Fuel atau On/Off. Fitur multiple sedang dalam pengembangan.");
      return;
    }

    // Validation: On/Off must have Process selected
    if (formData.hasOnOff && !formData.onOffProcess) {
      toast.error("Pilih Process (ON atau OFF) untuk fitur On/Off");
      return;
    }

    if (!formData.image?.trim()) {
      toast.error("Gambar kendaraan tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Menambahkan kendaraan...");

    try {
      const payload = {
        vehicleModelId: formData.vehicleModelId,
        companyId: companyId,
        licensePlate: formData.licensePlate,
        image: formData.image || "-",
        color: formData.color,
        year: formData.year,
        frameNumber: formData.frameNumber || "-",
        engineNumber: formData.engineNumber || "-",
        marking_number: formData.markingNumber,
        description: formData.description || "",
      };

      console.log("Sending payload:", payload);

      // Step 1: Create vehicle and extract vehicleId
      const createResponse = await addVehicleSuperAdmin(payload);
      const vehicleId = createResponse?.data?.id ?? createResponse?.id;

      toast.success("Kendaraan berhasil ditambahkan", { id: toastId });

      // Step 2: Assign feature (only ONE per vehicle - backend limitation)
      if (vehicleId) {
        if (formData.hasOnOff) {
          try {
            await assignFeatureToVehicle(vehicleId, 1); // Feature ID 1 = ON/OFF
            toast.success("Fitur On/Off berhasil diassign");
          } catch (onOffFeatureError) {
            console.error("Failed to assign On/Off feature:", onOffFeatureError);
            toast.warning("Gagal mengassign fitur On/Off ke kendaraan");
          }
        } else if (formData.hasFuel) {
          try {
            await assignFeatureToVehicle(vehicleId, 2); // Feature ID 2 = FUEL
            toast.success("Fitur Fuel berhasil diassign");
          } catch (fuelFeatureError) {
            console.error("Failed to assign Fuel feature:", fuelFeatureError);
            toast.warning("Gagal mengassign fitur Fuel ke kendaraan");
          }
        }
      }

      // Step 3: Post fuel calibration if Fuel is checked and calibration value exists
      if (formData.hasFuel && formData.fuelCalibration?.trim() && vehicleId) {
        try {
          // Parse the comma/space-separated string into an array of numbers
          const coefficients = formData.fuelCalibration
            .split(/[,\s]+/)
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
            .map(Number)
            .filter((n) => !isNaN(n));

          if (coefficients.length > 0) {
            await postFuelCalibration(vehicleId, coefficients);
          }
        } catch (fuelError) {
          console.error("Failed to set fuel calibration:", fuelError);
          toast.warning("Kendaraan berhasil dibuat, namun gagal mengatur fitur Fuel");
        }
      }

      // Step 4: Toggle remote starter if On/Off is checked
      if (formData.hasOnOff && vehicleId) {
        try {
          // Fetch company to get code_confirm
          const companies = await getCompaniesApi() as Company[];
          const company = companies.find((c) => c.id === companyId);
          
          if (!company?.codeConfirm) {
            toast.error("Kode konfirmasi company tidak ditemukan");
            return;
          }

          const processType = (formData.onOffProcess || "PROCESS_ON") as "PROCESS_ON" | "PROCESS_OFF";
          await toggleRemoteStarter(vehicleId, company.codeConfirm, processType);
          toast.success("Fitur On/Off berhasil diaktifkan");
        } catch (starterError) {
          console.error("Failed to enable remote starter:", starterError);
          // toast.error("Gagal mengaktifkan fitur On/Off. Silakan coba lagi.");
          return;
        }
      }

      // Complete the flow
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
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Info Tambahan</h3>
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
                    className={`text-sm font-medium block mb-1 ${formData.hasFuel ? "text-gray-700" : "text-gray-400"
                      }`}
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

              {/* Row 2: On/Off Checkbox & On/Off Process Select */}
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
                  <Label
                    htmlFor="onOffProcess"
                    className={`text-sm font-medium block mb-1 ${formData.hasOnOff ? "text-gray-700" : "text-gray-400"
                      }`}
                  >
                    Process
                  </Label>
                  <Select
                    value={formData.onOffProcess || "PROCESS_ON"}
                    onValueChange={(value) => handleSelectChange("onOffProcess", value)}
                    disabled={!formData.hasOnOff}
                  >
                    <SelectTrigger className="text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROCESS_ON">PROCESS_ON</SelectItem>
                      <SelectItem value="PROCESS_OFF">PROCESS_OFF</SelectItem>
                    </SelectContent>
                  </Select>
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