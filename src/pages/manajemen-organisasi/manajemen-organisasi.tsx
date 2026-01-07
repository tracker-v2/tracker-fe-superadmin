import { useState } from "react";
import { Pencil, Trash2, Plus, Filter, ChevronDown } from "lucide-react";
import DialogOrganisasiTambah from "./dialog-organisasi-tambah";
import DialogOrganisasiEdit from "./dialog-organisasi-edit";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";


// Dummy data for organizations
const organizations = [
    {
        id: 1,
        name: "PT Maximus Indo Asia",
        industry: "Alat Berat",
        unitCount: 104,
        phone: "08161121468",
        email: "Maximus@gmail.com",
        address:
            "Jl. Jendral Sudirman No.78, Babakan, Kec. Tangerang, Kota Tangerang, Banten 15118",
        logo: "/public/maximus.svg", // Ganti dengan path logo yang sesuai
    },
    // Tambahkan data lain jika perlu
    {
        id: 2,
        name: "PT Taraindo Perkasa",
        industry: "Alat Berat",
        unitCount: 104,
        phone: "08161121468",
        email: "Maximus@gmail.com",
        address:
            "Jl. Jendral Sudirman No.78, Babakan, Kec. Tangerang, Kota Tangerang, Banten 15118",
        logo: "/assets/icons/maximus.png",
    },
    {
        id: 3,
        name: "PT Maximus Indo Asia",
        industry: "Alat Berat",
        unitCount: 104,
        phone: "08161121468",
        email: "Maximus@gmail.com",
        address:
            "Jl. Jendral Sudirman No.78, Babakan, Kec. Tangerang, Kota Tangerang, Banten 15118",
        logo: "/assets/icons/maximus.png",
    },
];

export function ManajemenOrganisasiPage() {
    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [dialogOrganisasi, setDialogOrganisasi] = useState<null | "tambah">(null);
    const [deleteOrg, setDeleteOrg] = useState<typeof organizations[0] | null>(null);
    const [editOrg, setEditOrg] = useState<typeof organizations[0] | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Get unique company names for dropdown
    const companyNames = Array.from(new Set(organizations.map((org) => org.name)));

    // Filter organizations by selected company
    const filtered = selectedCompany
        ? organizations.filter((org) => org.name === selectedCompany)
        : organizations;

    return (
        <div className="p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    {/* Dropdown Pilih Perusahaan */}
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-sm border border-[#E2E8F0] rounded bg-gray-50 hover:bg-gray-100 min-w-[200px] justify-between"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className={selectedCompany ? "text-gray-900" : "text-gray-500"}>
                                {selectedCompany || "Pilih Perusahaan"}
                            </span>
                            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-[#E2E8F0] rounded shadow-lg max-h-60 overflow-auto">
                                <div
                                    className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        setSelectedCompany("");
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    Semua Perusahaan
                                </div>
                                {companyNames.map((name) => (
                                    <div
                                        key={name}
                                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedCompany === name ? "bg-blue-50 text-blue-700" : "text-gray-900"}`}
                                        onClick={() => {
                                            setSelectedCompany(name);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Filter Button */}
                    <button
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-[#E2E8F0] rounded bg-gray-50 hover:bg-gray-100"
                        onClick={() => {
                            // Reset filter
                            setSelectedCompany("");
                        }}
                    >
                        <Filter size={16} className="text-gray-600" />
                        <span className="text-gray-700">Filter</span>
                    </button>
                </div>
                <button
                    className="bg-[#1E3A8A] hover:bg-[#162c6b] text-white text-xs px-4 py-2 rounded flex items-center gap-2"
                    onClick={() => setDialogOrganisasi("tambah")}
                >
                    <Plus size={16} />
                    <span>Tambah Perusahaan</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {filtered.map((org) => (
                    <div
                        key={org.id}
                        className="border border-[#E2E8F0] rounded-lg p-4 flex flex-col items-center shadow-sm"
                    >
                        <div className="w-full flex justify-center mb-2">
                            <div className="w-48 h-32 p-4 border border-gray-300 rounded-lg bg-white flex items-center justify-center">
                                <img
                                    src={org.logo}
                                    alt={org.name}
                                    className="object-contain w-24"
                                />
                            </div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-semibold text-base">{org.name}</div>
                            <div className="text-xs text-gray-600">
                                Industri : {org.industry}
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                                Jumlah Unit : {org.unitCount}
                            </div>
                        </div>
                        <div className="text-xs text-gray-700 flex flex-col items-center mb-1">
                            <span className="flex items-center gap-1">
                                <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.06a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.99.35 2.01.59 3.06.72A2 2 0 0 1 21 16.91z"></path></svg>
                                {org.phone}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg>
                                {org.email}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 text-center mb-2 flex items-center gap-1">
                            <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {org.address}
                        </div>
                        {/* edit and delete organization buttons */}
                        <div className="flex w-full gap-2 mt-2">
                            <button
                                className="flex-1 flex items-center justify-center gap-1 border border-blue-700 text-blue-700 rounded py-1 text-xs hover:bg-blue-50"
                                onClick={() => setEditOrg(org)}
                            >
                                <Pencil size={14} stroke="#2563eb" />
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-1 border border-red-500 text-red-500 rounded py-1 text-xs hover:bg-red-50"
                                onClick={() => setDeleteOrg(org)}
                            >
                                <Trash2 size={14} stroke="#ef4444" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Dialog Tambah Organisasi */}
            {dialogOrganisasi === "tambah" && (
                <DialogOrganisasiTambah
                    open={true}
                    setDialogOrganisasi={setDialogOrganisasi}
                />
            )}

            {/* Dialog Edit Organisasi */}
            <DialogOrganisasiEdit
                open={!!editOrg}
                organization={editOrg}
                onClose={() => setEditOrg(null)}
            />

            {/* Dialog Hapus Organisasi */}
            <Dialog open={!!deleteOrg} onOpenChange={(open) => !open && setDeleteOrg(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Hapus Perusahaan</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-600">
                            Apakah anda yakin ingin menghapus <span className="font-semibold">{deleteOrg?.name}</span>?
                        </p>
                    </div>
                    <DialogFooter className="flex gap-2 sm:gap-0">
                        <button
                            className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setDeleteOrg(null)}
                        >
                            Batal
                        </button>
                        <button
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
                            onClick={() => {
                                // TODO: Handle delete logic here
                                console.log("Deleting organization:", deleteOrg?.id);
                                setDeleteOrg(null);
                            }}
                        >
                            HAPUS
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
