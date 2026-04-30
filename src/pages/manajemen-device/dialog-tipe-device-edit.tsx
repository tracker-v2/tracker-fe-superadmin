'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Trash2 } from 'lucide-react'
import { deviceModelApi } from '@/api/device-model'
import { deviceModelPinoutApi } from '@/api/device-model-pinout'
import { toast } from 'sonner'
import { PropsWithChildren } from 'react'
import { AxiosError } from 'axios'

type PinSetting = {
    id?: string           // temp id for newly added pins (e.g. "pin-123456")
    dbId?: number         // database id for existing pins from API
    pinName: string
    pinType: string
}

type EditableDeviceModel = {
    id: number
    brand: string
    model: string
}

const formSchema = z.object({
    brand: z.string().min(1, 'Brand harus diisi'),
    model: z.string().min(1, 'Nama tipe harus diisi'),
})

type FormSchema = z.infer<typeof formSchema>

const PIN_TYPES = [
    'ANALOG_IN',
    'DIGITAL_IN',
    'DIGITAL_OUT',
    'RELAY',
    'PWM',
    'FUEL',
    'TEMPERATURE',
    'IGNITION',
    'STARTER',
    'DOOR',
    'OTHER',
]

interface DialogTipeDeviceEditProps extends PropsWithChildren {
    deviceModel: EditableDeviceModel
    onSuccess?: VoidFunction
}

export function DialogTipeDeviceEdit({
    children,
    deviceModel,
    onSuccess,
}: DialogTipeDeviceEditProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingPinouts, setIsLoadingPinouts] = useState(false)
    const [pinSettings, setPinSettings] = useState<PinSetting[]>([])
    const [removedPinDbIds, setRemovedPinDbIds] = useState<number[]>([])
    const [newPinName, setNewPinName] = useState('')
    const [newPinType, setNewPinType] = useState('')
    const [error, setError] = useState<string>('')

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            brand: deviceModel.brand,
            model: deviceModel.model,
        },
    })

    // Fetch existing pinouts when dialog opens
    useEffect(() => {
        if (open) {
            // Reset form values to current device model data
            form.reset({
                brand: deviceModel.brand,
                model: deviceModel.model,
            })
            setRemovedPinDbIds([])
            setNewPinName('')
            setNewPinType('')
            setError('')

            // Fetch existing pinouts
            const fetchPinouts = async () => {
                setIsLoadingPinouts(true)
                try {
                    const pinouts = await deviceModelPinoutApi.getByDeviceModel(deviceModel.id)
                    const mapped: PinSetting[] = (pinouts ?? []).map((p: { id: number; pinName: string; pinTypes: string[] }) => ({
                        id: `existing-${p.id}`,
                        dbId: p.id,
                        pinName: p.pinName,
                        pinType: p.pinTypes?.[0] ?? '',
                    }))
                    setPinSettings(mapped)
                } catch (err) {
                    console.warn('⚠️ Failed to fetch pinouts:', err)
                    setPinSettings([])
                } finally {
                    setIsLoadingPinouts(false)
                }
            }

            fetchPinouts()
        }
    }, [open, deviceModel, form])

    const handleAddPin = () => {
        if (pinSettings.length >= 20) {
            toast.error('Maksimal 20 PIN settings')
            return
        }
        if (!newPinName.trim()) {
            toast.error('Nama PIN harus diisi')
            return
        }
        if (!newPinType) {
            toast.error('Tipe PIN harus dipilih')
            return
        }

        const newPin: PinSetting = {
            id: `pin-${Date.now()}`,
            pinName: newPinName,
            pinType: newPinType,
        }

        setPinSettings([...pinSettings, newPin])
        setNewPinName('')
        setNewPinType('')
    }

    const handleRemovePin = (id?: string) => {
        if (!id) return
        const pin = pinSettings.find((p) => p.id === id)
        // Track existing pins that need to be deleted from DB
        if (pin?.dbId) {
            setRemovedPinDbIds((prev) => [...prev, pin.dbId!])
        }
        setPinSettings(pinSettings.filter((p) => p.id !== id))
    }

    const handleSubmit = async (values: FormSchema) => {
        try {
            setError('')
            setIsLoading(true)
            console.log('📝 Step 1: Updating device model:', values)

            // Step 1: Update Device Model
            await deviceModelApi.update(deviceModel.id, {
                brand: values.brand,
                model: values.model,
            })
            console.log('✅ Device model updated')

            // Step 2: Delete removed pinouts
            if (removedPinDbIds.length > 0) {
                try {
                    console.log('📝 Step 2: Deleting removed pinouts...')
                    for (const dbId of removedPinDbIds) {
                        await deviceModelPinoutApi.delete(dbId)
                        console.log(`✅ Pinout deleted with ID ${dbId}`)
                    }
                } catch (pinError) {
                    console.warn('⚠️ PIN deletion warning (non-blocking):', pinError)
                    toast.warning('Tipe device berhasil diperbarui, tapi ada error saat menghapus PIN settings')
                }
            }

            // Step 3: Create new pinouts (ones without dbId)
            const newPins = pinSettings.filter((p) => !p.dbId)
            if (newPins.length > 0) {
                try {
                    console.log('📝 Step 3: Creating new pinouts...')
                    for (const pin of newPins) {
                        await deviceModelPinoutApi.create({
                            deviceModelId: deviceModel.id,
                            pinName: pin.pinName,
                            pinTypes: [pin.pinType],
                        })
                        console.log(`✅ Pinout created for PIN ${pin.pinName}`)
                    }
                } catch (pinError) {
                    console.warn('⚠️ PIN creation warning (non-blocking):', pinError)
                    toast.warning('Tipe device berhasil diperbarui, tapi ada error saat membuat PIN settings')
                }
            }

            // Success
            toast.success('Tipe device berhasil diperbarui')
            setPinSettings([])
            setRemovedPinDbIds([])
            setNewPinName('')
            setNewPinType('')
            setError('')
            setOpen(false)
            onSuccess?.()
        } catch (error: unknown) {
            console.error('❌ Error updating device type:', error)

            // Get error message
            let errorMessage = 'Gagal memperbarui tipe device'

            if (error instanceof AxiosError) {
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message
                } else if (error.response?.status === 404) {
                    errorMessage = 'Endpoint tidak ditemukan (404).'
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

            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen)
            if (!newOpen) {
                setError('')
            }
        }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                aria-description="Edit Tipe Device"
                className="max-w-[800px] bg-white"
                type="right"
            >
                <DialogHeader>
                    <DialogTitle>Edit Tipe Device</DialogTitle>
                    <DialogDescription>Perbarui brand, model device, dan PIN setting (opsional)</DialogDescription>
                </DialogHeader>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-700">
                            <strong>Error:</strong> {error}
                        </p>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                        {/* Brand */}
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Brand</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Contoh: Quectel, Concox, Teltonika..."
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Nama Tipe */}
                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Nama Tipe</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Contoh: GPS Tracker v1, GT06..."
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* PIN Settings */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-gray-600">PIN Setting</FormLabel>
                                <span className="text-sm text-gray-500">
                                    {pinSettings.length}/20
                                </span>
                            </div>

                            {/* Loading pinouts */}
                            {isLoadingPinouts && (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="animate-spin mr-2 text-gray-500" size={16} />
                                    <span className="text-sm text-gray-500">Memuat PIN settings...</span>
                                </div>
                            )}

                            {/* PIN Table */}
                            {!isLoadingPinouts && pinSettings.length > 0 && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nama PIN</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tipe PIN</th>
                                                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {pinSettings.map((pin) => (
                                                <tr key={pin.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-600">{pin.pinName}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{pin.pinType}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePin(pin.id)}
                                                            disabled={isLoading}
                                                            className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Add PIN Form */}
                            <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm text-gray-600 block mb-1">Nama PIN</label>
                                        <Input
                                            value={newPinName}
                                            onChange={(e) => setNewPinName(e.target.value)}
                                            placeholder="Contoh: A1, D1..."
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600 block mb-1">Tipe PIN</label>
                                        <Select value={newPinType} onValueChange={setNewPinType} disabled={isLoading}>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Pilih tipe..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PIN_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleAddPin}
                                    disabled={isLoading || pinSettings.length >= 20}
                                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    + Tambah PIN
                                </Button>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-4">
                            <Button
                                type="button"
                                onClick={() => {
                                    setOpen(false)
                                    setError('')
                                }}
                                disabled={isLoading}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-600"
                            >
                                {isLoading && <Loader2 className="animate-spin mr-2" size={16} />}
                                {isLoading ? 'Menyimpan...' : 'Perbarui'}
                            </Button>
                        </DialogFooter>
                        <p className="text-xs text-gray-500 text-center">
                            Note: PIN settings bersifat opsional.
                        </p>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
