import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { format, parseISO, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { useVehicleStore } from "@/store/useVehicleStore";
import { getRouteVehicle } from "@/api/vehicle";
import { DateRange } from "react-day-picker";

interface Props {
  vehicleId: number | null;
}

type StatusType = "OPERATING" | "IDLE" | "STOPPED" | "UNKNOWN";

interface StatusEntry {
  timestamp: string;
  status: StatusType;
}

const statusColorMap: Record<StatusType, string> = {
  OPERATING: "bg-green-500",
  IDLE: "bg-yellow-400",
  STOPPED: "bg-red-500",
  UNKNOWN: "bg-gray-300",
};

export const VehicleActivitySection = ({ vehicleId }: Props) => {
  const [statusData, setStatusData] = useState<StatusEntry[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [appliedDateRange, setAppliedDateRange] = useState<{ from: Date; to?: Date }>({ 
    from: new Date(), 
    to: new Date() 
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [dateError, setDateError] = useState<string>("");

  // Route store actions dari vehicle store
  const { 
    selectedDate, 
    setSelectedDate, 
    setRouteData, 
    setIsShowingRoute, 
    setIsLoadingRoute,
    clearRoute,
    isLoadingRoute
  } = useVehicleStore();

  

  // Auto load data untuk hari ini saat pertama kali mount
  useEffect(() => {
    if (!vehicleId) return;

    const fetchData = async () => {
      try {
        const startDate = format(appliedDateRange.from, "yyyy-MM-dd");
        const endDate = format(appliedDateRange.to || appliedDateRange.from, "yyyy-MM-dd");
        
        const res = await axios.get(`/vehicles/${vehicleId}/status/date-range?startDate=${startDate}&endDate=${endDate}`);
        setStatusData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch vehicle status:", error);
      }
    };

    fetchData();
  }, [vehicleId, appliedDateRange]);

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setDateRange(undefined);
      setDateError("");
      return;
    }

    // Jika hanya from yang dipilih
    if (range.from && !range.to) {
      setDateRange({ from: range.from });
      setDateError("");
      return;
    }

    // Jika from dan to dipilih, cek apakah lebih dari 7 hari
    if (range.from && range.to) {
      const daysDifference = differenceInDays(range.to, range.from);
      
      if (daysDifference > 6) {
        setDateError("Periode maksimal hanya 7 hari");
        // Set dateRange dengan error state
        setDateRange({ from: range.from, to: range.to });
        return;
      }

      setDateRange({ from: range.from, to: range.to });
      setDateError("");
    }
  };

  const handleApply = () => {
    if (dateRange?.from && !dateError) {
      // Jika hanya pilih satu tanggal (from saja), set to = from
      const finalRange = {
        from: dateRange.from,
        to: dateRange.to || dateRange.from
      };
      
      setAppliedDateRange(finalRange);
      setIsPopoverOpen(false);
    }
  };

  const isApplyDisabled = () => {
    if (dateError) return true;
    if (!dateRange?.from) return true;
    return false;
  };

  // Handler untuk click pada tanggal timeline
  const handleDateClick = async (dateString: string) => {
    if (!vehicleId) return;

    // Jika sudah menampilkan route untuk tanggal yang sama, kembali ke live view
    if (selectedDate === dateString) {
      clearRoute();
      return;
    }

    try {
      setIsLoadingRoute(true);
      
      // Format tanggal untuk API (YYYY-MM-DD)
      const formattedDate = dateString;
      
      // Fetch route data
      const routeData = await getRouteVehicle(vehicleId, formattedDate);
      
      // Update store
      setSelectedDate(formattedDate);
      setRouteData(routeData);
      setIsShowingRoute(true);
      
      console.log(`Route data for ${formattedDate}:`, routeData);
      
    } catch (error) {
      console.error("Error fetching route data:", error);
      // Reset state on error
      clearRoute();
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Ambil N perwakilan yang merata dari awal–akhir dengan downsampling
  const downsampleEvenly = (arr: StatusEntry[], target = 24): StatusEntry[] => {
    const n = arr.length;
    if (n === 0) return [];
    if (n <= target) return arr;

    const out: StatusEntry[] = [];
    for (let i = 0; i < target; i++) {
      // Sebar merata di rentang indeks [0, n-1]
      const idx = Math.round((i * (n - 1)) / (target - 1));
      out.push(arr[idx]);
    }
    return out;
  };

  // Format waktu dengan zona Asia/Jakarta
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });

  // Group data berdasarkan tanggal
  const groupDataByDate = (): Record<string, StatusEntry[]> => {
    const grouped: Record<string, StatusEntry[]> = {};
    
    statusData.forEach((item) => {
      const date = format(parseISO(item.timestamp), "yyyy-MM-dd");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });

    // Sort each day's data by timestamp
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    return grouped;
  };

  const groupedStatus = groupDataByDate();

  const getDisplayRange = () => {
    // Gunakan appliedDateRange untuk display di button
    if (!appliedDateRange.from) return "Pilih Tanggal";
    if (appliedDateRange.from && appliedDateRange.to && 
        format(appliedDateRange.from, "yyyy-MM-dd") === format(appliedDateRange.to, "yyyy-MM-dd")) {
      return format(appliedDateRange.from, "dd/MM/yyyy");
    }
    return `${format(appliedDateRange.from, "dd/MM/yyyy")} - ${format(appliedDateRange.to!, "dd/MM/yyyy")}`;
  };

  return (
    <div className='space-y-4'>
      <div className="flex items-center justify-between">
        <label className='block text-sm font-medium text-gray-700'>Periode</label>
      </div>

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant='outline' 
            className={`w-full justify-between bg-white font-normal ${dateError ? 'border-red-500' : ''}`}
            onClick={() => {
              // Jika sedang menampilkan route, clear dulu sebelum buka calendar
              if (selectedDate) {
                clearRoute();
              }
              // Reset dateRange saat buka popover supaya bisa pilih dari awal
              setDateRange(undefined);
              setDateError("");
            }}
          >
            {getDisplayRange()}
            <CalendarIcon className='ml-2 h-4 w-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-fit p-1 ' align='center' side='bottom' sideOffset={1}>
          <div className='p-3'>
            <Calendar
              mode='range'
              selected={dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={1}
              className='rounded-md'
              required={false}
            />
          </div>
          
          {/* Error message */}
          {dateError && (
            <div className='px-4 py-3 border-t bg-red-50'>
              <p className='text-sm text-red-600 flex items-center gap-2'>
                <span className='text-red-500'>⚠️</span>
                {dateError}
              </p>
            </div>
          )}
          
          {/* Info message - hanya tampil jika tidak ada error */}
          {!dateError && (
            <div className='px-4 py-3 border-t bg-blue-50'>
              <p className='text-xs text-blue-600 flex items-center gap-2'>
                <span>💡</span>
                {!dateRange?.from 
                  ? "Klik tanggal untuk mulai memilih periode"
                  : dateRange.from && !dateRange.to
                  ? "Klik tanggal lain untuk membuat rentang (opsional)"
                  : "Rentang tanggal siap diterapkan"
                }
              </p>
            </div>
          )}

          <div className='p-3 border-t bg-white'>
            <Button
              onClick={handleApply}
              disabled={isApplyDisabled()}
              className='w-full'
              size='sm'
            >
              Terapkan
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Error display outside popover */}
      {dateError && (
        <div className='text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200'>
          ⚠️ {dateError}
        </div>
      )}

      {/* Loading indicator */}
      {isLoadingRoute && (
        <div className="text-center py-4 text-blue-600">
          <span className="text-sm">Memuat rute...</span>
        </div>
      )}

      {/* Route control buttons */}
      {selectedDate && (
        <div className="flex flex-col gap-2 justify-between items-center  rounded">
          <Button
            size="sm"
            variant="outline"
            onClick={clearRoute}
            className="text-xs text-white bg-[#253A8B] hover:bg-[#4464DF] hover:text-white w-full"
          >
            Kembali ke Live/last Log View
          </Button>
        </div>
      )}

      {/* Timeline per hari dengan downsampling */}
      <div className='space-y-4'>
        {Object.entries(groupedStatus).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Tidak ada data aktivitas untuk periode ini</p>
          </div>
        ) : (
          Object.entries(groupedStatus)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayStatuses]) => {
              const sampledData = downsampleEvenly(dayStatuses, 24);
              
              return (
                <div key={date} className="space-y-2">
                  <button
                    onClick={() => handleDateClick(date)}
                    className={`w-full text-left p-2 rounded hover:bg-gray-50 transition-colors ${
                      selectedDate === date ? 'bg-blue-50 border border-blue-200' : ''
                    } ${isLoadingRoute ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!vehicleId || isLoadingRoute}
                  >
                    <div className='text-sm font-medium text-gray-700'>
                      {format(new Date(date), "EEEE, dd/MM/yyyy", { locale: id })}
                    </div>
                    
                    {/* Timeline bar */}
                    <div className='flex items-center overflow-hidden border border-gray-300 bg-gray-100 rounded-full mt-2'>
                      {sampledData.map((item, i) => (
                        <div
                          key={`${item.timestamp}-${i}`}
                          className={`${statusColorMap[item.status]} h-1.5 flex-1 ${
                            i === 0 
                              ? "rounded-l-full" 
                              : i === sampledData.length - 1 
                              ? "rounded-r-full" 
                              : ""
                          }`}
                          title={`${formatTime(item.timestamp)} - ${item.status}`}
                        />
                      ))}
                    </div>
                  </button>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};