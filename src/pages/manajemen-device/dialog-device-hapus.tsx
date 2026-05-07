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
import { deleteDeviceApi, getDeviceDetailApi } from '@/api/device'
import { deviceIdentifiersApi } from '@/api/device-identifiers'
import { deviceGsmApi } from '@/api/device-gsm'
import { deviceFeaturesApi } from '@/api/device-features'
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
    const [isDeleting, setIsDeleting] = useState(false)
    const [deletionStep, setDeletionStep] = useState<string>('')

    const handleDelete = async () => {
        if (isDeleting) return
        console.log(`🗑️ Starting deletion sequence for device ID: ${deviceId}`)

        try {
            setIsDeleting(true)

            // Step 0: Fetch device detail to discover related records
            setDeletionStep('Memuat data relasi...')
            console.log('🔵 Step 0: Fetching device detail...')
            let deviceDetail
            try {
                deviceDetail = await getDeviceDetailApi(deviceId)
                console.log('✅ Step 0: Device detail fetched', deviceDetail)
            } catch (error) {
                console.warn('⚠️ Could not fetch device detail, proceeding with direct deletion', error)
            }

            // Step 1: Delete Device Identifiers (IMEI etc.)
            if (deviceDetail?.deviceIdentifiers?.length) {
                try {
                    setDeletionStep('Menghapus IMEI...')
                    console.log(`🔵 Step 1: Deleting ${deviceDetail.deviceIdentifiers.length} identifier(s)...`)
                    for (const identifier of deviceDetail.deviceIdentifiers) {
                        await deviceIdentifiersApi.delete(identifier.id)
                    }
                    console.log('✅ Step 1: Identifiers deleted')
                } catch (error) {
                    console.warn('⚠️ Warning: Identifier deletion failed (non-blocking)', error)
                    toast.warning('Beberapa data IMEI tidak berhasil dihapus')
                }
            }

            // Step 2: Delete Device GSM (SIM info)
            if (deviceDetail?.deviceGsm?.length) {
                try {
                    setDeletionStep('Menghapus GSM info...')
                    console.log(`🔵 Step 2: Deleting ${deviceDetail.deviceGsm.length} GSM record(s)...`)
                    for (const gsm of deviceDetail.deviceGsm) {
                        await deviceGsmApi.delete(gsm.id)
                    }
                    console.log('✅ Step 2: GSM records deleted')
                } catch (error) {
                    console.warn('⚠️ Warning: GSM deletion failed (non-blocking)', error)
                    toast.warning('Beberapa data GSM tidak berhasil dihapus')
                }
            }

            // Step 3: Delete Device Features (Pinouts)
            if (deviceDetail?.deviceFeatures?.length) {
                try {
                    setDeletionStep('Menghapus pinout...')
                    console.log(`🔵 Step 3: Deleting ${deviceDetail.deviceFeatures.length} feature(s)...`)
                    for (const feature of deviceDetail.deviceFeatures) {
                        await deviceFeaturesApi.delete(feature.id)
                    }
                    console.log('✅ Step 3: Features deleted')
                } catch (error) {
                    console.warn('⚠️ Warning: Feature deletion failed (non-blocking)', error)
                    toast.warning('Beberapa data pinout tidak berhasil dihapus')
                }
            }

            // Step 4: Delete the main Device record
            setDeletionStep('Menghapus device...')
            console.log('🔵 Step 4: Deleting main device...')
            await deleteDeviceApi(deviceId)
            console.log('✅ Step 4: Device deleted')

            // All steps completed
            setDeletionStep('')
            setIsDeleting(false)
            toast.success('Device berhasil dihapus')
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error('❌ Error during device deletion sequence:', error)
            setDeletionStep('')
            setIsDeleting(false)

            const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message ||
                'Gagal menghapus device. Silakan coba lagi.'
            toast.error(errorMessage)
        }
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
                        <span className="text-sm text-red-600">
                            Tindakan ini akan menghapus semua data terkait (IMEI, GSM, Pinout) dan tidak dapat dibatalkan.
                        </span>
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
                        {isDeleting ? `${deletionStep || 'Menghapus...'}` : 'Hapus Device'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
