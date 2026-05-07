'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useMemo, useEffect } from 'react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { updateDeviceApi, getDeviceModelsApi, getDeviceDetailApi } from '@/api/device'
import { deviceModelPinoutApi } from '@/api/device-model-pinout'
import { deviceIdentifiersApi } from '@/api/device-identifiers'
import { deviceGsmApi } from '@/api/device-gsm'
import { deviceFeaturesApi } from '@/api/device-features'
import { getAllVehicle } from '@/api/vehicle'
import { toast } from 'sonner'
import { PropsWithChildren } from 'react'
import { AxiosError } from 'axios'

type DeviceModelOption = { id: number; model: string; brand: string }
type VehicleOption = { id: number; licensePlate: string }
type DeviceModelPinout = { id: number; pinName: string; pinTypes: string[] }

type EditableDevice = {
    id: number
    name: string
    deviceModelId: number
    vehicleId: number
    communicationType: string
    isActive: boolean
}

const formSchema = z.object({
    name: z.string().min(1, 'Nama device harus diisi'),
    deviceModelId: z.number().min(1, 'Model device harus dipilih'),
    vehicleId: z.number().min(1, 'Kendaraan harus dipilih'),
    communicationType: z.literal('GSM'),
    isActive: z.boolean(),
    imei: z.string().optional(),
    simNumber: z.string().optional(),
    simProvider: z.string().optional(),
    deviceModelPinoutId: z.number().optional(),
})

type FormSchema = z.infer<typeof formSchema>

interface DialogDeviceEditProps extends PropsWithChildren {
    device: EditableDevice
    onSuccess?: VoidFunction
}

export function DialogDeviceEdit({
    children,
    device,
    onSuccess,
}: DialogDeviceEditProps) {
    const [open, setOpen] = useState(false)
    const [vehiclePopoverOpen, setVehiclePopoverOpen] = useState(false)
    const [isUpdatingSequence, setIsUpdatingSequence] = useState(false)
    const [creationStep, setCreationStep] = useState<string>('')

    // Initialize form
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: device.name,
            deviceModelId: device.deviceModelId,
            vehicleId: device.vehicleId,
            communicationType: (device.communicationType as 'GSM') || 'GSM',
            isActive: device.isActive,
            imei: '',
            simNumber: '',
            simProvider: '',
            deviceModelPinoutId: undefined,
        },
    })

    // Fetch device detail (identifiers, GSM, features) when dialog opens
    const { data: deviceDetail, isLoading: isLoadingDetail } = useSWR(
        open ? `/devices/detail/${device.id}` : null,
        open ? () => getDeviceDetailApi(device.id) : null
    )

    // Fetch device models
    const { data: deviceModels, isLoading: isLoadingModels } = useSWR<DeviceModelOption[]>(
        ['/device-models'],
        () => getDeviceModelsApi()
    )

    // Fetch vehicles
    const { data: vehicles, isLoading: isLoadingVehicles } = useSWR<VehicleOption[]>(
        '/vehicles',
        getAllVehicle
    )

    // Fetch pinouts based on selected device model
    const selectedModelId = form.watch('deviceModelId')
    const { data: pinouts, isLoading: isLoadingPinouts } = useSWR<DeviceModelPinout[]>(
        selectedModelId ? `/device-model-pinout/by-model/${selectedModelId}` : null,
        selectedModelId ? () => deviceModelPinoutApi.getByDeviceModel(selectedModelId) : null
    )

    // Reset pinout when model changes
    const handleModelChange = (modelId: number) => {
        const prevModelId = form.getValues('deviceModelId')
        form.setValue('deviceModelId', modelId)
        // Only reset pinout if model actually changed
        if (prevModelId !== modelId) {
            form.setValue('deviceModelPinoutId', undefined)
        }
    }

    // Populate form with device detail data once loaded
    useEffect(() => {
        if (deviceDetail && open) {
            // Core device fields
            form.setValue('name', deviceDetail.name)
            form.setValue('deviceModelId', deviceDetail.deviceModelId)
            form.setValue('vehicleId', deviceDetail.vehicleId)
            form.setValue('communicationType', deviceDetail.communicationType || 'GSM')
            form.setValue('isActive', deviceDetail.isActive)

            // IMEI (first identifier of type IMEI)
            const imeiIdentifier = deviceDetail.deviceIdentifiers?.find(
                (id) => id.identifierType === 'IMEI'
            )
            form.setValue('imei', imeiIdentifier?.value || '')

            // GSM (first GSM record)
            const gsm = deviceDetail.deviceGsm?.[0]
            form.setValue('simNumber', gsm?.simNumber || '')
            form.setValue('simProvider', gsm?.simProvider || '')

            // Features/Pinout (first feature record)
            const feature = deviceDetail.deviceFeatures?.[0]
            form.setValue('deviceModelPinoutId', feature?.deviceModelPinoutId || undefined)
        }
    }, [deviceDetail, open, form])

    // Filter device models
    const filteredModels = useMemo<DeviceModelOption[]>(() => {
        return deviceModels ?? []
    }, [deviceModels])

    const handleSubmit = async (values: FormSchema) => {
        console.log('📝 Form submitted with values:', values)

        // Validate required fields
        if (!values.name?.trim()) {
            toast.error('Nama device harus diisi')
            return
        }
        if (!values.deviceModelId || values.deviceModelId < 1) {
            toast.error('Tipe device harus dipilih')
            return
        }
        if (!values.vehicleId || values.vehicleId < 1) {
            toast.error('Kendaraan harus dipilih')
            return
        }

        // Determine existing relational records from deviceDetail
        const existingImei = deviceDetail?.deviceIdentifiers?.find(
            (id) => id.identifierType === 'IMEI'
        )
        const existingGsm = deviceDetail?.deviceGsm?.[0]
        const existingFeature = deviceDetail?.deviceFeatures?.[0]

        // Optional field values
        const hasImei = values.imei?.trim()
        const hasSimNumber = values.simNumber?.trim()
        const hasSimProvider = values.simProvider?.trim()
        const hasGsm = hasSimNumber || hasSimProvider

        try {
            setIsUpdatingSequence(true)

            // Step 1: Update Device (REQUIRED)
            setCreationStep('Memperbarui device...')
            console.log('🔵 Step 1: Updating device...')
            const devicePayload = {
                name: values.name,
                communicationType: values.communicationType,
                deviceModelId: values.deviceModelId,
                vehicleId: values.vehicleId,
                isActive: values.isActive ?? true,
            }
            await updateDeviceApi(device.id, devicePayload)
            console.log('✅ Step 1: Device updated')

            // Step 2: IMEI (DeviceIdentifier) - OPTIONAL
            try {
                setCreationStep('Menyimpan IMEI...')
                console.log('🔵 Step 2: Handling IMEI...')
                if (hasImei && existingImei) {
                    // Update existing IMEI
                    await deviceIdentifiersApi.update(existingImei.id, {
                        identifierType: 'IMEI',
                        value: values.imei!,
                    })
                    console.log('✅ Step 2: IMEI updated')
                } else if (hasImei && !existingImei) {
                    // Create new IMEI
                    await deviceIdentifiersApi.create({
                        deviceId: device.id,
                        identifierType: 'IMEI',
                        value: values.imei!,
                    })
                    console.log('✅ Step 2: IMEI created')
                } else if (!hasImei && existingImei) {
                    // Delete existing IMEI (user cleared the field)
                    await deviceIdentifiersApi.delete(existingImei.id)
                    console.log('✅ Step 2: IMEI deleted')
                }
            } catch (error) {
                console.warn('⚠️ Warning: IMEI update failed (non-blocking)', error)
                toast.warning('IMEI tidak berhasil disimpan')
            }

            // Step 3: GSM (DeviceGsm) - OPTIONAL
            try {
                setCreationStep('Menyimpan GSM info...')
                console.log('🔵 Step 3: Handling GSM...')
                if (hasGsm && existingGsm) {
                    // Update existing GSM
                    await deviceGsmApi.update(existingGsm.id, {
                        simNumber: values.simNumber || '',
                        simProvider: values.simProvider || '',
                    })
                    console.log('✅ Step 3: GSM updated')
                } else if (hasGsm && !existingGsm) {
                    // Create new GSM
                    await deviceGsmApi.create({
                        deviceId: device.id,
                        simNumber: values.simNumber || '',
                        simProvider: values.simProvider || '',
                    })
                    console.log('✅ Step 3: GSM created')
                } else if (!hasGsm && existingGsm) {
                    // Delete existing GSM (user cleared both fields)
                    await deviceGsmApi.delete(existingGsm.id)
                    console.log('✅ Step 3: GSM deleted')
                }
            } catch (error) {
                console.warn('⚠️ Warning: GSM update failed (non-blocking)', error)
                toast.warning('GSM Info tidak berhasil disimpan')
            }

            // Step 4: Features/Pinout (DeviceFeature) - OPTIONAL
            try {
                setCreationStep('Menyimpan pinout...')
                console.log('🔵 Step 4: Handling pinout...')
                const hasPinout = values.deviceModelPinoutId && values.deviceModelPinoutId > 0
                if (hasPinout && existingFeature) {
                    // Update existing feature
                    await deviceFeaturesApi.update(existingFeature.id, {
                        deviceModelPinoutId: values.deviceModelPinoutId,
                    })
                    console.log('✅ Step 4: Pinout updated')
                } else if (hasPinout && !existingFeature) {
                    // Create new feature
                    await deviceFeaturesApi.create({
                        deviceId: device.id,
                        featureId: 1, // Default feature ID
                        deviceModelPinoutId: values.deviceModelPinoutId!,
                    })
                    console.log('✅ Step 4: Pinout created')
                } else if (!hasPinout && existingFeature) {
                    // Delete existing feature (user cleared the field)
                    await deviceFeaturesApi.delete(existingFeature.id)
                    console.log('✅ Step 4: Pinout deleted')
                }
            } catch (error) {
                console.warn('⚠️ Warning: Pinout update failed (non-blocking)', error)
                toast.warning('Pinout tidak berhasil disimpan')
            }

            // All steps completed
            setCreationStep('')
            setIsUpdatingSequence(false)
            toast.success('Device berhasil diperbarui')
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error('❌ Error during device update sequence:', error)
            setCreationStep('')
            setIsUpdatingSequence(false)

            const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message ||
                'Gagal memperbarui device. Silakan coba lagi.'
            toast.error(errorMessage)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                aria-description="Edit Device"
                className="max-w-[640px] bg-white"
                type="right"
                onInteractOutside={(e) => {
                    if (vehiclePopoverOpen) {
                        e.preventDefault()
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Edit Device</DialogTitle>
                    <DialogDescription>
                        Memperbarui Tabel Device, Identifiers, GSM, Features
                    </DialogDescription>
                </DialogHeader>

                {isLoadingDetail ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">Memuat data device...</span>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                            {/* SECTION 1: DEVICE (REQUIRED) */}
                            <div className="border-b pb-4">
                                {/* Device Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-600">Nama Device</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Contoh: fmb920-100"
                                                    disabled={isUpdatingSequence}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Device Model */}
                                <FormField
                                    control={form.control}
                                    name="deviceModelId"
                                    render={({ field }) => (
                                        <FormItem className="mt-3">
                                            <FormLabel className="text-gray-600">Tipe Device</FormLabel>
                                            <Select
                                                disabled={isLoadingModels || isUpdatingSequence}
                                                onValueChange={(newValue) => {
                                                    handleModelChange(Number(newValue))
                                                }}
                                                value={field.value ? field.value.toString() : ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-inherit">
                                                        <SelectValue placeholder="Cari atau pilih tipe device..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <div className="max-h-[300px] overflow-y-auto">
                                                        {isLoadingModels ? (
                                                            <div className="py-6 text-center text-sm text-gray-500">
                                                                Loading...
                                                            </div>
                                                        ) : filteredModels.length === 0 ? (
                                                            <div className="py-6 text-center text-sm text-gray-500">
                                                                Tidak ada tipe device
                                                            </div>
                                                        ) : (
                                                            filteredModels.map((item) => (
                                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                                    {item.model} ({item.brand})
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Vehicle */}
                                <FormField
                                    control={form.control}
                                    name="vehicleId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col mt-3">
                                            <FormLabel className="text-gray-600">Kendaraan</FormLabel>
                                            <Popover modal={true} open={vehiclePopoverOpen} onOpenChange={setVehiclePopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={vehiclePopoverOpen}
                                                            disabled={isLoadingVehicles || isUpdatingSequence}
                                                            className={cn(
                                                                "w-full justify-between bg-inherit font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? vehicles?.find((v) => v.id === field.value)?.licensePlate
                                                                : "Cari atau pilih kendaraan..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="p-0"
                                                    style={{ width: 'var(--radix-popover-trigger-width)' }}
                                                >
                                                    <Command>
                                                        <CommandInput placeholder="Cari Plat..." />
                                                        <CommandList>
                                                            {isLoadingVehicles ? (
                                                                <div className="py-6 text-center text-sm text-gray-500">
                                                                    Loading...
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <CommandEmpty>Kendaraan tidak ditemukan</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {(vehicles ?? []).map((item) => (
                                                                            <CommandItem
                                                                                key={item.id}
                                                                                value={item.licensePlate}
                                                                                onSelect={() => {
                                                                                    field.onChange(item.id)
                                                                                    setVehiclePopoverOpen(false)
                                                                                }}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        field.value === item.id ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                {item.licensePlate}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </>
                                                            )}
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* SECTION 2: IDENTIFIERS (OPTIONAL) */}
                            <div className="border-b pb-4">
                                {/* IMEI */}
                                <FormField
                                    control={form.control}
                                    name="imei"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-600">IMEI</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Contoh: 11000290001"
                                                    disabled={isUpdatingSequence}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* SECTION 3: GSM (OPTIONAL) */}
                            <div className="border-b pb-4">
                                {/* No SIM & Provider - 2 Columns */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* No SIM */}
                                    <FormField
                                        control={form.control}
                                        name="simNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-600">No SIM</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="0812345678"
                                                        disabled={isUpdatingSequence}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Provider */}
                                    <FormField
                                        control={form.control}
                                        name="simProvider"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-600">Provider</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Telkomsel"
                                                        disabled={isUpdatingSequence}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* SECTION 4: FEATURES (OPTIONAL) */}
                            <div>
                                {/* Pinout */}
                                <FormField
                                    control={form.control}
                                    name="deviceModelPinoutId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-600">Pinout</FormLabel>
                                            <Select
                                                disabled={!selectedModelId || isLoadingPinouts || isUpdatingSequence}
                                                onValueChange={(newValue) => {
                                                    field.onChange(Number(newValue))
                                                }}
                                                value={field.value ? field.value.toString() : ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-inherit">
                                                        <SelectValue placeholder="Pilih pinout device..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <div className="max-h-[300px] overflow-y-auto">
                                                        {!selectedModelId ? (
                                                            <div className="py-6 text-center text-sm text-gray-500">
                                                                Pilih tipe device terlebih dahulu
                                                            </div>
                                                        ) : isLoadingPinouts ? (
                                                            <div className="py-6 text-center text-sm text-gray-500">
                                                                Loading pinout...
                                                            </div>
                                                        ) : (pinouts?.length ?? 0) === 0 ? (
                                                            <div className="py-6 text-center text-sm text-gray-500">
                                                                Tidak ada pinout untuk device ini
                                                            </div>
                                                        ) : (
                                                            pinouts?.map((item) => (
                                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                                    {item.pinName} {item.pinTypes?.length > 0 && `(${item.pinTypes.join(', ')})`}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isUpdatingSequence}
                                    className="bg-blue-900 disabled:bg-gray-600 w-full"
                                >
                                    {isUpdatingSequence && <Loader2 className="animate-spin mr-2" />}
                                    {isUpdatingSequence ? `${creationStep || 'Menyimpan...'}` : 'Perbarui Device'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
