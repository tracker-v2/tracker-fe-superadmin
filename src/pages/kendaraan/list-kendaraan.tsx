import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search, Plus, Trash2, SquarePen, Ellipsis } from "lucide-react";
import { DialogKendaraanTambah } from "@/pages/kendaraan/dialog-kendaraan-tambah";
import { DialogKendaraanEdit } from "@/pages/kendaraan/dialog-kendaraan-edit";
import { DialogModelKendaraanTambah } from "@/pages/kendaraan/dialog-model-kendaraan-tambah";
import {
    getDetailedListVehiclesByCompany,
    deleteVehicleById
} from "@/api/vehicle";
import { ListModelKendaraan } from "@/pages/kendaraan/list-model-kendaraan";
import { toast } from "sonner";
import { ModelKendaraanFormData, Vehicle } from "@/pages/kendaraan/types";

// Filter options untuk vehicle types
const filterOptions = [
    { value: "EXCAVATOR", label: "Excavator" },
    { value: "DUMP_TRUCK", label: "Dump Truck" },
    { value: "BULLDOZER", label: "Bulldozer" },
    { value: "WHEEL_LOADER", label: "Wheel Loader" },
    { value: "GRADER", label: "Grader" },
    { value: "ROAD_ROLLER", label: "Road Roller" },
    { value: "MOBIL_BEBAN", label: "Mobil Beban" },
    { value: "MOBIL_PENUMPANG", label: "Mobil Penumpang" },
    { value: "MPV", label: "MPV" },
    { value: "PICKUP_TRUCK", label: "Pickup Truck" },
];


export function ListKendaraanPage() {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedTab, setSelectedTab] = useState<string>("semua");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [openDialogEdit, setOpenDialogEdit] = useState<boolean>(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [openDialogModel, setOpenDialogModel] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<"daftar" | "model">("daftar");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const itemsPerPage = 10;

    // Get company data from location state
    const company = location.state?.company || {
        id: companyId,
        name: "PT Maximus Indo Asia",
        industryType: "Alat Berat",
    };

    // Fetch vehicles from API
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getDetailedListVehiclesByCompany(Number(companyId));
                setVehicles(data || []);
            } catch (err) {
                setError("Gagal memuat data kendaraan");
                console.error("Error fetching vehicles:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (companyId) {
            fetchVehicles();
        }
    }, [companyId]);

    // Add click outside listener for action button menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.dropdown-action-container')) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openMenuId]);

    // Get unique vehicle types and their counts from data
    const vehicleTypes = useMemo(() => {
        const types: Record<string, number> = { semua: vehicles.length };

        vehicles.forEach((vehicle) => {
            const vType = vehicle.vehicleType || "";
            if (vType) {
                types[vType] = (types[vType] || 0) + 1;
            }
        });

        return types;
    }, [vehicles]);

    // Get tabs dynamically based on available vehicle types
    const tabs = useMemo(() => {
        const tabList = [{ id: "semua", label: "Semua", type: "semua" }];

        // Add tabs for each vehicle type that exists in data
        filterOptions.forEach((option) => {
            if (vehicleTypes[option.value] && vehicleTypes[option.value] > 0) {
                tabList.push({
                    id: option.value,
                    label: option.label,
                    type: option.value,
                });
            }
        });

        return tabList;
    }, [vehicleTypes]);

    // Filter vehicles by search and tab
    const filtered = useMemo(() => {
        return vehicles.filter((vehicle) => {
            const matchSearch =
                vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());

            const matchTab = selectedTab === "semua" || vehicle.vehicleType === selectedTab;

            return matchSearch && matchTab;
        });
    }, [searchQuery, vehicles, selectedTab]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVehicles = filtered.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const fetchVehiclesList = async () => {
        try {
            const updatedVehicles = await getDetailedListVehiclesByCompany(Number(companyId));
            setVehicles(updatedVehicles || []);
        } catch (err) {
            console.error("Gagal refresh data:", err);
        }
    };

    const handleDeleteVehicle = async (vehicleId: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kendaraan ini?")) return;

        const toastId = toast.loading("Sedang menghapus kendaraan...");

        try {
            await deleteVehicleById(vehicleId);

            const updatedVehicles = await getDetailedListVehiclesByCompany(Number(companyId));
            setVehicles(updatedVehicles || []);
            setOpenMenuId(null);
            toast.success("Kendaraan berhasil dihapus", { id: toastId });

        } catch (error) {
            console.error("Gagal menghapus kendaraan:", error);
            toast.error("Gagal menghapus kendaraan. Silakan coba lagi.", { id: toastId });
        }
    }

    const handleAddModel = (data: ModelKendaraanFormData) => {
        try {
            // TODO: Call API to add model vehicle
            // For now just show success message
            console.log("Model kendaraan ditambahkan:", data);
            alert("Model kendaraan berhasil ditambahkan");
            setOpenDialogModel(false);
        } catch (err) {
            console.error("Error adding model:", err);
            alert("Gagal menambah model kendaraan. Silakan coba lagi.");
        }
    };

    const getTabs = () => {
        return tabs;
    };

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {company.name}
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate(`/list-odometer/${companyId}`, { state: { company } })}
                        className="px-3 py-1 text-black text-sm rounded-md border hover:bg-gray-300 transition-colors"
                    >
                        List Marking Number
                    </button>
                </div>
                <button
                    onClick={() => {
                        if (viewMode === "model") {
                            setOpenDialogModel(true);
                        } else {
                            setOpenDialog(true);
                        }
                    }}
                    className="bg-[#1E3A8A] hover:bg-[#162c6b] text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>{viewMode === "model" ? "Tambah Model" : "Tambah Kendaraan"}</span>
                </button>
            </div>

            {/* Button Switch View */}
            <div className="flex gap-2 mb-6 mt-4">
                <button
                    onClick={() => setViewMode("daftar")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "daftar"
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    Daftar Kendaraan
                </button>
                <button
                    onClick={() => setViewMode("model")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "model"
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    Model Kendaraan
                </button>
            </div>

            {/* Button */}

            {/* Daftar Kendaraan View */}
            {viewMode === "daftar" && (
                <>
                    {/* Search Bar */}
                    <div className="mb-6 mt-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari plat nomor"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                        {getTabs().map((tab) => {
                            const count = vehicleTypes[tab.type] || 0;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setSelectedTab(tab.type);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedTab === tab.type
                                        ? "bg-[#1E3A8A] text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {tab.label}{" "}
                                    <span className="ml-1 text-xs opacity-75">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-sm">Memuat data kendaraan...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="text-center py-12">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Table */}
                    {!isLoading && !error && (
                        <>
                            <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-[#E2E8F0]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                                No Data
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                                Plat No/ID Kendaraan
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                                Jenis Kendaraan
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                                No Rangka
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                                No Mesin
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                                Kapasitas Tangki
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                                Merk
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                                Tipe
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                                Marking Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedVehicles.map((vehicle, index) => (
                                            <tr
                                                key={vehicle.id}
                                                className={`border-b border-[#E2E8F0] hover:bg-gray-50 ${index % 2 === 0 ? "" : ""
                                                    }`}
                                            >
                                                <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                                                    {startIndex + index + 1}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                                                    {vehicle.licensePlate}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">
                                                    {vehicle.vehicleType || "-"}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">
                                                    {vehicle.frameNumber || "-"}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">
                                                    {vehicle.engineNumber || "-"}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">
                                                    {vehicle.fuelTank || "-"} L
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">
                                                    {vehicle.brand || "-"}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">
                                                    {vehicle.model || "-"}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">
                                                    {vehicle.markingNumber || "-"}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">
                                                    <div className="relative dropdown-action-container">
                                                        <button
                                                            onClick={() => setOpenMenuId(openMenuId === vehicle.id ? null : vehicle.id)}
                                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                        >
                                                            <Ellipsis size={18} className="text-gray-600" />
                                                        </button>
                                                        {openMenuId === vehicle.id && (
                                                            <div className={`absolute right-0 mt-1 w-32 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-10
                                                                ${index >= paginatedVehicles.length - 2
                                                                    ? "bottom-full"
                                                                    : "top-full"
                                                                }
                                                            `}>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedVehicle(vehicle);
                                                                        setOpenDialogEdit(true);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                                                                >
                                                                    <SquarePen size={16} />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                                                                >
                                                                    <Trash2 size={16} />
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty State */}
                            {paginatedVehicles.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-sm">
                                        Tidak ada kendaraan yang ditemukan
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-xs text-gray-600">
                                        Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} dari{" "}
                                        {filtered.length} kendaraan
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                handlePageChange(Math.max(1, currentPage - 1))
                                            }
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm border border-[#E2E8F0] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                            (page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-3 py-1 text-sm rounded ${currentPage === page
                                                        ? "bg-[#1E3A8A] text-white"
                                                        : "border border-[#E2E8F0] hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        )}
                                        <button
                                            onClick={() =>
                                                handlePageChange(Math.min(totalPages, currentPage + 1))
                                            }
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-sm border border-[#E2E8F0] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Model Kendaraan View */}
            {viewMode === "model" && (
                <ListModelKendaraan companyId={companyId} />
            )}

            {/* Dialog untuk tambah kendaraan */}
            <DialogKendaraanTambah
                open={openDialog}
                onOpenChange={setOpenDialog}
                companyId={Number(companyId)}
                onSuccess={fetchVehiclesList}
            />

            {/* Dialog untuk edit kendaraan */}
            <DialogKendaraanEdit
                open={openDialogEdit}
                onOpenChange={(isOpen) => {
                    setOpenDialogEdit(isOpen);
                    if (!isOpen) setSelectedVehicle(null);
                }}
                vehicle={selectedVehicle}
                companyId={Number(companyId)}
                onSuccess={fetchVehiclesList}
            />

            {/* Dialog untuk tambah model kendaraan */}
            <DialogModelKendaraanTambah
                open={openDialogModel}
                onOpenChange={setOpenDialogModel}
                onSubmit={handleAddModel}
            />
        </div>
    );
}