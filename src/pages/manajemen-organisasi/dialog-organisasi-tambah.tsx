import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createCompanyApi } from "@/api/companies";

interface DialogOrganisasiTambahProps {
    open: boolean;
    setDialogOrganisasi: (value: "tambah" | null) => void;
    onSuccess?: () => void;
}

export default function DialogOrganisasiTambah({ open, setDialogOrganisasi, onSuccess }: DialogOrganisasiTambahProps) {
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

        if (!isFormValid) {
            toast.error("Semua field harus diisi");
            return;
        }

        setLoading(true);

        try {
            // Prepare data untuk API createCompanyApi
            const companyData = {
                name: form.nama,
                email: form.email,
                address: form.alamat,
                phoneNumber: form.telepon,
                industryType: form.tipeIndustri,
                picName: form.pjNama,
                picPhone: form.pjTelepon,
                codeConfirm: form.codeConfirm, // Diisi dari form
                startDate: new Date().toISOString().split('T')[0], // Set tanggal hari ini
                endDate: form.endDate, // Diisi dari form
                isActive: true, // Default active
            };

            await createCompanyApi(companyData);

            toast.success("Perusahaan berhasil ditambahkan");

            // Reset form
            setForm({
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

            // Close dialog
            setDialogOrganisasi(null);

            // Trigger refresh data
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error adding company:", error);
            toast.error(error instanceof Error ? error.message : "Gagal menambah perusahaan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={() => setDialogOrganisasi(null)}>
            <DialogContent aria-description="new-org-content" className="max-w-2xl bg-white" type="right">
                <DialogHeader>
                    <DialogTitle>Tambah Perusahaan</DialogTitle>
                </DialogHeader>
                <DialogDescription className="sr-only">Form tambah perusahaan</DialogDescription>
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
                        <Button type="button" variant={"outline"} onClick={() => setDialogOrganisasi(null)} className="bg-transparent" disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" className="bg-blue-900 disabled:bg-gray-600" disabled={!isFormValid || loading}>
                            {loading ? "Menyimpan..." : "Tambah Perusahaan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}