import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { getDetailedListVehiclesByCompany } from "@/api/vehicle";
import { useParams } from "react-router-dom";

// Interface untuk Vehicle dari API
interface Vehicle {
    id: number;
    companyId: number;
    licensePlate: string;
    description: string | null;
    image: string;
    vehicleType: string;
    fuelTank: number;
    frameNumber: string;
    engineNumber: string;
    color: string;
    year: number;
    brand: string;
    model: string;
    lastOdometer: number;
    markingNumber: string;
    enginePower?: number;
    tireCount?: number;
    torque?: number;
}

interface ListModelKendaraanProps {
    companyId?: string;
}

export function ListModelKendaraan({ companyId: propCompanyId }: ListModelKendaraanProps) {
    const { companyId: paramCompanyId } = useParams();
    const companyId = propCompanyId || paramCompanyId;
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const itemsPerPage = 10;

    // Fetch vehicles from API
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getDetailedListVehiclesByCompany(Number(companyId));
                setVehicles(data || []);
            } catch (err) {
                setError("Gagal memuat data model kendaraan");
                console.error("Error fetching vehicles:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (companyId) {
            fetchVehicles();
        }
    }, [companyId]);

    // Filter vehicles berdasarkan search query
    const filtered = useMemo(() => {
        return vehicles.filter((vehicle) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                vehicle.brand.toLowerCase().includes(searchLower) ||
                vehicle.model.toLowerCase().includes(searchLower) ||
                vehicle.vehicleType.toLowerCase().includes(searchLower)
            );
        });
    }, [searchQuery, vehicles]);

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

    return (
        <div>
            {/* Search Bar */}
            <div className="mb-6 mt-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari merk atau model"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">Memuat data model kendaraan...</p>
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
                <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-[#E2E8F0]">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                    No Data
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                    Tipe Kendaraan
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                    Merk
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                    Model
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                    Kapasitas Tangki (L)
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                    Power Mesin (kW)
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                    Jumlah Roda
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                    Torsi (N.m)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedVehicles.map((vehicle, index) => (
                                <tr
                                    key={vehicle.id}
                                    className="border-b border-[#E2E8F0] hover:bg-gray-50"
                                >
                                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">
                                        {vehicle.vehicleType || "-"}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                                        {vehicle.brand || "-"}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">
                                        {vehicle.model || "-"}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">
                                        {vehicle.fuelTank || "-"}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">
                                        {vehicle.enginePower || "-"}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">
                                        {vehicle.tireCount || "-"}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">
                                        {vehicle.torque || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && paginatedVehicles.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">
                        Tidak ada model kendaraan yang ditemukan
                    </p>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-xs text-gray-600">
                        Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} dari{" "}
                        {filtered.length} model
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
        </div>
    );
}
