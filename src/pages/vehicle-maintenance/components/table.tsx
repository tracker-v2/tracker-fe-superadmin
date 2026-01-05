import { apiVehicleMaintenance } from "@/api/vehicle-maintenance"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { VehicleMaintenance } from "@/types/vehicle-maintenance"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, PaginationState, useReactTable } from "@tanstack/react-table"
import dayjs from "dayjs"
import { Check, NotebookText, Pencil, Trash2 } from "lucide-react"
import { Ref, useImperativeHandle, useMemo, useState } from "react"
import { SetURLSearchParams, useNavigate } from "react-router-dom"
import useSWR from "swr"
import { VehicleMaintenanceDialogDelete } from "./dialog-delete"
import { VehicleMaintenanceDetailDialogCreate } from "./dialog-detail-create"
import { VehicleMaintenanceDialogEdit } from "./dialog-edit"

export interface VehicleMaintenanceTableRef {
    refresh: VoidFunction
}

export interface VehicleMaintenanceTableProps {
    searchParams: URLSearchParams
    setSearchParams: SetURLSearchParams
    search: string
    ref: Ref<VehicleMaintenanceTableRef>
}

export function VehicleMaintenanceTable({
    searchParams,
    setSearchParams,
    search,
    ref,
}: VehicleMaintenanceTableProps) {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: Number(searchParams.get('page') ?? 1) - 1,
        pageSize: Number(searchParams.get('limit') ?? 10),
    })
    const [globalFilter, setGlobalFilter] = useState<string>()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const { data, isLoading, mutate } = useSWR(['/vehicle-maintenance/table', pagination, search], ([, pagination, search]) => apiVehicleMaintenance.paginate({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search,
    }), {
        onSuccess() {
            setSearchParams(
                {
                    page: String(pagination.pageIndex + 1),
                    limit: String(pagination.pageSize),
                    search: search,
                },
                { replace: true }
            )
        }
    })
    const defaultData = useMemo<VehicleMaintenance[]>(() => [], [])
    const columns = useMemo<ColumnDef<VehicleMaintenance>[]>(
        () => [
            {
                header: 'Kendaraan',
                cell: ({ row }) => row.original.vehicle.licensePlate,
                enableSorting: false,
                enableHiding: false,

            },
            {
                header: 'Jadwal Perawatan Kendaraan',
                cell: ({ row }) => `${row.original.distanceRemainder} km atau ${row.original.monthReminder} bulan`,
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: 'Perawatan Berikutnya',
                cell: ({ row }) => (
                    <div className="whitespace-whitespace-nowrap">
                        <p>143011 untuk kilometer terakhir atau {dayjs(row.original.lastMaintanance).format('DD/MM/YYYY')} untuk tanggal service</p>
                        <p className="text-muted-foreground font-normal">{row.original.distanceRemainder} km atau {row.original.monthReminder * 30} hari</p>
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: 'Status',
                cell: () => <Button className="text-center px-2.5 bg-green-600 rounded-full py-0.5 text-primary-foreground h-5 w-12 flex items-center justify-center text-xs">Aktif</Button>,
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: 'Selesai',
                cell: ({ row }) => {
                    return (
                        <VehicleMaintenanceDetailDialogCreate maintananceId={row.original.id} onSuccess={() => mutate()}>
                            <Button className="bg-transparent text-primary hover:bg-gray-200 w-full">
                                <Check size={16} />
                            </Button>
                        </VehicleMaintenanceDetailDialogCreate>
                    )
                },
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: 'Laporan',
                cell: ({ row }) => {
                    return (
                        <div className="text-center">
                            <Button onClick={() => navigate(`/vehicle-maintenances/${row.original.id}`)} className="bg-transparent text-primary hover:bg-gray-200 w-full">
                                <NotebookText size={16} />
                            </Button>
                        </div>
                    )
                },
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: 'Aksi',
                cell: ({ row }) => (
                    <div className="flex items-center justify-center text-center space-x-2">
                        <VehicleMaintenanceDialogEdit item={row.original} onSuccess={() => mutate()}>
                            <Button className="bg-transparent hover:bg-transparent border border-blue-900 h-10 w-10 text-blue-900 hover:bg-gray-200">
                                <Pencil size={16} />
                            </Button>
                        </VehicleMaintenanceDialogEdit>{' '}
                        <VehicleMaintenanceDialogDelete item={row.original} onSuccess={() => mutate()}>
                            <Button className="bg-transparent  hover:bg-transparent border border-destructive h-10 w-10 text-destructive hover:bg-gray-200">
                                <Trash2 size={16} />
                            </Button>
                        </VehicleMaintenanceDialogDelete>
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
        ], []);
    const table = useReactTable<VehicleMaintenance>({
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