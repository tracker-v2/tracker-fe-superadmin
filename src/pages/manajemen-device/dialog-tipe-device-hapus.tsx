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
import { deviceModelApi } from '@/api/device-model'
import { deviceModelPinoutApi } from '@/api/device-model-pinout'
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
    const [isDeleting, setIsDeleting] = useState(false)
    const [deletionStep, setDeletionStep] = useState('')

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            console.log(`🗑️ Deleting device model with ID: ${deviceModelId}`)

            // Step 1: Fetch and delete associated pinouts
            setDeletionStep('Menghapus PIN settings...')
            try {
                const pinouts = await deviceModelPinoutApi.getByDeviceModel(deviceModelId)
                if (pinouts && pinouts.length > 0) {
                    console.log(`📝 Found ${pinouts.length} pinouts to delete`)
                    for (const pinout of pinouts) {
                        await deviceModelPinoutApi.delete(pinout.id)
                        console.log(`✅ Pinout deleted with ID ${pinout.id}`)
                    }
                    console.log('✅ All pinouts deleted')
                }
            } catch (pinError) {
                console.warn('⚠️ Pinout deletion warning (non-blocking):', pinError)
                toast.warning('Beberapa PIN settings mungkin tidak terhapus')
            }

            // Step 2: Delete the device model itself
            setDeletionStep('Menghapus tipe device...')
            await deviceModelApi.delete(deviceModelId)
            console.log('✅ Device model deleted')

            toast.success('Tipe device berhasil dihapus')
            setOpen(false)
            onSuccess?.()
        } catch (error: unknown) {
            console.error('❌ Delete device model error:', error)

            let errorMessage = 'Gagal menghapus tipe device'
            if (error instanceof AxiosError) {
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message
                } else if (error.response?.status === 404) {
                    errorMessage = 'Tipe device tidak ditemukan (404).'
                } else if (error.response?.status === 401) {
                    errorMessage = 'Anda tidak terautentikasi'
                } else if (error.response?.status === 403) {
                    errorMessage = 'Anda tidak memiliki izin'
                } else if (error.message) {
                    errorMessage = error.message
                }
            } else if (error instanceof Error) {
                errorMessage = error.message
            }

            toast.error(errorMessage)
        } finally {
            setIsDeleting(false)
            setDeletionStep('')
        }
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
                        <span className="text-sm text-red-600">Tindakan ini akan menghapus semua PIN settings terkait dan tidak dapat dibatalkan.</span>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
                    >
                        {isDeleting && <Loader2 className="animate-spin mr-2" />}
                        {isDeleting ? deletionStep : 'Hapus Tipe Device'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
