import { apiVehicleMaintenance } from "@/api/vehicle-maintenance"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PropsWithChildren, useState } from "react"
import useSWRMutation from "swr/mutation"

export type VehicleMaintenanceDetailDialogExcelProps = PropsWithChildren<{
    filter: Record<string, unknown>
}>

export function VehicleMaintenanceDetailDialogExcel({ filter, children }: VehicleMaintenanceDetailDialogExcelProps) {
    const [open, setOpen] = useState(false)
    const { trigger, isMutating } = useSWRMutation('/vehicle-maintenance/reports/excel', (_, { arg }: { arg: Record<string, unknown> }) => apiVehicleMaintenance.reportExcel(arg), {
        onSuccess(response) {
            setOpen(false)
            const blob = new Blob([response.data], {
                type: response.headers["content-type"],
            });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);

            // Try to read filename from headers
            const disposition = response.headers["content-disposition"];
            let filename = "report.xlsx";
            if (disposition && disposition.includes("filename=")) {
                filename = disposition.split("filename=")[1].replace(/"/g, "");
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    })

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Unduh Laporan?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ini akan mengunduh berkas laporan terbaru ke perangkat Anda.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isMutating}>Batal</AlertDialogCancel>
                    <AlertDialogAction disabled={isMutating} onClick={() => trigger(filter)}>{isMutating ? "Mengunduh..." : "Konfirmasi"}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
