import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { ReactNode, Ref, useImperativeHandle, useMemo, useEffect, useRef } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import useSWRMutation from 'swr/mutation'
import { apiVehicleMaintenance } from '@/api/vehicle-maintenance'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useSWR from 'swr'
import dayjs from 'dayjs'
import { VehicleMaintenanceFieldOdometer } from './field-odometer'
import { getVehicleDetail, getLicensePlate } from '@/api/vehicle'
import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

type VehicleOption = { id: number; licensePlate: string }

const formSchema = z
    .object({
        vehicleId: z.number(),
        lastMaintanance: z.date(),
        monthReminder: z.number(),
        distanceRemainder: z.number(),
    })
type FormSchema = z.infer<typeof formSchema>

export type VehicleMaintenanceFormCreateRef = {
    reset: VoidFunction;
}
export type VehicleMaintenanceFormCreateProps = {
    children: (props: { loading: boolean }) => ReactNode
    ref?: Ref<VehicleMaintenanceFormCreateRef>
    onSuccess?: VoidFunction
}

export function VehicleMaintenanceFormCreate({ children, ref, onSuccess }: VehicleMaintenanceFormCreateProps) {
    const companyId = useAuthStore((s) => s.user?.companyId)
    const getVehicles = useSWR<VehicleOption[]>(
        companyId ? ['/vehicle-maintenance/vehicle-select', companyId] : null,
        ([, id]: [string, number]) => getLicensePlate(Number(id))
    )
    const { trigger, isMutating } = useSWRMutation('/vehicle-maintenance/create', (_, { arg }: { arg: FormSchema }) => apiVehicleMaintenance.create({ ...arg, lastMaintanance: dayjs(arg.lastMaintanance).startOf('day').toISOString() }), {
        onSuccess() {
            onSuccess?.()
        }
    })
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
    })
    const vehicleId = useWatch({
        control: form.control,
        name: "vehicleId",
    })

    // Fetch vehicle detail when vehicleId changes
    const { data: vehicleDetail } = useSWR(
        vehicleId ? ['/vehicle-detail', vehicleId] : null,
        ([, id]) => getVehicleDetail(id, companyId!)
    )

    // Get vehicle type from database
    const displayType = useMemo(() => {
        if (!vehicleDetail) return undefined;
        return vehicleDetail.vehicleType;
    }, [vehicleDetail]);

    const usesHourMeter = displayType === "EXCAVATOR" || displayType === "BULLDOZER" || displayType === "WHEEL_LOADER" || displayType === "GRADER";
    const odometerLabel = usesHourMeter ? "Hourmeter Saat Ini" : "Odometer Saat Ini";
    const distanceLabel = usesHourMeter ? "Interval Jam Servis" : "Interval Kilometer Servis";
    const distanceUnit = usesHourMeter ? "Jam" : "KM";

    // State untuk search dengan debounce
    const [searchVehicle, setSearchVehicle] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Debounce search input dengan delay 300ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchVehicle)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchVehicle])

    // Auto focus input when select opens
    useEffect(() => {
        if (isSelectOpen && !vehicleId && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 0)
        }
    }, [isSelectOpen, vehicleId])

    // Filter vehicles berdasarkan debounced search
    const filteredVehicles = useMemo<VehicleOption[]>(() => {
        if (!debouncedSearch) return getVehicles.data ?? []
        return (getVehicles.data ?? []).filter((item) =>
            item.licensePlate.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
    }, [getVehicles.data, debouncedSearch])

    // Get selected vehicle info
    const selectedVehicle = useMemo<VehicleOption | null>(() => {
        if (!vehicleId) return null
        return getVehicles.data?.find((item) => item.id === vehicleId) ?? null
    }, [vehicleId, getVehicles.data])

    useImperativeHandle(ref, () => {
        return {
            reset: form.reset,
        }
    }, [form.reset])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => trigger(values))} className="space-y-4">
                <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-600">Kendaraan</FormLabel>
                            <Select
                                disabled={getVehicles.isLoading}
                                open={isSelectOpen}
                                onOpenChange={(open) => {
                                    setIsSelectOpen(open)
                                    if (!open) {
                                        setSearchVehicle('')
                                        setDebouncedSearch('')
                                    }
                                }}
                                onValueChange={(newValue) => {
                                    field.onChange(Number(newValue))
                                    setSearchVehicle('')
                                    setDebouncedSearch('')
                                    setIsSelectOpen(false)
                                }}
                                value={field.value?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger
                                        className="bg-inherit"
                                        onClick={(e) => {
                                            // Jika ada value, izinkan trigger membuka dropdown
                                            // Jika tidak ada value dan klik di input, prevent default
                                            if (!field.value && e.target === inputRef.current) {
                                                e.preventDefault()
                                            }
                                        }}
                                    >
                                        {selectedVehicle ? (
                                            <SelectValue>
                                                {selectedVehicle.licensePlate}
                                            </SelectValue>
                                        ) : (
                                            <Input
                                                ref={inputRef}
                                                placeholder="Cari atau pilih kendaraan..."
                                                value={searchVehicle}
                                                onChange={(e) => {
                                                    e.stopPropagation()
                                                    setSearchVehicle(e.target.value)
                                                }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation()
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (!isSelectOpen) {
                                                        setIsSelectOpen(true)
                                                    }
                                                }}
                                                onFocus={(e) => {
                                                    e.stopPropagation()
                                                    if (!isSelectOpen) {
                                                        setIsSelectOpen(true)
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    e.stopPropagation()
                                                    // Prevent Enter from triggering form submit or select action
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                    }
                                                }}
                                                className="border-0 h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                        )}
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {filteredVehicles.length === 0 ? (
                                            <div className="py-6 text-center text-sm text-gray-500">
                                                {debouncedSearch ? 'Kendaraan tidak ditemukan' : 'Ketik untuk mencari...'}
                                            </div>
                                        ) : (
                                            filteredVehicles.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.licensePlate}
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

                <div className="grid grid-cols-2 gap-5">
                    <FormField
                        control={form.control}
                        name="lastMaintanance"
                        render={({ field }) => (
                            <FormItem className="flex flex-col col-span-1">
                                <FormLabel>Tanggal Service Terakhir</FormLabel>
                                <FormControl>
                                    <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={(date) => date > new Date()}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormItem className="flex flex-col col-span-1">
                        <FormLabel>{odometerLabel}</FormLabel>
                        <VehicleMaintenanceFieldOdometer vehicleId={vehicleId} isExcavator={usesHourMeter} />
                    </FormItem>
                </div>

                <FormField
                    control={form.control}
                    name="monthReminder"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-gray-600">Interval Waktu Service</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="pr-14 bg-inherit"
                                        {...form.register('monthReminder', {
                                            valueAsNumber: true,
                                        })}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 h-full item text-gray-500">Bulan</div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="distanceRemainder"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-gray-600">{distanceLabel}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="pr-10 bg-inherit"
                                        {...form.register('distanceRemainder', {
                                            valueAsNumber: true,
                                        })}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 h-full item text-gray-500">{distanceUnit}</div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {children({ loading: isMutating })}
            </form>
        </Form>
    )
}