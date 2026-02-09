import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState, useEffect } from "react";
import { toast } from "sonner";
import { updateCompanyApi } from "@/api/companies";

interface Organization {
    id: number;
    name: string;
    industryType?: string;
    industry?: string;
    unitCount?: number;
    phoneNumber?: string;
    phone?: string;
    email: string;
    address: string;
    logo?: string;
    picName?: string;
    picPhone?: string;
    picEmail?: string;
    isActive?: boolean;
}

interface DialogOrganisasiEditProps {
    open: boolean;
    organization: Organization | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function DialogOrganisasiEdit({ open, organization, onClose, onSuccess }: DialogOrganisasiEditProps) {
    const [form, setForm] = useState({
        nama: "",
        email: "",
        telepon: "",
        tipeIndustri: "",
        alamat: "",
        pjNama: "",
        pjEmail: "",
        pjTelepon: "",
        codeConfirm: "",
        endDate: "",
    });

    const [loading, setLoading] = useState(false);

    // Populate form with organization data when dialog opens
    useEffect(() => {
        if (organization) {
            setForm({
                nama: organization.name || "",
                email: organization.email || "",
                telepon: organization.phoneNumber || organization.phone || "",
                tipeIndustri: organization.industryType || organization.industry || "",
                alamat: organization.address || "",
                pjNama: "", // Add default or from organization if available
                pjEmail: "",
                pjTelepon: "",
                codeConfirm: "",
                endDate: "",
            });
        }
    }, [organization]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const isFormValid =
        form.nama &&
        form.email &&
        form.telepon &&
        form.tipeIndustri &&
        form.alamat &&
        form.pjNama &&
        form.pjEmail &&
        form.pjTelepon &&
        form.codeConfirm &&
        form.endDate;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (!isFormValid || !organization) {
            toast.error("Semua field harus diisi");
            return;
        }

        setLoading(true);

        try {
            // Prepare data untuk API updateCompanyApi
            const companyData = {
                name: form.nama,
                email: form.email,
                address: form.alamat,
                phoneNumber: form.telepon,
                industryType: form.tipeIndustri,
                picName: form.pjNama,
                picPhone: form.pjTelepon,
                codeConfirm: form.codeConfirm,
                endDate: form.endDate,
                isActive: true,
            };

            await updateCompanyApi(organization.id, companyData);

            toast.success("Perusahaan berhasil diperbarui");

            // Close dialog
            onClose();

            // Trigger refresh data
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error updating company:", error);
            toast.error(error instanceof Error ? error.message : "Gagal memperbarui perusahaan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={() => onClose()}>
            <DialogContent aria-description="edit-org-content" className="max-w-2xl bg-white" type="right">
                <DialogHeader>
                    <DialogTitle>Edit Perusahaan</DialogTitle>
                </DialogHeader>
                <DialogDescription className="sr-only">Form edit perusahaan</DialogDescription>
                <form className="grid gap-6 mt-2" onSubmit={handleSubmit}>
                    <div className="rounded-xl bg-[#F7F8FA] p-6 flex flex-col gap-6">
                        <div>
                            <div className="font-semibold mb-4">Info Perusahaan</div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="nama">Nama</Label>
                                    <Input id="nama" placeholder="Nama" value={form.nama} onChange={handleChange} />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="telepon">Nomor Telepon</Label>
                                    <Input id="telepon" placeholder="Nomor Telepon" value={form.telepon} onChange={handleChange} />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="tipeIndustri">Tipe Industri</Label>
                                    <select id="tipeIndustri" value={form.tipeIndustri} onChange={handleChange} className="border border-border bg-white rounded px-3 py-2 text-sm">
                                        <option value="">Tipe Industri</option>
                                        <option value="konstruksi">Konstruksi</option>
                                        <option value="alat berat">Alat Berat</option>
                                        <option value="iot">IoT</option>
                                    </select>
                                </div>
                                <div className="col-span-2 flex flex-col space-y-2">
                                    <Label htmlFor="alamat">Alamat Perusahaan</Label>
                                    <Input id="alamat" placeholder="Alamat" value={form.alamat} onChange={handleChange} />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="codeConfirm">Kode Konfirmasi</Label>
                                    <Input id="codeConfirm" placeholder="Kode Konfirmasi" value={form.codeConfirm} onChange={handleChange} />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="endDate">Tanggal Berakhir</Label>
                                    <Input id="endDate" type="date" value={form.endDate} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold mb-4">Info Penanggung Jawab</div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="pjNama">Nama</Label>
                                    <Input id="pjNama" placeholder="Nama" value={form.pjNama} onChange={handleChange} />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="pjEmail">Email</Label>
                                    <Input id="pjEmail" type="email" placeholder="Email" value={form.pjEmail} onChange={handleChange} />
                                </div>
                                <div className="col-span-2 flex flex-col space-y-2">
                                    <Label htmlFor="pjTelepon">Nomor Telepon</Label>
                                    <Input id="pjTelepon" placeholder="Nomor Telepon" value={form.pjTelepon} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex justify-end gap-3 mt-4">
                        <Button type="button" variant={"outline"} onClick={() => onClose()} className="bg-transparent" disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" className="bg-blue-900 disabled:bg-gray-600" disabled={!isFormValid || loading}>
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}