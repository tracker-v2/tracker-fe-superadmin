'use client'

import { Button } from "@/components/ui/button";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Ref, forwardRef, useMemo, useImperativeHandle } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getPaginatedItems, type PaginationInfo } from "@/lib/pagination";
import { DialogTipeDeviceEdit } from "../dialog-tipe-device-edit";
import { DialogTipeDeviceHapus } from "../dialog-tipe-device-hapus";

// Type for device model data from the API
export interface DeviceModelRow {
    id: number;
    brand: string;
    model: string;
    pinSettings?: { id: number; pinName: string; pinTypes: string[] }[];
}

export interface DeviceModelTableRef {
    refresh: VoidFunction;
}

export interface DeviceModelTableProps {
    data: DeviceModelRow[];
    paginationInfo: PaginationInfo;
    onRefresh: VoidFunction;
    ref: Ref<DeviceModelTableRef>;
}

const DeviceModelTable = forwardRef<DeviceModelTableRef, DeviceModelTableProps>(
    ({ data, paginationInfo, onRefresh }, ref) => {
        useImperativeHandle(ref, () => ({
            refresh: onRefresh,
        }), [onRefresh]);

        const columns = useMemo<ColumnDef<DeviceModelRow>[]>(
            () => [
                {
                    header: "ID",
                    cell: ({ row }) => row.original.id,
                    enableSorting: false,
                    enableHiding: false,
                    size: 60,
                },
                {
                    header: "Brand",
                    cell: ({ row }) => (
                        <div className="font-medium">{row.original.brand}</div>
                    ),
                    enableSorting: false,
                    enableHiding: false,
                },
                {
                    header: "Tipe",
                    cell: ({ row }) => row.original.model,
                    enableSorting: false,
                    enableHiding: false,
                },
                {
                    header: "Pin Setting",
                    cell: ({ row }) => {
                        const pins = row.original.pinSettings;
                        if (!pins || pins.length === 0) {
                            return <span className="text-gray-400 text-sm">-</span>;
                        }
                        return (
                            <div className="flex flex-wrap gap-1">
                                {pins.map((pin) => (
                                    <span
                                        key={pin.id}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                                    >
                                        {pin.pinName}
                                    </span>
                                ))}
                            </div>
                        );
                    },
                    enableSorting: false,
                    enableHiding: false,
                },
                {
                    header: "Aksi",
                    cell: ({ row }) => (
                        <div className="flex items-center justify-center gap-2">
                            {/* EDIT BUTTON */}
                            <DialogTipeDeviceEdit
                                deviceModel={{
                                    id: row.original.id,
                                    brand: row.original.brand,
                                    model: row.original.model,
                                }}
                                onSuccess={onRefresh}
                            >
                                <Button
                                    className="bg-transparent hover:bg-transparent border border-blue-900 h-9 w-9 text-blue-900 hover:bg-gray-200 rounded"
                                    size="sm"
                                >
                                    <Pencil size={16} />
                                </Button>
                            </DialogTipeDeviceEdit>

                            {/* DELETE BUTTON */}
                            <DialogTipeDeviceHapus
                                deviceModelId={row.original.id}
                                deviceModelName={`${row.original.brand} - ${row.original.model}`}
                                onSuccess={onRefresh}
                            >
                                <Button
                                    className="bg-transparent hover:bg-transparent border border-destructive h-9 w-9 text-destructive hover:bg-gray-200 rounded"
                                    size="sm"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </DialogTipeDeviceHapus>
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

        const table = useReactTable<DeviceModelRow>({
            data: paginatedData,
            columns,
            getCoreRowModel: getCoreRowModel(),
        });

        return (
            <div className="overflow-hidden">
                <DataTable<DeviceModelRow> table={table} loading={false} />
            </div>
        );
    }
);

DeviceModelTable.displayName = "DeviceModelTable";

export default DeviceModelTable;
