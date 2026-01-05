import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PropsWithChildren, useState } from "react";
import { VehicleMaintenanceFormCreate } from "./form-create";
import { Loader2 } from "lucide-react";

export function VehicleMaintenanceDialogCreate({ children, onSuccess }: PropsWithChildren<{ onSuccess?: VoidFunction }>) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent aria-description="edit content" className="max-w-[640px] bg-white" type="right">
                <DialogHeader>
                    <DialogTitle>Pengingat Service</DialogTitle>
                </DialogHeader>
                <DialogDescription className="sr-only">Data Pengingat Service</DialogDescription>
                <VehicleMaintenanceFormCreate onSuccess={() => {
                    setOpen(false)
                    onSuccess?.()
                }}>
                    {({ loading }) => {
                        return (
                            <DialogFooter>
                                <Button type="submit" disabled={loading} className="bg-blue-900 disabled:bg-gray-600 w-full">
                                    {loading && (
                                        <Loader2 className="animate-spin" />
                                    )}
                                    Simpan Perubahan
                                </Button>
                            </DialogFooter>
                        )
                    }}
                </VehicleMaintenanceFormCreate>
            </DialogContent>
        </Dialog>
    );
}