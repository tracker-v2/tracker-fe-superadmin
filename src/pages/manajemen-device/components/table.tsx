'use client'

import { Button } from "@/components/ui/button";
import { Device } from "@/types/types";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Ref, forwardRef, useMemo, useImperativeHandle } from "react";
import { DataTable } from "@/components/ui/data-table";
import dayjs from "dayjs";
import { getPaginatedItems, type PaginationInfo } from "@/lib/pagination";
import { DialogDeviceEdit } from "../dialog-device-edit";
import { DialogDeviceHapus } from "../dialog-device-hapus";

export interface DeviceTableRef {
    refresh: VoidFunction;
}

export interface DeviceTableProps {
    data: Device[];
    paginationInfo: PaginationInfo;
    onRefresh: VoidFunction;
    ref: Ref<DeviceTableRef>;
}

const DeviceTable = forwardRef<DeviceTableRef, DeviceTableProps>(
    ({ data, paginationInfo, onRefresh }, ref) => {
        useImperativeHandle(ref, () => ({
            refresh: onRefresh,
        }), [onRefresh]);
        const columns = useMemo<ColumnDef<Device>[]>(
            () => [
                {
                    header: "ID",
                    cell: ({ row }) => row.original.id,
                    enableSorting: false,
                    enableHiding: false,
                    size: 60,
                },
                {
                    header: "Nama Device",
                    cell: ({ row }) => (
                        <div className="font-medium">{row.original.name}</div>
                    ),
                    enableSorting: false,
                    enableHiding: false,
                },
                {
                    header: "Model Device",
                    cell: ({ row }) => row.original.deviceModelId,
                    enableSorting: false,
                    enableHiding: false,
                },
                {
                    header: "Vehicle ID",
                    cell: ({ row }) => row.original.vehicleId,
                    enableSorting: false,
                    enableHiding: false,
                },
                {
                    header: "Tipe Komunikasi",
                    cell: ({ row }) => (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {row.original.communicationType}
                        </span>
                    ),
                    enableSorting: false,
                    enableHiding: false,
                },
                {
                    header: "Status",
                    cell: ({ row }) => (
                        <span
                            className={`px-2 py-1 rounded text-xs font-medium ${row.original.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                        >
                            {row.original.isActive ? "Aktif" : "Tidak Aktif"}
                        </span>
                    ),
                    enableSorting: false,
                    enableHiding: false,
                },
                {
                    header: "Dibuat",
                    cell: ({ row }) => (
                        <span className="text-sm text-gray-600">
                            {dayjs(row.original.createdAt).format("DD/MM/YYYY")}
                        </span>
                    ),
                    enableSorting: false,
                    enableHiding: false,
                },
                {
                    header: "Aksi",
                    cell: ({ row }) => (
                        <div className="flex items-center justify-center gap-2">
                            {/* EDIT BUTTON */}
                            <DialogDeviceEdit
                                device={{
                                    id: row.original.id,
                                    name: row.original.name,
                                    deviceModelId: row.original.deviceModelId,
                                    vehicleId: row.original.vehicleId,
                                    communicationType: row.original.communicationType,
                                    isActive: row.original.isActive,
                                }}
                                onSuccess={onRefresh}
                            >
                                <Button
                                    className="bg-transparent hover:bg-transparent border border-blue-900 h-9 w-9 text-blue-900 hover:bg-gray-200 rounded"
                                    size="sm"
                                >
                                    <Pencil size={16} />
                                </Button>
                            </DialogDeviceEdit>

                            {/* DELETE BUTTON */}
                            <DialogDeviceHapus
                                deviceId={row.original.id}
                                deviceName={row.original.name}
                                onSuccess={onRefresh}
                            >
                                <Button
                                    className="bg-transparent hover:bg-transparent border border-destructive h-9 w-9 text-destructive hover:bg-gray-200 rounded"
                                    size="sm"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </DialogDeviceHapus>
                        </div>
                    ),
                    enableSorting: false,
                    enableHiding: false,
                },
            ],
            [onRefresh]
        );


        // Get paginated data
        const paginatedData = useMemo(() => {
            return getPaginatedItems(data, paginationInfo);
        }, [data, paginationInfo]);

        const table = useReactTable<Device>({
            data: paginatedData,
            columns,
            getCoreRowModel: getCoreRowModel(),
        });

        return (
            <div className="overflow-hidden">
                <DataTable<Device> table={table} loading={false} />
            </div>
        );
    }
);

DeviceTable.displayName = "DeviceTable";

export default DeviceTable;
