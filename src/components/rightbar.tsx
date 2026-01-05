import { Search, SlidersHorizontal } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { useRightbarStore } from "@/store/useRightStore";
import { useVehicleStore } from "@/store/useVehicleStore";
import { VehicleDetail } from "@/components/vehicle-detail";
import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";

// Optional: formatting untuk tampilan nomor polisi
function formatLicensePlate(plate: string): string {
  if (plate.length > 8) {
    return plate.slice(0, 2) + " - " + plate.slice(-7);
  }
  return plate;
}

// Untuk normalisasi string pencarian (hilangkan spasi, strip, lowercase)
function normalizeText(str: string) {
  return str.replace(/\s|[-]/g, "").toLowerCase();
}

// Helper to format vehicle type for display
// Helper to format vehicle type for display
function formatVehicleType(type: string | undefined) {
  if (!type || type === "") return "";
  // Preserve short acronyms (e.g., MPV) while title-casing normal words
  return type
    .split("_")
    .map((word) => {
      // If word is all uppercase and short, treat as acronym and keep as-is
      if (word.toUpperCase() === word && word.length <= 3) return word;
      // Otherwise title-case the word
      return word.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
    })
    .join(" ");
}

export function SidebarRight(props: React.ComponentProps<typeof Sidebar>) {
  const { search, vehicles, setSearch, selectedTypes, setSelectedTypes } = useRightbarStore();
  const { selectedVehicle, setSelectedVehicle } = useVehicleStore();
  const { setShowTopbar } = useUIStore();

  // State untuk dropdown
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  // Toggle individual checkbox
  const handleToggleType = (value: string) => {
    const newTypes = selectedTypes.includes(value)
      ? selectedTypes.filter((v) => v !== value)
      : [...selectedTypes, value];
    setSelectedTypes(newTypes);
  };

  // Toggle "Semua" checkbox
  const handleToggleSemua = () => {
    if (selectedTypes.length === 0) {
      // Jika semua sudah tidak tercentang, tidak perlu lakukan apa-apa
      return;
    }
    // Clear semua filter
    setSelectedTypes([]);
  };

  // Check if "Semua" should be checked (ketika tidak ada filter aktif)
  const isSeemuaChecked = selectedTypes.length === 0;

  // Deduplikasi vehicles dulu sebelum digunakan untuk filtering dan counting
  const uniqueVehicles = vehicles.filter((v, index, self) =>
    index === self.findIndex((vehicle) => vehicle.id === v.id)
  );

  // Filter dengan cara normalize + filter berdasarkan vehicle_type
  const filteredData = uniqueVehicles.filter((kendaraan) => {
    // Filter berdasarkan license plate
    const matchesSearch = normalizeText(kendaraan.license_plate).includes(normalizeText(search));

    // Filter berdasarkan vehicle type - gunakan langsung dari database
    const vehicleType = kendaraan.vehicle_type || "";

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(vehicleType);

    return matchesSearch && matchesType;
  });

  // Reset saat tekan ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedVehicle(null);
        setIsFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setSelectedVehicle]);

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".filter-dropdown")) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  // Jika sudah pilih kendaraan, tampilkan detail
  if (selectedVehicle) {
    return (
      <Sidebar side='right' collapsible='icon' {...props} className='py-4 pr-6 rounded-sm'>
        <SidebarContent className='pr-2 w-[300px]'>
          <VehicleDetail />
        </SidebarContent>
      </Sidebar>
    );
  }

  // Jika belum, tampilkan daftar kendaraan
  return (
    <Sidebar side='right' collapsible='icon' {...props} className='py-4 pr-4 rounded-sm '>
      <SidebarHeader className='items-center p-2 lg:p-4 rounded-sm'>
        <form className='w-full max-w-[230px] lg:max-w-[270px]'>
          <div className='relative flex gap-2'>
            {/* Search Input */}
            <div className='relative flex-1'>
              <div className='absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none'>
                <Search size={16} color='#020617' />
              </div>
              <input
                type='search'
                className='block w-full p-2 ps-8 text-xs lg:text-sm text-gray-900 border border-[#E2E8F0] rounded bg-gray-50'
                placeholder='cari kendaraan'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Button with Dropdown */}
            <div className='relative filter-dropdown'>
              <button
                type='button'
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center justify-center p-2 border border-[#E2E8F0] rounded bg-gray-50 hover:bg-gray-100 transition-colors relative ${selectedTypes.length > 0 ? "bg-blue-50 border-blue-300" : ""
                  }`}
              >
                <SlidersHorizontal size={16} color='#020617' />
                {/* Red dot indicator - tampil jika ada filter aktif */}
                {selectedTypes.length > 0 && (
                  <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white'></span>
                )}
              </button>

              {/* Dropdown Menu with Checkboxes */}
              {isFilterOpen && (
                <div className='absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50'>
                  {/* Header */}
                  <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200'>
                    <div className='flex items-center gap-2'>
                      <SlidersHorizontal size={16} color='#020617' />
                      <span className='font-semibold text-sm text-gray-900'>Kendaraan</span>
                    </div>
                  </div>

                  {/* Semua option */}
                  <div className='px-4 py-2 border-b border-gray-200'>
                    <label className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded transition-colors'>
                      <input
                        type='checkbox'
                        checked={isSeemuaChecked}
                        onChange={handleToggleSemua}
                        className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                      />
                      <span className='text-sm text-gray-900'>Semua</span>
                    </label>
                  </div>

                  {/* Filter Options with Checkboxes */}
                  <div className='max-h-64 overflow-y-auto py-2'>
                    {filterOptions.map((option) => (
                      <label
                        key={option.value}
                        className='flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors'
                      >
                        <input
                          type='checkbox'
                          checked={selectedTypes.includes(option.value)}
                          onChange={() => handleToggleType(option.value)}
                          className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                        />
                        <span className='text-sm text-gray-900'>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Filter Chips with Vehicle Count */}
        <div className='mt-3 w-full max-w-[230px] lg:max-w-[270px]'>
          <div className='relative overflow-hidden'>
            <div className='overflow-x-auto scrollbar-thin pb-2' style={{ scrollbarGutter: 'stable' }}>
              <div className='flex gap-2 w-max'>
                {/* Chip Semua */}
                <button
                  onClick={handleToggleSemua}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap ${selectedTypes.length === 0
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                >
                  <span>Semua</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${selectedTypes.length === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                    {uniqueVehicles.length}
                  </span>
                </button>

                {/* Chips untuk setiap tipe kendaraan */}
                {filterOptions.map((option) => {
                  const count = uniqueVehicles.filter((v) => {
                    const vehicleType = v.vehicle_type || "";
                    return vehicleType === option.value;
                  }).length;

                  // Jika kendaraan dengan tipe ini tidak ada, jangan tampilkan chip
                  if (count === 0) return null;

                  const isSelected = selectedTypes.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleToggleType(option.value)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap ${isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                    >
                      <span>{option.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className=' pr-1 lg:pl-2 rounded-sm'>
        <ul className='border-t border-gray-300 py-2'>
          {filteredData.length === 0 ? (
            <li className='text-center text-gray-500 text-sm py-8'>Tidak ada kendaraan ditemukan</li>
          ) : (
            filteredData.map((kendaraan, index) => {
              const displayType = kendaraan.vehicle_type;

              return (
                <li
                  key={`${kendaraan.id}-${kendaraan.license_plate}-${index}`}
                  onClick={() => {
                    setSelectedVehicle(kendaraan);
                    setShowTopbar(false);
                  }}
                  className='pl-3 py-3 flex justify-between items-center min-h-[100px] lg:min-h-[100px] cursor-pointer hover:bg-sidebar-accent rounded-sm border-b border-gray-200'
                >
                  {/* Left side: Vehicle icon + info */}
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <img
                      src={getVehicleIcon(displayType, kendaraan.status)}
                      alt={displayType || "vehicle"}
                      className='w-10 h-10 rounded-md object-cover flex-shrink-0'
                    />

                    <div className='flex flex-col gap-1 flex-1 min-w-0'>
                      <h4 className='font-semibold text-black text-sm truncate'>{formatLicensePlate(kendaraan.license_plate)}</h4>

                      {kendaraan.brand && kendaraan.model && (
                        <p className='text-xs text-gray-600 truncate'>
                          {kendaraan.brand} {kendaraan.model}
                        </p>
                      )}
                      {kendaraan.company_name && <p className='text-xs text-gray-500 truncate'>{kendaraan.company_name}</p>}

                      {/* Vehicle Type */}
                      {displayType && (
                        <p className='text-xs text-blue-600 font-medium truncate'>
                          {formatVehicleType(displayType)}
                        </p>
                      )}

                      {displayType === "EXCAVATOR" || displayType === "BULLDOZER" || displayType === "WHEEL_LOADER" || displayType === "GRADER" ? (
                        <p className='text-xs text-gray-600'>{kendaraan.hourmeter || "0"} Jam</p>
                      ) : (
                        <p className='text-xs text-gray-600'> {kendaraan.odometer || "-"} Km</p>
                      )}
                    </div>
                  </div>

                  {/* Right side: Status badge */}
                  <div
                    className={`text-xs font-medium py-1 px-2 rounded-full text-center whitespace-nowrap ml-2 min-w-[85px] ${kendaraan.status === "active"
                      ? "bg-green-600 text-white"
                      : kendaraan.status === "inactive"
                        ? "bg-red-600 text-white"
                        : "bg-yellow-500 text-white"
                      }`}
                  >
                    {kendaraan.status === "active" ? "Beroperasi" : kendaraan.status === "inactive" ? "Mati" : "Idle"}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </SidebarContent>
    </Sidebar>
  );
}

// Return icon path for a given vehicle type and status
function getVehicleIcon(type: string | undefined, status?: string) {
  if (!type) return "/assets/icons/icon_car_default.webp";

  const map: Record<string, string> = {
    EXCAVATOR: "exca",
    DUMP_TRUCK: "truck",
    BULLDOZER: "bulldozer",
    WHEEL_LOADER: "wheel-loader",
    GRADER: "grader",
    ROAD_ROLLER: "road-roller",
    MOBIL_BEBAN: "car",
    MOBIL_PENUMPANG: "car",
    MPV: "car",
    PICKUP_TRUCK: "truck",
  };

  const key = map[type] || "car";
  const state = status === "active" ? "on" : status === "inactive" ? "off" : "idle";
  return `/assets/icons/icon_${key}_${state}.webp`;
}