import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  type FuelReport,
  type TravelReport,
  type IdleReport,
} from "@/data/report-data";
import { format } from "date-fns";
import LaporanHeader from "./komponen-ringkasan/laporan-header";
import LaporanTable from "./komponen-ringkasan/laporan-table";
import { useAuthStore } from "@/store/useAuthStore";
import { getLicensePlate } from "@/api/vehicle";
import {
  getReportFuelRingkasan,
  getReportLogsTrip,
  getReportIdleRingkasan,
} from "@/api/report";

interface FuelRawResponse {
  licensePlate: string;
  vehicleInfo: string;
  totalFuelConsumption: number;
  totalDistance: number;
}

interface TripRawResponse {
  licensePlate: string;
  vehicleInfo: string;
  totalTripDistance: number;
  tripCount: number;
  startDate: string;
  endDate: string;
  driveTime: string;
  idleTime: string;
  stopTime: string;
  duration: string;
}

interface IdleRawResponse {
  licensePlate: string;
  destinationTime: string;
  idleTime: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

type ReportItem = FuelReport | TravelReport | IdleReport;

export default function Ringkasan() {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [selectNoPolice, setSelectNoPolice] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>("Bahan Bakar");
  const [showTable, setShowTable] = useState<boolean>(false);
  const [vehicleOptions, setVehicleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [lokasiMap, setLokasiMap] = useState<Record<number, string>>({});
  const [filteredData, setFilteredData] = useState<ReportItem[]>([]);
  const [currentVehicleIds, setCurrentVehicleIds] = useState<number[]>([]);

  const companyId = useAuthStore((s) => s.user?.companyId);
  const isIdleReport = (item: ReportItem): item is IdleReport => {
    return "koordinat" in item && "tanggal" in item && "totalIdle" in item;
  };

  useEffect(() => {
    if (selectedReport !== "Idle" || filteredData.length === 0) return;

    const fetchAllLocations = async () => {
      const lokasiTemp: Record<number, string> = {};
      await Promise.all(
        filteredData.filter(isIdleReport).map(async (item) => {
          const id = item.id;
          const lat = item.koordinat.lat;
          const lon = item.koordinat.lon;

          if (lat && lon) {
            const lokasi = await getAddressFromLatLon(lat, lon);
            lokasiTemp[id] = lokasi;
          } else {
            lokasiTemp[id] = "Gagal memuat lokasi";
          }
        })
      );
      setLokasiMap(lokasiTemp);
    };

    fetchAllLocations();
  }, [filteredData, selectedReport]);

  const getAddressFromLatLon = async (
    lat: number,
    lon: number
  ): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        {
          headers: {
            "User-Agent": "tracker-app (elektronis@widyamatador.com)",
            "Accept-Language": "id",
          },
        }
      );
      const data = await res.json();
      return data.display_name || "Gagal memuat lokasi";
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return "Gagal memuat lokasi";
    }
  };

  useEffect(() => {
    if (!companyId) return;

    getLicensePlate(companyId)
      .then((res) => {
        const data = res;
        const formatted = data.map(
          (item: { id: number; licensePlate: string }) => ({
            label: item.licensePlate,
            value: String(item.id),
          })
        );
        setVehicleOptions(formatted);
      })
      .catch((err) => {
        console.error("Gagal mengambil data plat kendaraan:", err);
      });
  }, [companyId]);

  const handleSearch = async () => {
    if (!date?.from || !date?.to || selectNoPolice.length === 0) {
      return;
    }

    const vehicleIds = selectNoPolice.map((id) => Number(id));
    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";

    // Simpan vehicleIds untuk digunakan di download
    setCurrentVehicleIds(vehicleIds);

    try {
      if (selectedReport === "Bahan Bakar") {
        const result = await getReportFuelRingkasan(
          vehicleIds,
          startDate,
          endDate
        );
        const transformed = result.map(
          (
            item: FuelRawResponse & { vehicleId?: number },
            index: number
          ): FuelReport => ({
            id: index,
            vehicleId: item.vehicleId ?? vehicleIds[index] ?? 0,
            noPolisi: item.licensePlate,
            namaKendaraan: item.vehicleInfo,
            totalKonsumsi: item.totalFuelConsumption,
            jarakTempuh: item.totalDistance,
          })
        );
        setFilteredData(transformed);
      } else if (selectedReport === "Perjalanan") {
        const result = await getReportLogsTrip(vehicleIds, startDate, endDate);
        const transformed = result.map(
          (item: TripRawResponse, index: number): TravelReport => ({
            id: index,
            vehicleId: vehicleIds[index] ?? 0,
            noPolisi: item.licensePlate,
            namaKendaraan: item.vehicleInfo,
            jarakTempuh: item.totalTripDistance,
            jumlahPerjalanan: item.tripCount,
            tanggalMulai: item.startDate,
            tanggalSelesai: item.endDate,
            driveTime: item.driveTime,
            idleTime: item.idleTime,
            stopTime: item.stopTime,
            durasi: item.duration,
          })
        );
        setFilteredData(transformed);
      } else if (selectedReport === "Idle") {
        const result = await getReportIdleRingkasan(
          vehicleIds,
          startDate,
          endDate
        );
        const transformed = result.map(
          (item: IdleRawResponse, index: number): IdleReport => ({
            id: index,
            vehicleId: vehicleIds[index] ?? 0,
            noPolisi: item.licensePlate,
            tanggal: item.destinationTime,
            koordinat: {
              lat: item.location?.latitude ?? null,
              lon: item.location?.longitude ?? null,
            },
            totalIdle: item.idleTime,
          })
        );
        setFilteredData(transformed);
      }

      setShowTable(true);
    } catch (err) {
      console.error("Gagal fetch data:", err);
      setFilteredData([]);
      setShowTable(true);
    }
  };

  return (
    <div className="p-6 flex flex-col">
      <LaporanHeader
        date={date}
        setDate={setDate}
        selectNoPolice={selectNoPolice}
        setSelectNoPolice={setSelectNoPolice}
        vehicleData={vehicleOptions}
        selectedReport={selectedReport}
        setSelectedReport={setSelectedReport}
        setShowTable={setShowTable}
        handleSearch={handleSearch}
      />

      <div className="mt-8 w-full h-full flex items-center justify-center">
        {!showTable ? (
          <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground">
            <img
              src="/file.svg"
              alt="Pilih data untuk melihat laporan"
              className="w-64 mx-auto"
            />
          </div>
        ) : (
          <LaporanTable
            selectedReport={selectedReport}
            filteredData={filteredData}
            showTable={showTable}
            lokasiMap={lokasiMap}
            startDate={date?.from ? format(date.from, "yyyy-MM-dd") : ""}
            endDate={date?.to ? format(date.to, "yyyy-MM-dd") : ""}
            vehicleIds={currentVehicleIds}
          />
        )}
      </div>
    </div>
  );
}
