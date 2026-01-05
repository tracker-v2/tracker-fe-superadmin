import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ReactNode, Ref, useImperativeHandle } from 'react'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import useSWRMutation from 'swr/mutation'
import { apiVehicleMaintenance } from '@/api/vehicle-maintenance'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z
    .object({
        description: z.string().min(1),
    })
type FormSchema = z.infer<typeof formSchema>

export type VehicleMaintenanceFormCreateRef = {
    reset: VoidFunction;
}
export type VehicleMaintenanceFormCreateProps = {
    maintananceId: number;
    children: (props: { loading: boolean }) => ReactNode
    ref?: Ref<VehicleMaintenanceFormCreateRef>
    onSuccess?: VoidFunction
}

export function VehicleMaintenanceDetailFormCreate({ children, ref, onSuccess, maintananceId }: VehicleMaintenanceFormCreateProps) {
    const { trigger, isMutating } = useSWRMutation('/vehicle-maintenance/detail/create', (_, { arg }: { arg: FormSchema }) => apiVehicleMaintenance.detailCreate(maintananceId, arg), {
        onSuccess() {
            onSuccess?.()
        }
    })
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
    })
    useImperativeHandle(ref, () => {
        return {
            reset: form.reset,
        }
    }, [])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => trigger(values))} className="space-y-4">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            {/* <FormLabel className="text-gray-600">Interval Waktu Service</FormLabel> */}
                            <FormControl>
                                <Textarea
                                    placeholder="Catatan service"
                                    className="resize-none"
                                    rows={5}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Kolom wajib diisi, jika tidak ada catatan bisa menggunakan tanda -</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {children({ loading: isMutating })}
            </form>
        </Form>
    )
}