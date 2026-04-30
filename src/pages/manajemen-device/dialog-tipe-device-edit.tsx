'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import useSWRMutation from 'swr/mutation'
import { deviceModelApi } from '@/api/device-model'
import { toast } from 'sonner'
import { PropsWithChildren } from 'react'
import { AxiosError } from 'axios'

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

    // SWR Mutation for updating device model
    const { trigger, isMutating } = useSWRMutation(
        `/device-models/edit/${deviceModel.id}`,
        (_, { arg }: { arg: FormSchema }) => deviceModelApi.update(deviceModel.id, arg),
        {
            onSuccess() {
                toast.success('Tipe device berhasil diperbarui')
                setOpen(false)
                onSuccess?.()
            },
            onError(error: AxiosError | unknown) {
                const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || 'Gagal memperbarui tipe device'
                console.error('❌ Update device model error:', error)
                toast.error(errorMessage)
            },
        }
    )

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            brand: deviceModel.brand,
            model: deviceModel.model,
        },
    })

    const handleSubmit = async (values: FormSchema) => {
        console.log('📝 Updating device model:', values)
        trigger(values)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                aria-description="Edit Tipe Device"
                className="max-w-[640px] bg-white"
                type="right"
            >
                <DialogHeader>
                    <DialogTitle>Edit Tipe Device</DialogTitle>
                    <DialogDescription>Perbarui data tipe device</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                                            disabled={isMutating}
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
                                            disabled={isMutating}
                                        />
                                    </FormControl>
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
                                {isMutating ? 'Menyimpan...' : 'Perbarui Tipe Device'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
