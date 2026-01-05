import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ReactNode, Ref, useImperativeHandle } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import useSWRMutation from 'swr/mutation'
import { apiVehicleMaintenance } from '@/api/vehicle-maintenance'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import dayjs from 'dayjs'
import { VehicleMaintenanceFieldOdometer } from './field-odometer'
import { VehicleMaintenance } from '@/types/vehicle-maintenance'

const formSchema = z
    .object({
        lastMaintanance: z.date(),
        monthReminder: z.number(),
        distanceRemainder: z.number(),
    })
type FormSchema = z.infer<typeof formSchema>

export type VehicleMaintenanceFormEditRef = {
    reset: VoidFunction;
}
export type VehicleMaintenanceFormEditProps = {
    item: VehicleMaintenance
    children: (props: { loading: boolean }) => ReactNode
    ref?: Ref<VehicleMaintenanceFormEditRef>
    onSuccess?: VoidFunction
}

export function VehicleMaintenanceFormEdit({ children, ref, onSuccess, item }: VehicleMaintenanceFormEditProps) {
    const { trigger, isMutating } = useSWRMutation('/vehicle-maintenance/edit', (_, { arg }: { arg: FormSchema }) => apiVehicleMaintenance.edit(item.id, { ...arg, lastMaintanance: dayjs(arg.lastMaintanance).startOf('day').toISOString() }), {
        onSuccess() {
            onSuccess?.()
        }
    })
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            lastMaintanance: new Date(item.lastMaintanance),
            monthReminder: item.monthReminder,
            distanceRemainder: item.distanceRemainder,
        }
    })

    useImperativeHandle(ref, () => {
        return {
            reset: form.reset,
        }
    }, [form.reset])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => trigger(values))} className="space-y-4">
                <FormItem>
                    <FormLabel className="text-gray-600">Kendaraan</FormLabel>
                    <Input value={item.vehicle.licensePlate} disabled />
                </FormItem>

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
                        <FormLabel>Odometer Saat Ini</FormLabel>
                        <VehicleMaintenanceFieldOdometer vehicleId={item.vehicle.id} />
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
                            <FormLabel className="text-gray-600">Interval Kilometer Servis</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="pr-10 bg-inherit"
                                        {...form.register('distanceRemainder', {
                                            valueAsNumber: true,
                                        })}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 h-full item text-gray-500">KM</div>
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