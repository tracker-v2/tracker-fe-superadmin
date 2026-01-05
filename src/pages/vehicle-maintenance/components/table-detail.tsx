import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VehicleMaintenanceDetail } from "@/types/vehicle-maintenance"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, PaginationState, useReactTable } from "@tanstack/react-table"
import dayjs from "dayjs"
import { Pencil } from "lucide-react"
import { Ref, useImperativeHandle, useMemo, useState } from "react"
import { SetURLSearchParams } from "react-router-dom"
import useSWR from "swr"
import { VehicleMaintenanceDetailDialogEdit } from "./dialog-detail-edit"
import { apiVehicleMaintenance } from "@/api/vehicle-maintenance"

export interface VehicleMaintenanceDetailTableRef {
    refresh: VoidFunction
}

export interface VehicleMaintenanceDetailTableProps {
    searchParams: URLSearchParams
    setSearchParams: SetURLSearchParams
    ref: Ref<VehicleMaintenanceDetailTableRef>
    filter: Record<string, unknown>
}

export function VehicleMaintenanceDetailTable({
    searchParams,
    setSearchParams,
    ref,
    filter,
}: VehicleMaintenanceDetailTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: Number(searchParams.get('page') ?? 1) - 1,
        pageSize: Number(searchParams.get('limit') ?? 10),
    })
    const [globalFilter, setGlobalFilter] = useState<string>()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const { data, isLoading, mutate } = useSWR(['/vehicle-maintenance/detail/table', pagination, filter], ([, pagination, filter]) => apiVehicleMaintenance.reports({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            ...filter,
        }), {
        onSuccess() {
            setSearchParams(
                {
                    page: String(pagination.pageIndex + 1),
                    limit: String(pagination.pageSize),
                },
                { replace: true }
            )
        }
    })
    const defaultData = useMemo<VehicleMaintenanceDetail[]>(() => [], [])
    const columns = useMemo<ColumnDef<VehicleMaintenanceDetail>[]>(
        () => [
            {
                header: 'Kendaraan',
                cell: ({ row }) => row.original.licensePlat,
                enableSorting: false,
                enableHiding: false,

            },
            {
                header: 'Jadwal Perawatan Kendaraan',
                cell: ({ row }) => `${row.original.maintenanceReminder.distanceRemainder} km atau ${row.original.maintenanceReminder.monthReminder} bulan`,
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: 'Kilometer Perawatan Kendaraan',
                cell: ({ row }) => `${row.original.lastDistanceMaintanance} km`,
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: 'Tanggal Perawatan Kendaraan',
                cell: ({ row }) => dayjs(row.original.lastDateMaintanance).format('DD/MM/YYYY'),
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: 'Catatan Service',
                cell: ({ row }) => (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><div className="max-w-[284px] line-clamp-3 text-left">{row.original.description}</div></TooltipTrigger>
                            <TooltipContent>
                                <p>{row.original.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: 'Status',
                cell: () => <Button className="text-center mx-auto px-2.5 bg-gray-400 rounded-full py-0.5 text-primary-foreground h-5 max-w-[63px] flex items-center justify-center text-xs hover:bg-gray-400">Selesai</Button>,
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: 'Aksi',
                cell: ({ row }) => (
                    <div className="flex items-center justify-center text-center space-x-2">
                        <VehicleMaintenanceDetailDialogEdit maintananceId={row.original.maintananceId} item={row.original} onSuccess={() => mutate()}>
                            <Button className="bg-transparent hover:bg-transparent border border-blue-900 h-10 w-10 text-blue-900 hover:bg-gray-200">
                                <Pencil size={16} />
                            </Button>
                        </VehicleMaintenanceDetailDialogEdit>
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
        ], []);
    const table = useReactTable<VehicleMaintenanceDetail>({
        data: data?.data || defaultData,
        columns,
        rowCount: data?.meta.total,
        pageCount: typeof data?.meta.total === 'number' ? Math.ceil(data?.meta.total / pagination.pageSize) : undefined,
        state: {
            pagination,
            globalFilter,
            columnFilters,
        },
        manualPagination: true,
        onPaginationChange: setPagination,
        manualFiltering: true,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
    })

    useImperativeHandle(ref, () => {
        return {
            refresh: mutate,
        }
    }, [])

    return (
        <DataTable table={table} loading={isLoading} />
    )
}