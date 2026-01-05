import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, AlertCircle, Loader2 } from "lucide-react";
import { reverseGeocode } from "@/hooks/useReverseGeocode";

// API Response Interfaces
interface LogItem {
  timestamp: string;
  status: "OPERATING" | "IDLE" | "STOPPED";
  latitude: string;
  longitude: string;
  odometer: number;
}

interface TripData {
  id: number;
  vehicle_id: number;
  origin_timestamp: string;
  origin_latitude: string;
  origin_longitude: string;
  destination_timestamp: string;
  destination_latitude: string;
  destination_longitude: string;
  trip_distance: number;
  idle_time: number;
  stopped_time: number;
  operating_time: number;
  logs: LogItem[];
}

interface RiwayatItem {
  id: string;
  waktu: string;
  status: "TIDAK BERGERAK" | "MENGEMUDI" | "IDLE" | "STARTER MENYALA" | "STARTER MATI";
  aktivitas: string;
  kecepatan: string;
  lokasi: string;
  odometer: string;
  lintang: string;
  bujur: string;
}

interface LaporanItem {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  distance: string;
  duration: string;
  startLocation: string;
  endLocation: string;
  riwayat: RiwayatItem[];
  idleTime: string;
  operatingTime: string;
  stoppedTime: string;
  destinationLat: string;
  destinationLng: string;
}

interface UpdatedLaporanModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number | null;
  selectedDate: string | null;
  fetchReportActivitySection: (vehicleId: number, date: string) => Promise<TripData[]>;
}

// Cache untuk menyimpan hasil geocoding
const geocodeCache = new Map<string, string>();

const UpdatedLaporanModal: React.FC<UpdatedLaporanModalProps> = ({ 
  isOpen, 
  onClose, 
  vehicleId, 
  selectedDate, 
  fetchReportActivitySection 
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [laporanData, setLaporanData] = useState<LaporanItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressCache, setAddressCache] = useState<Map<string, string>>(new Map());

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return { dateStr, timeStr };
  };

  const mapApiStatus = (apiStatus: string): "TIDAK BERGERAK" | "MENGEMUDI" | "IDLE" | "STARTER MENYALA" | "STARTER MATI" => {
    switch (apiStatus) {
      case "OPERATING":
        return "MENGEMUDI";
      case "IDLE":
        return "IDLE";
      case "STOPPED":
        return "TIDAK BERGERAK";
      default:
        return "TIDAK BERGERAK";
    }
  };

  const calculateSpeed = (prevLog: LogItem | null, currentLog: LogItem): string => {
    if (!prevLog) return "0 km/jam";

    const timeDiff = (new Date(currentLog.timestamp).getTime() - new Date(prevLog.timestamp).getTime()) / 1000;
    const distanceDiff = Math.abs(currentLog.odometer - prevLog.odometer);

    if (timeDiff === 0) return "0 km/jam";

    const speedKmh = (distanceDiff / timeDiff) * 3600;
    return `${Math.round(speedKmh)} km/jam`;
  };

  // Fungsi untuk mendapatkan alamat dengan cache
  const getCachedAddress = async (lat: string, lng: string): Promise<string> => {
    const key = `${lat},${lng}`;
    
    // Cek cache global
    if (geocodeCache.has(key)) {
      return geocodeCache.get(key)!;
    }
    
    // Cek state cache
    if (addressCache.has(key)) {
      return addressCache.get(key)!;
    }
    
    // Fetch dengan delay untuk menghormati rate limit
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const address = await reverseGeocode(lat, lng);
      geocodeCache.set(key, address);
      setAddressCache(prev => new Map(prev).set(key, address));
      return address;
    } catch (error) {
      const fallback = `Koordinat: ${lat}, ${lng}`;
      geocodeCache.set(key, fallback);
      return fallback;
    }
  };

  // Convert API data tanpa geocoding dulu
  const convertApiDataToLaporanData = (apiData: TripData[]): LaporanItem[] => {
    if (!apiData || !Array.isArray(apiData)) {
      return [];
    }

    return apiData.map((trip: TripData) => {
      const startDateTime = formatDateTime(trip.origin_timestamp);
      const endDateTime = formatDateTime(trip.destination_timestamp);

      const operatingTimeFormatted = formatTime(trip.operating_time);
      const idleTimeFormatted = formatTime(trip.idle_time);
      const stoppedTimeFormatted = formatTime(trip.stopped_time);

      // Convert logs to riwayat dengan koordinat dulu
      const riwayat: RiwayatItem[] = trip.logs.map((log, index) => {
        const logDateTime = formatDateTime(log.timestamp);
        const prevLog = index > 0 ? trip.logs[index - 1] : null;

        return {
          id: `${trip.id}-${index}`,
          waktu: logDateTime.timeStr,
          status: mapApiStatus(log.status),
          aktivitas: log.status === "OPERATING" ? "STARTER MENYALA" : log.status === "STOPPED" ? "STARTER MATI" : "",
          kecepatan: calculateSpeed(prevLog, log),
          lokasi: `Koordinat: ${log.latitude}, ${log.longitude}`,
          odometer: `${log.odometer}.000 km`,
          lintang: log.latitude,
          bujur: log.longitude,
        };
      });

      const tripTitle =
        trip.stopped_time > 0 
          ? `Berhenti selama ${stoppedTimeFormatted}` 
          : `Perjalanan ${trip.trip_distance} km - ${operatingTimeFormatted}`;

      return {
        id: trip.id.toString(),
        title: tripTitle,
        date: startDateTime.dateStr,
        startTime: startDateTime.timeStr,
        endTime: endDateTime.timeStr,
        distance: trip.trip_distance.toFixed(2),
        duration: operatingTimeFormatted,
        startLocation: `Koordinat: ${trip.origin_latitude}, ${trip.origin_longitude}`,
        endLocation: `Koordinat: ${trip.destination_latitude}, ${trip.destination_longitude}`,
        riwayat,
        idleTime: idleTimeFormatted,
        operatingTime: operatingTimeFormatted,
        stoppedTime: stoppedTimeFormatted,
        destinationLat: trip.destination_latitude,
        destinationLng: trip.destination_longitude,
      };
    });
  };

  // Geocode addresses secara parallel setelah data ditampilkan
  const geocodeAddresses = async (items: LaporanItem[]) => {
    // Kumpulkan semua koordinat yang unik
    const coordsToGeocode = new Set<string>();
    
    items.forEach(item => {
      // Tambahkan start dan end locations
      const startKey = item.startLocation.replace("Koordinat: ", "");
      const endKey = item.endLocation.replace("Koordinat: ", "");
      coordsToGeocode.add(startKey);
      coordsToGeocode.add(endKey);
      
      // Tambahkan koordinat dari title (destination)
      coordsToGeocode.add(`${item.destinationLat},${item.destinationLng}`);
      
      // Tambahkan semua koordinat dari riwayat
      item.riwayat.forEach(r => {
        coordsToGeocode.add(`${r.lintang},${r.bujur}`);
      });
    });

    // Geocode semua koordinat secara parallel dengan batching
    const coordsArray = Array.from(coordsToGeocode);
    const batchSize = 5;
    
    for (let i = 0; i < coordsArray.length; i += batchSize) {
      const batch = coordsArray.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (coords) => {
          const [lat, lng] = coords.split(",").map(s => s.trim());
          if (lat && lng) {
            await getCachedAddress(lat, lng);
          }
        })
      );
      
      // Update UI setelah setiap batch
      setLaporanData(currentData => 
        currentData.map(item => ({
          ...item,
          startLocation: getDisplayAddress(item.startLocation),
          endLocation: getDisplayAddress(item.endLocation),
          title: item.title.includes("Berhenti") 
            ? `Berhenti selama ${item.stoppedTime} di ${getAddressFromCoords(item.destinationLat, item.destinationLng)}`
            : item.title,
          riwayat: item.riwayat.map(r => ({
            ...r,
            lokasi: getAddressFromCoords(r.lintang, r.bujur)
          }))
        }))
      );
    }
  };

  // Helper untuk mendapatkan alamat dari cache
  const getAddressFromCoords = (lat: string, lng: string): string => {
    const key = `${lat},${lng}`;
    return addressCache.get(key) || geocodeCache.get(key) || `Koordinat: ${lat}, ${lng}`;
  };

  // Helper untuk convert display address
  const getDisplayAddress = (location: string): string => {
    if (!location.startsWith("Koordinat:")) return location;
    
    const coords = location.replace("Koordinat: ", "");
    const [lat, lng] = coords.split(",").map(s => s.trim());
    return getAddressFromCoords(lat, lng);
  };

  const fetchReportData = async () => {
    if (!vehicleId || !selectedDate) {
      setError("Vehicle ID dan tanggal harus dipilih");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchReportActivitySection(vehicleId, selectedDate);
      // console.log("data", data);
      
      // Tampilkan data dengan koordinat dulu
      const convertedData = convertApiDataToLaporanData(data);
      setLaporanData(convertedData);
      
      // Kemudian geocode secara parallel di background
      geocodeAddresses(convertedData);
      
    } catch (err: any) {
      // console.error("Error fetching report data:", err);
      setError(err.response?.data?.message || "Gagal memuat data laporan. Silakan coba lagi.");
      setLaporanData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && vehicleId && selectedDate) {
      fetchReportData();
    }
  }, [isOpen, vehicleId, selectedDate]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TIDAK BERGERAK":
        return "bg-red-500 text-white";
      case "MENGEMUDI":
        return "bg-green-500 text-white";
      case "IDLE":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getAktivitasColor = (aktivitas: string) => {
    switch (aktivitas) {
      case "STARTER MENYALA":
        return "bg-gray-800 text-white";
      case "STARTER MATI":
        return "bg-gray-800 text-white";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center bg-black bg-opacity-30 justify-center'>
      <div className='absolute inset-0 bg-opacity-50' onClick={onClose} />

      <div className='relative bg-white rounded-lg shadow-xl max-w-6xl w-full overflow-hidden'>
        <div className='flex justify-end p-4'>
          <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-full transition-colors'>
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        <div className='p-4 overflow-y-auto max-h-[calc(120vh-250px)]'>
          <div className='mb-4 p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-semibold text-gray-800'>Laporan Aktivitas Kendaraan</h2>
                <p className='text-sm text-gray-600'>
                  Vehicle ID: {vehicleId} | Tanggal: {selectedDate || new Date().toISOString().split("T")[0]}
                  {!selectedDate && <span className='text-blue-600'> (Hari ini)</span>}
                </p>
              </div>
              <button 
                onClick={fetchReportData} 
                disabled={isLoading} 
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors'
              >
                {isLoading ? "Refresh..." : "Refresh Data"}
              </button>
            </div>
          </div>

          {isLoading && (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
              <span className='ml-3 text-gray-600'>Memuat data laporan...</span>
            </div>
          )}

          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
              <div className='flex items-center'>
                <AlertCircle className='w-5 h-5 text-red-500 mr-2' />
                <span className='text-red-700 font-medium'>Error:</span>
              </div>
              <p className='text-red-600 mt-1'>{error}</p>
            </div>
          )}

          {!isLoading && !error && laporanData.length === 0 && (
            <div className='text-center py-12'>
              <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500 text-lg font-medium'>Tidak ada data perjalanan</p>
              <p className='text-gray-400 mt-1'>Tidak ada aktivitas kendaraan pada tanggal yang dipilih</p>
            </div>
          )}

          {!isLoading && !error && laporanData.length > 0 && (
            <div className='space-y-4'>
              {laporanData.map((item) => (
                <div key={item.id} className='border rounded-lg overflow-hidden'>
                  <div className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start space-x-3 flex-1'>
                        <AlertCircle className='w-5 h-5 text-red-500 mt-0.5 flex-shrink-0' />
                        <div className='flex-1'>
                          <p className='text-sm text-red-500 font-medium'>{item.title}</p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-6 text-xs text-gray-600 ml-4'>
                        <div>
                          <span className='font-medium'>{item.distance}</span>
                          <span className='ml-1'>Kilometer</span>
                        </div>
                        <div>
                          <span className='font-medium'>{item.duration}</span>
                          <span className='ml-1 text-gray-500'>Mengemudi</span>
                        </div>
                        <div>
                          <span className='font-medium'>{item.idleTime}</span>
                          <span className='ml-1 text-gray-500'>Idle</span>
                        </div>
                        <div>
                          <span className='font-medium'>{item.stoppedTime}</span>
                          <span className='ml-1 text-gray-500'>Starter</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='mx-4 border-b border-gray-400'></div>

                  <div className='p-4 bg-white'>
                    <div className='space-y-3'>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='text-sm font-medium'>Mulai</span>
                          <span className='text-sm font-medium'>
                            {item.date}, {item.startTime}
                          </span>
                        </div>
                        <div className='text-sm text-gray-400'>{item.startLocation}</div>
                      </div>

                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                          <span className='text-sm font-medium'>Akhir</span>
                          <span className='text-sm font-medium'>
                            {item.date}, {item.endTime}
                          </span>
                        </div>
                        <div className='text-sm text-gray-400'>{item.endLocation}</div>
                      </div>
                    </div>

                    <div className='space-x-4 mt-4 pt-4 border-t border-gray-400'></div>

                    <div>
                      <div className='flex justify-between'>
                        <button 
                          className='flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors' 
                          onClick={() => toggleExpanded(item.id)}
                        >
                          {expandedItems.has(item.id) ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
                          <span>RIWAYAT PERJALANAN</span>
                        </button>
                      </div>

                      {expandedItems.has(item.id) && item.riwayat.length > 0 && (
                        <div className='mt-4 border border-gray-200 rounded-lg overflow-hidden'>
                          <div className='bg-blue-50 border-b border-gray-200'>
                            <div className='grid grid-cols-[77px_123px_132px_84px_340px_85px_82px_80px] gap-1 p-3 text-xs font-medium text-gray-700'>
                              <div>Waktu</div>
                              <div>Status</div>
                              <div>Aktivitas</div>
                              <div>Kecepatan</div>
                              <div>Lokasi</div>
                              <div>Odometer</div>
                              <div>Lintang</div>
                              <div>Bujur</div>
                            </div>
                          </div>

                          <div className='bg-white max-h-full'>
                            {item.riwayat.map((riwayat) => (
                              <div 
                                key={riwayat.id} 
                                className='grid grid-cols-[70px_120px_130px_80px_1fr_80px_80px_80px] gap-2 p-3 text-xs border-b border-gray-100 hover:bg-gray-50'
                              >
                                <div className='font-medium'>{riwayat.waktu}</div>
                                <div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(riwayat.status)}`}>
                                    {riwayat.status}
                                  </span>
                                </div>
                                <div>
                                  {riwayat.aktivitas && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAktivitasColor(riwayat.aktivitas)}`}>
                                      {riwayat.aktivitas}
                                    </span>
                                  )}
                                </div>
                                <div>{riwayat.kecepatan}</div>
                                <div className='text-gray-600'>{riwayat.lokasi}</div>
                                <div className='text-gray-600'>{riwayat.odometer}</div>
                                <div className='text-gray-600'>{riwayat.lintang}</div>
                                <div className='text-gray-600'>{riwayat.bujur}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {expandedItems.has(item.id) && item.riwayat.length === 0 && (
                        <div className='mt-4 p-4 text-center text-gray-500 text-sm bg-gray-50 rounded'>
                          Tidak ada riwayat perjalanan untuk item ini
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatedLaporanModal;