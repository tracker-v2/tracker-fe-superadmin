'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { AlertCircle, Loader2 } from 'lucide-react'
import useSWRMutation from 'swr/mutation'
import { deleteDeviceApi } from '@/api/device'
import { toast } from 'sonner'
import { PropsWithChildren } from 'react'
import { AxiosError } from 'axios'

interface DialogDeviceHapusProps extends PropsWithChildren {
    deviceId: number
    deviceName: string
    onSuccess?: VoidFunction
}

export function DialogDeviceHapus({
    children,
    deviceId,
    deviceName,
    onSuccess,
}: DialogDeviceHapusProps) {
    const [open, setOpen] = useState(false)

    // SWR Mutation for deleting device
    const { trigger, isMutating } = useSWRMutation(
        `/devices/delete/${deviceId}`,
        () => deleteDeviceApi(deviceId),
        {
            onSuccess() {
                toast.success('Device berhasil dihapus')
                setOpen(false)
                onSuccess?.()
            },
            onError(error: AxiosError | unknown) {
                const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || 'Gagal menghapus device'
                console.error('❌ Delete device error:', error)
                toast.error(errorMessage)
            },
        }
    )

    const handleDelete = async () => {
        console.log(`🗑️ Deleting device with ID: ${deviceId}`)
        trigger()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                aria-description="Hapus Device"
                className="max-w-[480px] bg-white"
            >
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <DialogTitle>Hapus Device</DialogTitle>
                    </div>
                    <DialogDescription className="mt-4">
                        Anda yakin ingin menghapus device <span className="font-semibold text-gray-900">{deviceName}</span>?
                        <br />
                        <span className="text-sm text-red-600">Tindakan ini tidak dapat dibatalkan.</span>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isMutating}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDelete}
                        disabled={isMutating}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
                    >
                        {isMutating && <Loader2 className="animate-spin mr-2" />}
                        {isMutating ? 'Menghapus...' : 'Hapus Device'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
