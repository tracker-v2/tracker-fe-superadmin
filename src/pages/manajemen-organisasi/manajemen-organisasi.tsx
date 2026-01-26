import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import DialogOrganisasiTambah from "./dialog-organisasi-tambah";
import DialogOrganisasiEdit from "./dialog-organisasi-edit";
import { getCompaniesApi, deleteCompanyApi } from "@/api/companies";
import { getVehiclesCountByCompany } from "@/api/vehicle";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

// Interface untuk Company API
interface Company {
    id: number;
    name: string;
    address: string;
    email: string;
    phoneNumber: string;
    industryType: string;
    picName: string;
    picPhone: string;
    isActive: boolean;
}

// Interface untuk display data
interface DisplayCompany extends Company {
    unitCount: number;
}

export function ManajemenOrganisasiPage() {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState<DisplayCompany[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [dialogOrganisasi, setDialogOrganisasi] = useState<null | "tambah">(null);
    const [deleteOrg, setDeleteOrg] = useState<DisplayCompany | null>(null);
    const [editOrg, setEditOrg] = useState<DisplayCompany | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch companies dari API
    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const companies: Company[] = await getCompaniesApi();

            // Map API data ke display format dan fetch jumlah unit untuk setiap perusahaan
            const displayCompanies: DisplayCompany[] = await Promise.all(
                companies.map(async (company) => {
                    try {
                        const count = await getVehiclesCountByCompany(company.id);
                        return {
                            ...company,
                            unitCount: count ?? 0, // Default 0 jika null/undefined
                        };
                    } catch (error) {
                        console.error(`Error fetching vehicle count for company ${company.id}:`, error);
                        return {
                            ...company,
                            unitCount: 0, // Default 0 jika error
                        };
                    }
                })
            );

            setOrganizations(displayCompanies);
        } catch (error) {
            console.error("Error fetching companies:", error);
            setOrganizations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    // Filter organizations by search query
    const filtered = organizations.filter((org) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.phoneNumber.includes(searchQuery)
    );

    const handleCardClick = (org: DisplayCompany) => {
        navigate(`/list-kendaraan/${org.id}`, { state: { company: org } });
    };

    const handleEditClick = (e: React.MouseEvent, org: DisplayCompany) => {
        e.stopPropagation();
        setEditOrg(org);
    };

    const handleDeleteClick = (e: React.MouseEvent, org: DisplayCompany) => {
        e.stopPropagation();
        setDeleteOrg(org);
    };

    const handleConfirmDelete = async () => {
        if (!deleteOrg) return;

        setDeleteLoading(true);

        try {
            await deleteCompanyApi(deleteOrg.id);

            toast.success("Perusahaan berhasil dihapus");
            setDeleteOrg(null);

            // Refresh data
            await fetchCompanies();
        } catch (error) {
            console.error("Error deleting company:", error);
            toast.error(error instanceof Error ? error.message : "Gagal menghapus perusahaan");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white">
            {/* Header dengan Search Bar dan Button Tambah */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama perusahaan"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                    </div>
                </div>
                <button
                    className="bg-[#1E3A8A] hover:bg-[#162c6b] text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 ml-4"
                    onClick={() => setDialogOrganisasi("tambah")}
                >
                    <Plus size={18} />
                    <span>Tambah Perusahaan</span>
                </button>
            </div>

            {/* Grid Cards Organisasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((org) => (
                    <div
                        key={org.id}
                        className="border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleCardClick(org)}
                    >
                        {/* Logo Area */}
                        <div className=" p-6 flex items-center justify-center border-b h-40">
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-2xl font-bold text-[#1E3A8A]">
                                    {/* {org.name.substring(0, 1)} */}
                                    <img src="/maximus.svg" alt="company logo" />
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6">
                            {/* Company Name */}
                            <h3 className="text-base font-semibold text-gray-900 mb-1 text-center">
                                {org.name}
                            </h3>

                            {/* Industry Type */}
                            <p className="text-xs text-gray-600 text-center mb-4">
                                Industri : {org.industryType}
                            </p>

                            {/* Unit Count */}
                            <p className="text-xs text-gray-600 text-center mb-6">
                                Jumlah Unit : {org.unitCount}
                            </p>

                            {/* Info Details */}
                            <div className="space-y-3 mb-6 text-xs">
                                {/* Phone */}
                                <div className="flex items-center justify-center">
                                    <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mr-2">
                                        <path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.06a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.99.35 2.01.59 3.06.72A2 2 0 0 1 21 16.91z"></path>
                                    </svg>
                                    <span className="text-gray-600">{org.phoneNumber}</span>
                                </div>

                                {/* Email */}
                                <div className="flex items-center justify-center">
                                    <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mr-2">
                                        <path d="M4 4h16v16H4z" />
                                        <path d="M22 6l-10 7L2 6" />
                                    </svg>
                                    <span className="text-gray-600 truncate">{org.email}</span>
                                </div>

                                {/* Address */}
                                <div className="flex items-start justify-center">
                                    <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mr-2 mt-0.5">
                                        <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <span className="text-gray-600 text-center">{org.address}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 border-t border-[#E2E8F0] pt-4">
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 p-2 border border-blue-700 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                                    onClick={(e) => handleEditClick(e, org)}
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 p-2 border border-red-500 text-red-500 rounded hover:bg-red-50 transition-colors"
                                    onClick={(e) => handleDeleteClick(e, org)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">Tidak ada organisasi yang ditemukan</p>
                </div>
            )}
            {/* Dialog Tambah Organisasi */}
            {dialogOrganisasi === "tambah" && (
                <DialogOrganisasiTambah
                    open={true}
                    setDialogOrganisasi={setDialogOrganisasi}
                    onSuccess={fetchCompanies}
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
                            className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => setDeleteOrg(null)}
                            disabled={deleteLoading}
                        >
                            Batal
                        </button>
                        <button
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium disabled:bg-gray-600"
                            onClick={handleConfirmDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? "Menghapus..." : "HAPUS"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}