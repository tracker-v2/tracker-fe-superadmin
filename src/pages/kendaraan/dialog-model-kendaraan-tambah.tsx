"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface DialogModelKendaraanTambahProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit?: (data: ModelKendaraanFormData) => void;
}

interface ModelKendaraanFormData {
    vehicleType: string;
    brand: string;
    model: string;
    fuelTankCapacity: string;
    numberOfWheels: string;
    enginePower: string;
    torque: string;
}

const initialFormData: ModelKendaraanFormData = {
    vehicleType: "",
    brand: "",
    model: "",
    fuelTankCapacity: "",
    numberOfWheels: "",
    enginePower: "",
    torque: "",
};

const vehicleTypeOptions = [
    { value: "EXCAVATOR", label: "Excavator" },
    { value: "DUMP_TRUCK", label: "Dump Truck" },
    { value: "BULLDOZER", label: "Bulldozer" },
    { value: "WHEEL_LOADER", label: "Wheel Loader" },
    { value: "GRADER", label: "Grader" },
    { value: "ROAD_ROLLER", label: "Road Roller" },
    { value: "MOBIL_BEBAN", label: "Mobil Beban" },
    { value: "MOBIL_PENUMPANG", label: "Mobil Penumpang" },
    { value: "MPV", label: "MPV" },
    { value: "PICKUP_TRUCK", label: "Pickup Truck" },
];

export function DialogModelKendaraanTambah({
    open,
    onOpenChange,
    onSubmit,
}: DialogModelKendaraanTambahProps) {
    const [formData, setFormData] = useState<ModelKendaraanFormData>(
        initialFormData
    );

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
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

    const handleSubmit = () => {
        // Validation
        if (
            !formData.vehicleType ||
            !formData.brand ||
            !formData.model ||
            !formData.fuelTankCapacity ||
            !formData.numberOfWheels ||
            !formData.enginePower ||
            !formData.torque
        ) {
            alert("Semua field harus diisi");
            return;
        }

        if (onSubmit) {
            onSubmit(formData);
        }

        // Reset form
        setFormData(initialFormData);
        onOpenChange(false);
    };

    const handleReset = () => {
        setFormData(initialFormData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Tambah Model Kendaraan</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Tipe Kendaraan */}
                    <div className="space-y-2">
                        <Label htmlFor="vehicleType" className="text-sm font-medium">
                            Tipe Kendaraan
                        </Label>
                        <Select
                            value={formData.vehicleType}
                            onValueChange={(value) =>
                                handleSelectChange("vehicleType", value)
                            }
                        >
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Pilih tipe kendaraan" />
                            </SelectTrigger>
                            <SelectContent>
                                {vehicleTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Merk */}
                    <div className="space-y-2">
                        <Label htmlFor="brand" className="text-sm font-medium">
                            Merk
                        </Label>
                        <Input
                            id="brand"
                            name="brand"
                            type="text"
                            placeholder="Masukan merk kendaraan"
                            value={formData.brand}
                            onChange={handleInputChange}
                            className="w-full bg-white"
                        />
                    </div>

                    {/* Model */}
                    <div className="space-y-2">
                        <Label htmlFor="model" className="text-sm font-medium">
                            Model
                        </Label>
                        <Input
                            id="model"
                            name="model"
                            type="text"
                            placeholder="Masukan model kendaraan"
                            value={formData.model}
                            onChange={handleInputChange}
                            className="w-full bg-white"
                        />
                    </div>

                    {/* Kapasitas Tangki (L) */}
                    <div className="space-y-2">
                        <Label htmlFor="fuelTankCapacity" className="text-sm font-medium">
                            Kapasitas Tangki (L)
                        </Label>
                        <Input
                            id="fuelTankCapacity"
                            name="fuelTankCapacity"
                            type="number"
                            placeholder="Masukan angka kapasitas tangki"
                            value={formData.fuelTankCapacity}
                            onChange={handleInputChange}
                            className="w-full bg-white"
                        />
                    </div>

                    {/* Jumlah Roda */}
                    <div className="space-y-2">
                        <Label htmlFor="numberOfWheels" className="text-sm font-medium">
                            Jumlah Roda
                        </Label>
                        <Input
                            id="numberOfWheels"
                            name="numberOfWheels"
                            type="number"
                            placeholder="Masukan jumlah roda"
                            value={formData.numberOfWheels}
                            onChange={handleInputChange}
                            className="w-full bg-white"
                        />
                    </div>

                    {/* Power Mesin (kW) */}
                    <div className="space-y-2">
                        <Label htmlFor="enginePower" className="text-sm font-medium">
                            Power Mesin (kW)
                        </Label>
                        <Input
                            id="enginePower"
                            name="enginePower"
                            type="number"
                            placeholder="Masukan angka power mesin"
                            value={formData.enginePower}
                            onChange={handleInputChange}
                            className="w-full bg-white"
                        />
                    </div>

                    {/* Torsi (N.m) */}
                    <div className="space-y-2">
                        <Label htmlFor="torque" className="text-sm font-medium">
                            Torsi (N.m)
                        </Label>
                        <Input
                            id="torque"
                            name="torque"
                            type="number"
                            placeholder="Masukan angka torsi"
                            value={formData.torque}
                            onChange={handleInputChange}
                            className="w-full bg-white"
                        />
                    </div>

                    {/* Button Actions */}
                    <div className="flex gap-3 justify-end mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            className="px-6 bg-white"
                        >
                            BATAL
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            className="bg-[#1E3A8A] hover:bg-[#162c6b] text-white px-6"
                        >
                            TAMBAH MODEL KENDARAAN
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
