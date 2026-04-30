'use client'

import { getDevicesListApi } from "@/api/device";
import { Device } from "@/types/types";
import { deviceModelApi } from "@/api/device-model";
import { Button } from "@/components/ui/button";
import { Plus, Search, AlertCircle } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import useSWR from "swr";
import DeviceTable, { DeviceTableRef } from "./components/table.tsx";
import DeviceModelTable, { DeviceModelTableRef, DeviceModelRow } from "./components/tipe-device-table.tsx";
import {
    calculatePaginationInfo,
    type PaginationInfo,
} from "@/lib/pagination";
import { PaginationControls } from "@/components/ui/pagination";
import { DialogDeviceTambah } from "./dialog-device-tambah";
import { DialogTipeDeviceTambah } from "./dialog-tipe-device-tambah";

type ViewMode = "device" | "tipe-device";

export function ManajemenDevicePage() {
    const [activeView, setActiveView] = useState<ViewMode>("device");
    const [search, setSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const tableRef = useRef<DeviceTableRef>(null);
    const tipeDeviceTableRef = useRef<DeviceModelTableRef>(null);

    // Fetch device list
    const { data, isLoading, error, mutate } = useSWR(
        ["devices/list"],
        () => getDevicesListApi(),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: true,
            errorRetryCount: 3,
        }
    );

    // Fetch device model list
    const {
        data: deviceModelsData,
        isLoading: isLoadingModels,
        error: errorModels,
        mutate: mutateModels,
    } = useSWR<DeviceModelRow[]>(
        ["devices-model/list"],
        () => deviceModelApi.getList(),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: true,
            errorRetryCount: 3,
        }
    );

    // Determine current data source based on active view
    const isDeviceView = activeView === "device";
    const currentIsLoading = isDeviceView ? isLoading : isLoadingModels;
    const currentError = isDeviceView ? error : errorModels;

    const filteredData = useMemo(() => {
        if (isDeviceView) {
            if (!data) return [];
            if (!search.trim()) return data;
            return data.filter((device) => {
                const searchLower = search.toLowerCase();
                return (
                    device.name.toLowerCase().includes(searchLower) ||
                    device.vehicleId.toString().includes(searchLower) ||
                    device.deviceModelId.toString().includes(searchLower) ||
                    device.communicationType.toLowerCase().includes(searchLower)
                );
            });
        } else {
            if (!deviceModelsData) return [];
            if (!search.trim()) return deviceModelsData;
            return deviceModelsData.filter((model) => {
                const searchLower = search.toLowerCase();
                return (
                    model.brand.toLowerCase().includes(searchLower) ||
                    model.model.toLowerCase().includes(searchLower) ||
                    model.id.toString().includes(searchLower)
                );
            });
        }
    }, [data, deviceModelsData, search, isDeviceView]);

    const paginationInfo: PaginationInfo = useMemo(() => {
        return calculatePaginationInfo(filteredData.length, currentPage);
    }, [currentPage, filteredData.length]);

    const handleRefresh = () => {
        setCurrentPage(1);
        if (isDeviceView) {
            mutate();
        } else {
            mutateModels();
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleViewChange = (view: ViewMode) => {
        setActiveView(view);
        setSearch("");
        setCurrentPage(1);
    };

    return (
        <div className="h-full w-full">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 flex flex-col h-full w-full gap-4">
                {/* HEADER - TOGGLE, SEARCH & ADD BUTTON */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    {/* TOGGLE BUTTONS */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={() => handleViewChange("device")}
                            className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                                isDeviceView
                                    ? "bg-blue-900 text-white hover:bg-blue-800"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            }`}
                        >
                            List Device
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleViewChange("tipe-device")}
                            className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                                !isDeviceView
                                    ? "bg-blue-900 text-white hover:bg-blue-800"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            }`}
                        >
                            List Tipe Device
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-end justify-between">
                        {/* SEARCH */}
                        <div className="w-full sm:w-72">
                            <form>
                                <div className="flex flex-col gap-2 relative">
                                    <div className="relative">
                                        <Search
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <input
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            type="text"
                                            id="search"
                                            className="border border-gray-300 rounded-md h-10 pl-10 pr-4 w-full placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
                                            placeholder={isDeviceView ? "Cari Device..." : "Cari Tipe Device..."}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* ADD BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <DialogDeviceTambah onSuccess={handleRefresh}>
                                <Button className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white gap-2 h-10">
                                    <Plus size={18} />
                                    <span className="font-medium">Tambah Device</span>
                                </Button>
                            </DialogDeviceTambah>
                            <DialogTipeDeviceTambah onSuccess={handleRefresh}>
                                <Button className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white gap-2 h-10">
                                    <Plus size={18} />
                                    <span className="font-medium">Tambah Tipe Device</span>
                                </Button>
                            </DialogTipeDeviceTambah>
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="flex-1 overflow-hidden flex flex-col border border-gray-200 rounded-lg bg-white">
                    {/* ERROR STATE */}
                    {currentError && (
                        <div className="p-4 bg-red-50 border-b border-red-200 flex items-start gap-3">
                            <AlertCircle
                                className="text-red-600 flex-shrink-0 mt-0.5"
                                size={20}
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-800 text-sm sm:text-base">
                                    Gagal Memuat Data
                                </h3>
                                <p className="text-red-700 text-xs sm:text-sm mt-1">
                                    {currentError?.message ||
                                        `Terjadi kesalahan saat mengambil data ${isDeviceView ? "device" : "tipe device"}. Silakan coba lagi.`}
                                </p>
                                <Button
                                    onClick={handleRefresh}
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 border-red-300 text-red-700 hover:bg-red-100 text-xs sm:text-sm"
                                >
                                    Coba Lagi
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* LOADING STATE */}
                    {currentIsLoading && (
                        <div className="flex items-center justify-center flex-1 min-h-[400px]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin"></div>
                                <p className="text-gray-600 text-sm">
                                    Memuat data {isDeviceView ? "device" : "tipe device"}...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!currentIsLoading && !currentError && filteredData.length === 0 && (
                        <div className="flex items-center justify-center flex-1 min-h-[400px]">
                            <div className="text-center">
                                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                                    {search
                                        ? `Tidak ada ${isDeviceView ? "device" : "tipe device"} yang sesuai dengan pencarian`
                                        : `Belum ada ${isDeviceView ? "device" : "tipe device"} terdaftar`}
                                </p>
                                {!search && isDeviceView && (
                                    <DialogDeviceTambah onSuccess={handleRefresh}>
                                        <Button className="bg-blue-900 hover:bg-blue-800 gap-2 text-sm sm:text-base">
                                            <Plus size={18} />
                                            Tambah Device Pertama
                                        </Button>
                                    </DialogDeviceTambah>
                                )}
                                {!search && !isDeviceView && (
                                    <DialogTipeDeviceTambah onSuccess={handleRefresh}>
                                        <Button className="bg-blue-900 hover:bg-blue-800 gap-2 text-sm sm:text-base">
                                            <Plus size={18} />
                                            Tambah Tipe Device Pertama
                                        </Button>
                                    </DialogTipeDeviceTambah>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TABLE & PAGINATION */}
                    {!currentIsLoading && !currentError && filteredData.length > 0 && (
                        <>
                            <div className="flex-1 overflow-x-auto">
                                {isDeviceView ? (
                                    <DeviceTable
                                        ref={tableRef}
                                        data={filteredData as Device[]}
                                        paginationInfo={paginationInfo}
                                        onRefresh={handleRefresh}
                                    />
                                ) : (
                                    <DeviceModelTable
                                        ref={tipeDeviceTableRef}
                                        data={filteredData as DeviceModelRow[]}
                                        paginationInfo={paginationInfo}
                                        onRefresh={handleRefresh}
                                    />
                                )}
                            </div>

                            {/* PAGINATION CONTROLS */}
                            <PaginationControls
                                info={paginationInfo}
                                onPageChange={handlePageChange}
                                isLoading={currentIsLoading}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
