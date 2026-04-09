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
import useSWRMutation from 'swr/mutation'
import { createDeviceApi, getDeviceModelsApi } from '@/api/device'
import { getAllVehicle } from '@/api/vehicle'
// import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import { PropsWithChildren } from 'react'
import { AxiosError } from 'axios'

type DeviceModelOption = { id: number; model: string; brand: string }
type VehicleOption = { id: number; licensePlate: string }

const formSchema = z.object({
    name: z.string().min(1, 'Nama device harus diisi'),
    deviceModelId: z.number().min(1, 'Model device harus dipilih'),
    vehicleId: z.number().min(1, 'Kendaraan harus dipilih'),
    communicationType: z.literal('GSM'),
    isActive: z.boolean(),
})

type FormSchema = z.infer<typeof formSchema>

export function DialogDeviceTambah({
    children,
    onSuccess,
}: PropsWithChildren<{ onSuccess?: VoidFunction }>) {
    const [open, setOpen] = useState(false)
    const [vehiclePopoverOpen, setVehiclePopoverOpen] = useState(false)
    // const companyId = useAuthStore((s) => s.user?.companyId)

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

    // SWR Mutation for creating device
    const { trigger, isMutating } = useSWRMutation(
        '/devices',
        (_, { arg }: { arg: FormSchema }) => createDeviceApi(arg),
        {
            onSuccess() {
                toast.success('Device berhasil ditambahkan')
                form.reset()
                setOpen(false)
                onSuccess?.()
            },
            onError(error: AxiosError | unknown) {
                const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || 'Gagal menambahkan device'
                console.error('❌ Create device error:', error)
                toast.error(errorMessage)
            },
        }
    )

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            deviceModelId: 0,
            vehicleId: 0,
            communicationType: 'GSM',
            isActive: true,
        },
    })



    // Filter device models - tanpa search, tampilkan semua
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
            toast.error('Model device harus dipilih')
            return
        }
        if (!values.vehicleId || values.vehicleId < 1) {
            toast.error('Kendaraan harus dipilih')
            return
        }

        trigger(values)
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
                    <DialogDescription>Isikan data device</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                                            placeholder="Contoh: Device A..."
                                            disabled={isMutating}
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
                                <FormItem>
                                    <FormLabel className="text-gray-600">Model Device</FormLabel>
                                    <Select
                                        disabled={isLoadingModels || isMutating}
                                        onValueChange={(newValue) => {
                                            field.onChange(Number(newValue))
                                        }}
                                        value={field.value ? field.value.toString() : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-inherit">
                                                <SelectValue placeholder="Cari atau pilih model device..." />
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
                                                        Tidak ada model device
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
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-gray-600">Kendaraan</FormLabel>
                                    <Popover modal={true} open={vehiclePopoverOpen} onOpenChange={setVehiclePopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={vehiclePopoverOpen}
                                                    disabled={isLoadingVehicles || isMutating}
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

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isMutating}
                                className="bg-blue-900 disabled:bg-gray-600 w-full"
                            >
                                {isMutating && <Loader2 className="animate-spin" />}
                                {isMutating ? 'Menyimpan...' : 'Simpan Device'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
