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
import { deviceModelApi } from '@/api/device-model'
import { toast } from 'sonner'
import { PropsWithChildren } from 'react'
import { AxiosError } from 'axios'

interface DialogTipeDeviceHapusProps extends PropsWithChildren {
    deviceModelId: number
    deviceModelName: string
    onSuccess?: VoidFunction
}

export function DialogTipeDeviceHapus({
    children,
    deviceModelId,
    deviceModelName,
    onSuccess,
}: DialogTipeDeviceHapusProps) {
    const [open, setOpen] = useState(false)

    // SWR Mutation for deleting device model
    const { trigger, isMutating } = useSWRMutation(
        `/device-models/delete/${deviceModelId}`,
        () => deviceModelApi.delete(deviceModelId),
        {
            onSuccess() {
                toast.success('Tipe device berhasil dihapus')
                setOpen(false)
                onSuccess?.()
            },
            onError(error: AxiosError | unknown) {
                const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || 'Gagal menghapus tipe device'
                console.error('❌ Delete device model error:', error)
                toast.error(errorMessage)
            },
        }
    )

    const handleDelete = async () => {
        console.log(`🗑️ Deleting device model with ID: ${deviceModelId}`)
        trigger()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                aria-description="Hapus Tipe Device"
                className="max-w-[480px] bg-white"
            >
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <DialogTitle>Hapus Tipe Device</DialogTitle>
                    </div>
                    <DialogDescription className="mt-4">
                        Anda yakin ingin menghapus tipe device <span className="font-semibold text-gray-900">{deviceModelName}</span>?
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
                        {isMutating ? 'Menghapus...' : 'Hapus Tipe Device'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
