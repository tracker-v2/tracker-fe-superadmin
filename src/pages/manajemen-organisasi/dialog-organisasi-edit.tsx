import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState, useEffect } from "react";

interface Organization {
    id: number;
    name: string;
    industry: string;
    unitCount: number;
    phone: string;
    email: string;
    address: string;
    logo: string;
}

interface DialogOrganisasiEditProps {
    open: boolean;
    organization: Organization | null;
    onClose: () => void;
}

export default function DialogOrganisasiEdit({ open, organization, onClose }: DialogOrganisasiEditProps) {
    const [form, setForm] = useState({
        nama: "",
        email: "",
        telepon: "",
        tipeIndustri: "",
        alamat: "",
        pjNama: "",
        pjEmail: "",
        pjTelepon: "",
    });

    // Populate form with organization data when dialog opens
    useEffect(() => {
        if (organization) {
            setForm({
                nama: organization.name || "",
                email: organization.email || "",
                telepon: organization.phone || "",
                tipeIndustri: organization.industry || "",
                alamat: organization.address || "",
                pjNama: "", // Add default or from organization if available
                pjEmail: "",
                pjTelepon: "",
            });
        }
    }, [organization]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const isFormValid = form.nama && form.email && form.telepon && form.tipeIndustri && form.alamat;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        // TODO: Submit edit logic here
        console.log("Updating organization:", organization?.id, form);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={() => onClose()}>
            <DialogContent aria-description="edit-org-content" className="max-w-2xl bg-white" type="right">
                <DialogHeader>
                    <DialogTitle>Edit Perusahaan</DialogTitle>
                </DialogHeader>
                <DialogDescription className="sr-only">Form edit perusahaan</DialogDescription>
                <form className="grid gap-6 mt-2" onSubmit={handleSubmit}>
                    <div>
                        <div className="font-semibold mb-4">Info Perusahaan</div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="nama">Nama Perusahaan</Label>
                                <Input id="nama" placeholder="Nama Perusahaan" value={form.nama} onChange={handleChange} />
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
                                    <option value="Kontraktor">Kontraktor</option>
                                    <option value="Konstruksi">Konstruksi</option>
                                    <option value="Alat Berat">Alat Berat</option>
                                    <option value="IoT">IoT</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex flex-col space-y-2">
                                <Label htmlFor="alamat">Alamat Perusahaan</Label>
                                <Input id="alamat" placeholder="Alamat Perusahaan" value={form.alamat} onChange={handleChange} />
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
                    <div className="w-full flex justify-end gap-3 mt-4">
                        <Button type="button" variant={"outline"} onClick={() => onClose()} className="bg-transparent">
                            BATAL
                        </Button>
                        <Button type="submit" className="bg-blue-900 disabled:bg-gray-600" disabled={!isFormValid}>
                            SIMPAN PERUBAHAN
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}