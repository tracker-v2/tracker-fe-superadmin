import { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";

// Interface untuk Odometer
interface OdometerData {
    id: string;
    idKendaraan: string;
    tanggal: string;
    odometer: number;
    latitude: number;
    longitude: number;
}

// Data dummy odometer
const DUMMY_ODOMETER: OdometerData[] = [
    {
        id: "ODO001",
        idKendaraan: "B 0160 SBX",
        tanggal: "2026-01-08",
        odometer: 125450,
        latitude: -6.2088,
        longitude: 106.8456,
    },
    {
        id: "ODO002",
        idKendaraan: "B 0160 SBX",
        tanggal: "2026-01-07",
        odometer: 125320,
        latitude: -6.2100,
        longitude: 106.8500,
    },
    {
        id: "ODO003",
        idKendaraan: "LSW225D3JG005668",
        tanggal: "2026-01-08",
        odometer: 85640,
        latitude: -6.2150,
        longitude: 106.8300,
    },
    {
        id: "ODO004",
        idKendaraan: "LSW225D3JG005668",
        tanggal: "2026-01-07",
        odometer: 85500,
        latitude: -6.2080,
        longitude: 106.8400,
    },
    {
        id: "ODO005",
        idKendaraan: "LSW225D3JG005669",
        tanggal: "2026-01-08",
        odometer: 76230,
        latitude: -6.2200,
        longitude: 106.8250,
    },
    {
        id: "ODO006",
        idKendaraan: "LSW225D3JG005669",
        tanggal: "2026-01-07",
        odometer: 76100,
        latitude: -6.2120,
        longitude: 106.8350,
    },
    {
        id: "ODO007",
        idKendaraan: "LSW225D3JG005670",
        tanggal: "2026-01-08",
        odometer: 95400,
        latitude: -6.1950,
        longitude: 106.8550,
    },
    {
        id: "ODO008",
        idKendaraan: "LSW225D3JG005670",
        tanggal: "2026-01-07",
        odometer: 95280,
        latitude: -6.2050,
        longitude: 106.8600,
    },
    {
        id: "ODO009",
        idKendaraan: "LSW225D3JG005671",
        tanggal: "2026-01-08",
        odometer: 88900,
        latitude: -6.2300,
        longitude: 106.8100,
    },
    {
        id: "ODO010",
        idKendaraan: "LSW225D3JG005671",
        tanggal: "2026-01-07",
        odometer: 88750,
        latitude: -6.2250,
        longitude: 106.8150,
    },
    {
        id: "ODO011",
        idKendaraan: "LSW225D3JG005672",
        tanggal: "2026-01-08",
        odometer: 72300,
        latitude: -6.1850,
        longitude: 106.8700,
    },
    {
        id: "ODO012",
        idKendaraan: "LSW225D3JG005672",
        tanggal: "2026-01-07",
        odometer: 72150,
        latitude: -6.1900,
        longitude: 106.8750,
    },
];

export function ListOdometerPage() {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Get company data from location state
    const company = location.state?.company || {
        id: companyId,
        name: "PT Maximus Indo Asia",
        industryType: "Alat Berat",
    };

    // Filter odometer by search
    const filtered = useMemo(() => {
        return DUMMY_ODOMETER.filter((odometer) => {
            return (
                odometer.idKendaraan
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                odometer.tanggal
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
        });
    }, [searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOdometer = filtered.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
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
                        <p className="text-sm text-gray-600">List Odometer</p>
                    </div>
                </div>

            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari ID kendaraan atau tanggal"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-[#E2E8F0]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                                ID Odometer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                                ID Kendaraan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                                Tanggal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                                Odometer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                                Latitude
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                                Longitude
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOdometer.map((odometer, index) => (
                            <tr
                                key={odometer.id}
                                className={`border-b border-[#E2E8F0] hover:bg-gray-50 ${index % 2 === 0 ? "" : ""
                                    }`}
                            >
                                <td className="px-6 py-3 text-sm text-gray-900">
                                    {odometer.id}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-900">
                                    {odometer.idKendaraan}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-600">
                                    {odometer.tanggal}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-600">
                                    {odometer.odometer.toLocaleString("id-ID")}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-600">
                                    {odometer.latitude.toFixed(4)}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-600">
                                    {odometer.longitude.toFixed(4)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {paginatedOdometer.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">
                        Tidak ada data odometer yang ditemukan
                    </p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-xs text-gray-600">
                        Menampilkan 1-{Math.min(itemsPerPage, filtered.length)} dari{" "}
                        {filtered.length} data odometer
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