"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface DialogKendaraanTambahProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: KendaraanFormData) => void;
}

interface KendaraanFormData {
  licensePlate: string;
  description: string;
  vehicleType: string;
  odometer: string;
  tankCapacity: string;
  frameNumber: string;
  engineNumber: string;
  color: string;
  year: string;
  brand: string;
  model: string;
  markingNumber: string;
  hasFuel: boolean;
  hasOnOff: boolean;
  fuelCalibration: string;
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
  year: "",
  brand: "",
  model: "",
  markingNumber: "",
  hasFuel: false,
  hasOnOff: false,
  fuelCalibration: "",
};

export function DialogKendaraanTambah({
  open,
  onOpenChange,
  onSubmit,
}: DialogKendaraanTambahProps) {
  const [formData, setFormData] = useState<KendaraanFormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    setFormData(initialFormData);
    onOpenChange(false);
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
            Detail Kendaraan
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
                    <SelectItem value="mobil-penumpang">Mobil Penumpang</SelectItem>
                    <SelectItem value="mobil-beban">Mobil Beban</SelectItem>
                    <SelectItem value="pickup-truck">Pickup Truck</SelectItem>
                    <SelectItem value="dump-truck">Dump Truck</SelectItem>
                    <SelectItem value="excavator">Excavator</SelectItem>
                    <SelectItem value="bulldozer">Bulldozer</SelectItem>
                    <SelectItem value="wheel-loader">Wheel Loader</SelectItem>
                    <SelectItem value="grader">Grader</SelectItem>
                    <SelectItem value="road-roller">Road Roller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Specifications Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="odometer" className="text-sm font-medium">
                Odometer/Hourmeter
              </Label>
              <Input
                id="odometer"
                name="odometer"
                placeholder="Masukan angka odometer/hourmeter"
                value={formData.odometer}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            </div>

            <div>
              <Label htmlFor="tankCapacity" className="text-sm font-medium">
                Kapasitas Tangki
              </Label>
              <Input
                id="tankCapacity"
                name="tankCapacity"
                placeholder="Masukan angka kapasitas tangki"
                value={formData.tankCapacity}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            {/* <span className="right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">L</span> */}
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

          {/* Vehicle Year, Brand, Model Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="year" className="text-sm font-medium">
                Tahun
              </Label>
              <Input
                id="year"
                name="year"
                placeholder="Masukan tahun pembuatan"
                value={formData.year}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            </div>

            <div>
              <Label htmlFor="brand" className="text-sm font-medium">
                Merk
              </Label>
              <Input
                id="brand"
                name="brand"
                placeholder="Masukan merk"
                value={formData.brand}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            </div>

            <div>
              <Label htmlFor="model" className="text-sm font-medium">
                Model
              </Label>
              <Input
                id="model"
                name="model"
                placeholder="Masukan model"
                value={formData.model}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
              />
            </div>
          </div>

          {/* Marking Number */}
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
          
          {/* Additional Info Section */}
        <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Info Tambahan
        </h3>
        
        <div className="flex gap-8">
            {/* Left Side - Fitur */}
            <div className="flex-1">
            <Label className="text-sm font-medium mb-3 block">
                Fitur
            </Label>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                <Checkbox
                    id="hasFuel"
                    checked={formData.hasFuel}
                    onCheckedChange={(checked) =>
                    handleCheckboxChange("hasFuel", checked as boolean)
                    }
                />
                <Label htmlFor="hasFuel" className="text-sm font-medium cursor-pointer">
                    Fuel
                </Label>
                </div>

                <div className="flex items-center gap-2">
                <Checkbox
                    id="hasOnOff"
                    checked={formData.hasOnOff}
                    onCheckedChange={(checked) =>
                    handleCheckboxChange("hasOnOff", checked as boolean)
                    }
                />
                <Label htmlFor="hasOnOff" className="text-sm font-medium cursor-pointer">
                    On/Off
                </Label>
                </div>
            </div>
            </div>

            {/* Right Side - Kalibrasi Fuel */}
            <div className="flex-1">
            <Label htmlFor="fuelCalibration" className="text-sm font-medium">
                Kalibrasi Fuel
            </Label>
            <Input
                id="fuelCalibration"
                name="fuelCalibration"
                placeholder="Masukan koefisien kalibrasi fuel"
                value={formData.fuelCalibration}
                onChange={handleInputChange}
                className="mt-1 text-sm bg-white"
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
              className="flex-1 bg-[#6B7BE5] hover:bg-[#5a6bce] text-white"
            >
              TAMBAH KENDARAAN
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DialogKendaraanTambah;