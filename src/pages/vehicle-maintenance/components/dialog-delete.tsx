import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PropsWithChildren, useState } from "react";
import { Loader2 } from "lucide-react";
import { VehicleMaintenance } from "@/types/vehicle-maintenance";
import useSWRMutation from "swr/mutation";
import { apiVehicleMaintenance } from "@/api/vehicle-maintenance";

export function VehicleMaintenanceDialogDelete({ children, item, onSuccess }: PropsWithChildren<{ item: VehicleMaintenance; onSuccess?: VoidFunction }>) {
    const [open, setOpen] = useState(false)
    const { trigger, isMutating } = useSWRMutation('/vehicle-maintenance/create', (_, { arg }: { arg: number }) => apiVehicleMaintenance.delete(arg), {
        onSuccess() {
            setOpen(false)
            onSuccess?.()
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="w-[483px] bg-white p-8 gap-0" type="right">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-semibold">Hapus Jadwal Perawatan Kendaraan</DialogTitle>
                </DialogHeader>
                <DialogDescription className="mb-8 text-[#0A0A0A] text-base ">
                    Apakah anda yakin ingin menghapus jadwal perawatan kendaraan <span className="font-semibold"> {item.vehicle.licensePlate} </span>?
                </DialogDescription>
                <DialogFooter>
                    <div className="ml-auto space-x-2">
                        <Button type="button" className="border border-gray-950 bg-white text-gray-950 hover:bg-gray-200 w-[80px]" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="button" disabled={isMutating} className="bg-blue-900 w-[144px]" onClick={() => trigger(item.id)}>
                            {isMutating && (
                                <Loader2 className="animate-spin" />
                            )}
                            Hapus
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}