'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useMemo } from 'react'
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
import { createDeviceApi, getDeviceModelsApi, getDevicesListApi } from '@/api/device'
import { deviceModelPinoutApi } from '@/api/device-model-pinout'
import { deviceIdentifiersApi } from '@/api/device-identifiers'
import { deviceGsmApi } from '@/api/device-gsm'
import { deviceFeaturesApi } from '@/api/device-features'
import { getAllVehicle } from '@/api/vehicle'
// import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import { PropsWithChildren } from 'react'
import { AxiosError } from 'axios'

type DeviceModelOption = { id: number; model: string; brand: string }
type VehicleOption = { id: number; licensePlate: string }
type DeviceModelPinout = { id: number; pinName: string; pinTypes: string[] }

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

export function DialogDeviceTambah({
    children,
    onSuccess,
}: PropsWithChildren<{ onSuccess?: VoidFunction }>) {
    const [open, setOpen] = useState(false)
    const [vehiclePopoverOpen, setVehiclePopoverOpen] = useState(false)
    const [isCreatingSequence, setIsCreatingSequence] = useState(false)
    const [creationStep, setCreationStep] = useState<string>('')
    // const companyId = useAuthStore((s) => s.user?.companyId)

    // Initialize form first
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            deviceModelId: 0,
            vehicleId: 0,
            communicationType: 'GSM',
            isActive: true,
            imei: '',
            simNumber: '',
            simProvider: '',
            deviceModelPinoutId: undefined,
        },
    })

    // FETCH
    const { data: deviceModels, isLoading: isLoadingModels } = useSWR<DeviceModelOption[]>(
        ['/device-models'],
        () => getDeviceModelsApi()
    )
    const { data: vehicles, isLoading: isLoadingVehicles } = useSWR<VehicleOption[]>(
        '/vehicles',
        getAllVehicle
    )
    const { data: existingDevices, isLoading: isLoadingDevices } = useSWR(
        '/devices/list',
        () => getDevicesListApi()
    )

    // filter available vehicles - nanti tampilkan yang belum punya device
    const availableVehicles = useMemo(() => {
        if (!vehicles || !existingDevices) return vehicles ?? []
        
        const vehicleIdsWithDevice = new Set(existingDevices.map((device: { vehicleId: number }) => device.vehicleId))
        return vehicles.filter((vehicle) => !vehicleIdsWithDevice.has(vehicle.id))
    }, [vehicles, existingDevices])

    // Fetch pinouts based on selected device model
    const selectedModelId = form.watch('deviceModelId')
    const { data: pinouts, isLoading: isLoadingPinouts, error: pinoutsError } = useSWR<DeviceModelPinout[]>(
        selectedModelId ? `/device-model-pinout/by-model/${selectedModelId}` : null,
        selectedModelId ? () => deviceModelPinoutApi.getByDeviceModel(selectedModelId) : null
    )

    // Debug logging
    if (selectedModelId && pinoutsError) {
        console.error('❌ Error fetching pinouts:', pinoutsError)
    }
    if (selectedModelId && pinouts) {
        console.log(`✅ Pinouts loaded for model ${selectedModelId}:`, pinouts)
    }

    // Debug logging
    if (selectedModelId && pinoutsError) {
        console.error('❌ Error fetching pinouts:', pinoutsError)
    }
    if (selectedModelId && pinouts) {
        console.log(`✅ Pinouts loaded for model ${selectedModelId}:`, pinouts)
    }

    // Reset pinout when model changes
    const handleModelChange = (modelId: number) => {
        form.setValue('deviceModelId', modelId)
        form.setValue('deviceModelPinoutId', undefined)
        console.log('📝 Device model changed to:', modelId)
    }





    // Filter device models - tanpa search, tampilkan semua
    const filteredModels = useMemo<DeviceModelOption[]>(() => {
        return deviceModels ?? []
    }, [deviceModels])

    const handleSubmit = async (values: FormSchema) => {
        console.log('📝 Form submitted with values:', values)

        // Validate required fields only (Device, Type, Vehicle)
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

        // Optional fields
        const hasImei = values.imei?.trim()
        const hasSimNumber = values.simNumber?.trim()
        const hasSimProvider = values.simProvider?.trim()
        const hasGsm = hasSimNumber || hasSimProvider

        try {
            setIsCreatingSequence(true)
            
            // Step 1: Create Device (REQUIRED)
            setCreationStep('Membuat device...')
            console.log('🔵 Step 1: Creating device...')
            const devicePayload = {
                name: values.name,
                communicationType: values.communicationType,
                deviceModelId: values.deviceModelId,
                vehicleId: values.vehicleId,
                isActive: values.isActive ?? true,
            }
            
            const deviceRes = await createDeviceApi(devicePayload)
            const deviceId = deviceRes.id
            console.log('Step 1: Device created with ID:', deviceId)
            
            // Step 2: Create IMEI (DeviceIdentifier) - OPTIONAL
            if (hasImei) {
                try {
                    setCreationStep('Menyimpan IMEI...')
                    console.log('Step 2: Creating device identifier (IMEI)...')
                    await deviceIdentifiersApi.create({
                        deviceId: deviceId,
                        identifierType: 'IMEI',
                        value: values.imei!,
                    })
                    console.log('Step 2: IMEI created')
                } catch (error) {
                    console.warn('Warning: IMEI creation failed (non-blocking)', error)
                    toast.warning('IMEI tidak berhasil disimpan')
                }
            }
            
            // Step 3: Create SIM Info (DeviceGsm) - OPTIONAL
            if (hasGsm) {
                try {
                    setCreationStep('Menyimpan GSM info...')
                    console.log('🔵 Step 3: Creating device GSM...')
                    await deviceGsmApi.create({
                        deviceId: deviceId,
                        simNumber: values.simNumber || '',
                        simProvider: values.simProvider || '',
                    })
                    console.log('Step 3: GSM info created')
                } catch (error) {
                    console.warn('Warning: GSM creation failed (non-blocking)', error)
                    toast.warning('GSM Info tidak berhasil disimpan')
                }
            }
            
            // Step 4: Create/Link Pinout (DeviceFeature) - OPTIONAL
            if (values.deviceModelPinoutId && values.deviceModelPinoutId > 0) {
                try {
                    setCreationStep('Menyimpan pinout...')
                    console.log('🔵 Step 4: Creating device feature (pinout)...')
                    await deviceFeaturesApi.create({
                        deviceId: deviceId,
                        featureId: 1, // Default feature ID
                        deviceModelPinoutId: values.deviceModelPinoutId,
                    })
                    console.log('Step 4: Pinout created')
                } catch (error) {
                    console.warn('Warning: Pinout creation failed (non-blocking)', error)
                    toast.warning('Pinout tidak berhasil disimpan')
                }
            }
            
            // All steps completed
            setCreationStep('')
            setIsCreatingSequence(false)
            toast.success('Device berhasil ditambahkan')
            form.reset()
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error('❌ Error during device creation sequence:', error)
            setCreationStep('')
            setIsCreatingSequence(false)
            
            const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || 
                               'Gagal menambahkan device. Silakan coba lagi.'
            toast.error(errorMessage)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                aria-description="Tambah Device"
                className="max-w-[640px] bg-white"
                type="right"
                onInteractOutside={(e) => {
                    if (vehiclePopoverOpen) {
                        e.preventDefault()
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Tambah Device</DialogTitle>
                    <DialogDescription>
                        Menambahkan Tabel Device, Identifiers, GSM, Features
                    </DialogDescription>
                </DialogHeader>

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
                                                placeholder="Example: fmb920-100"
                                                disabled={isCreatingSequence}
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
                                            disabled={isLoadingModels || isCreatingSequence}
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
                                                        disabled={isLoadingVehicles || isLoadingDevices || isCreatingSequence}
                                                        className={cn(
                                                            "w-full justify-between bg-inherit font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? availableVehicles?.find((v) => v.id === field.value)?.licensePlate
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
                                                        {isLoadingVehicles || isLoadingDevices ? (
                                                            <div className="py-6 text-center text-sm text-gray-500">
                                                                Loading...
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <CommandEmpty>Kendaraan tidak ditemukan atau semua kendaraan sudah memiliki device</CommandEmpty>
                                                                <CommandGroup>
                                                                    {(availableVehicles ?? []).map((item) => (
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
                                                disabled={isCreatingSequence}
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
                                                    disabled={isCreatingSequence}
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
                                                    disabled={isCreatingSequence}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* SECTION 4: FEATURES (OPTIONAL) */}
                        {/* 
                            NOTE: Pinout disimpan di tabel device_features, bukan device.
                            Flow: Pilih pinout → Create device → POST /device-features/create
                            Tabel device_features menyimpan: deviceId, featureId, deviceModelPinoutId
                        */}
                        <div>                            
                            {/* Pinout */}
                            <FormField
                                control={form.control}
                                name="deviceModelPinoutId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-600">Pinout</FormLabel>
                                        <Select
                                            disabled={!selectedModelId || isLoadingPinouts || isCreatingSequence}
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
                                                            <Loader2 className="animate-spin mx-auto mb-2 h-4 w-4" />
                                                            Loading pinout...
                                                        </div>
                                                    ) : pinoutsError ? (
                                                        <div className="py-6 text-center text-sm text-red-500">
                                                            ⚠️ Error memuat pinout. Silakan coba lagi.
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
                                disabled={isCreatingSequence || isLoadingDevices}
                                className="bg-blue-900 disabled:bg-gray-600 w-full"
                            >
                                {isCreatingSequence && <Loader2 className="animate-spin mr-2" />}
                                {isCreatingSequence ? `${creationStep || 'Menyimpan...'}` : 'Buat Device'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
