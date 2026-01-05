import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { FuelDailyTable } from "./komponen-detail/table-harian-bahan-bakar";
import { FuelMonthlyTable } from "./komponen-detail/table-bulanan-bahan-bakar";
import { FuelYearlyTable } from "./komponen-detail/table-tahunan-bahan-bakar";
import { TravelDetail, TravelTable } from "./komponen-detail/table-perjalanan";
import { IdleTable } from "./komponen-detail/table-idle";
import { DetailHeader } from "./komponen-detail/detail-header";
import { reverseGeocode } from "@/hooks/useReverseGeocode";
import { useAuthStore } from "@/store/useAuthStore";
import { getIdleReportDetail } from "@/api/report";
import type { IdleDetail, MonthlyFuelReportResponses, RawIdleSession } from "@/types/report";
import { getLicensePlate } from "@/api/vehicle";
import { getDetailYearlyFuelReportApi, getDetailMonthlyFuelReportApi, getDetailDailyFuelReportApi, getTripReportDetail } from "@/api/report";

import type { YearlyFuelReportResponse, DailyFuelReportResponse } from "@/types/report";

type MonthlyReport = {
  month: string;
  tripDistance: number;
  fuelConsumption: number;
};

type DailyRaw = {
  timestamp: string;
  tripDistance: number;
  fuelConsumption: number | string;
};

export type MonthlyRawReport = {
  date: string;
  tripDistance: number;
  fuelConsumption: number;
};

export default function Detail() {
  const [selectedNoPolice, setSelectedNoPolice] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string>("Bahan Bakar");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Harian");
  const [date, setDate] = useState<Date>();
  const [travelDetailData, setTravelDetailData] = useState<TravelDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [idleDetailData, setIdleDetailData] = useState<IdleDetail[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const [vehicleOptions, setVehicleOptions] = useState<{ label: string; value: string }[]>([]);
  const [yearlyFuelData, setYearlyFuelData] = useState<YearlyFuelReportResponse | null>(null);
  const [monthlyFuelData, setMonthlyFuelData] = useState<MonthlyFuelReportResponses | null>(null);
  const [dailyFuelData, setDailyFuelData] = useState<DailyFuelReportResponse | null>(null);
  const companyId = useAuthStore((s) => s.user?.companyId);

  useEffect(() => {
    if (!companyId) return;

    getLicensePlate(companyId)
      .then((res) => {
        const formatted = res.map((item: { id: number; licensePlate: string }) => ({
          label: item.licensePlate,
          value: String(item.id),
        }));
        setVehicleOptions(formatted);
      })
      .catch((err) => {
        console.error("Failed to fetch license plates:", err);
      });
  }, [companyId]);

  const handleSearch = async () => {
    setShowResults(true);
    setIsLoading(true);

    if (!selectedNoPolice || (!date && selectedReport === "Bahan Bakar")) {
      setIsLoading(false);
      return;
    }

    const vehicleId = parseInt(selectedNoPolice);

    try {
      if (selectedReport === "Bahan Bakar") {
        const selectedDate = date!;
        if (selectedPeriod === "Tahunan") {
          const year = selectedDate.getFullYear().toString();
          const data = await getDetailYearlyFuelReportApi(vehicleId, year);
          setYearlyFuelData({
            ...data,
            monthlyReport: data.monthlyReport.map((item: MonthlyReport) => ({
              month: item.month,
              distance: item.tripDistance,
              fuelConsumption: item.fuelConsumption,
            })),
          });
          setMonthlyFuelData(null);
          setDailyFuelData(null);
        } else if (selectedPeriod === "Bulanan") {
          const year = selectedDate.getFullYear();
          const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
          const formatted = `${year}-${month}`;
          const data = await getDetailMonthlyFuelReportApi(vehicleId, formatted);
          setMonthlyFuelData({
            ...data,
            report: data.data.report.map((item: MonthlyRawReport) => ({
              date: item.date,
              distance: item.tripDistance,
              fuelConsumption: item.fuelConsumption,
            })),
          });
          setYearlyFuelData(null);
          setDailyFuelData(null);
        } else if (selectedPeriod === "Harian") {
          const formatted = format(selectedDate, "yyyy-MM-dd");
          const data = await getDetailDailyFuelReportApi(vehicleId, formatted);
          setDailyFuelData({
            ...data,
            report: data.dailyReports.map((item: DailyRaw, i: number) => ({
              id: i,
              time: item.timestamp,
              distance: item.tripDistance,
              fuelConsumption: Number(item.fuelConsumption),
            })),
          });
          setMonthlyFuelData(null);
          setYearlyFuelData(null);
        }
      } else if (selectedReport === "Perjalanan") {
        const start = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
        const end = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

        console.log("Fetching travel data with params:", { vehicleId, start, end });
        
        const data = await getTripReportDetail(vehicleId, start, end);
        
        console.log("Travel data response:", data);

        if (!data || !data.startLocation || !data.endLocation) {
          console.warn("Travel data is empty or has unexpected structure:", data);
          setTravelDetailData([]);
          setYearlyFuelData(null);
          setMonthlyFuelData(null);
          setDailyFuelData(null);
          return;
        }

        // Ambil alamat dari koordinat
        const [startAddress, endAddress] = await Promise.all([
          reverseGeocode(data.startLocation.latitude, data.startLocation.longitude), 
          reverseGeocode(data.endLocation.latitude, data.endLocation.longitude)
        ]);

        const transformed: TravelDetail = {
          startTime: data.startTime,
          endTime: data.endTime,
          startLocation: startAddress,
          endLocation: endAddress,
          distance: data.totalTripDistance,
          duration: data.totalOperatingTime,
        };

        console.log("Transformed travel data:", transformed);
        setTravelDetailData([transformed]);
        setYearlyFuelData(null);
        setMonthlyFuelData(null);
        setDailyFuelData(null);
      } else if (selectedReport === "Idle") {
        const start = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
        const end = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

        const data = await getIdleReportDetail(vehicleId, start, end);

        const sessions: IdleDetail[] = await Promise.all(
          data.sessions.map(async (session: RawIdleSession) => {
            const address = await reverseGeocode(session.location.latitude, session.location.longitude);
            return {
              startTime: session.startTime,
              endTime: session.endTime,
              idleTime: session.idleTime,
              location: {
                latitude: session.location.latitude,
                longitude: session.location.longitude,
                address,
              },
            };
          })
        );

        setIdleDetailData(sessions);
        setYearlyFuelData(null);
        setMonthlyFuelData(null);
        setDailyFuelData(null);
        setTravelDetailData([]);
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResultTable = () => (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold mb-4'>Laporan {selectedReport}</h2>
      </div>

      <div className='max-h-[500px] overflow-y-auto rounded-lg shadow-sm'>
        {selectedReport === "Bahan Bakar" ? (
          selectedPeriod === "Harian" ? (
            dailyFuelData?.report && dailyFuelData.report.length > 0 ? (
              <FuelDailyTable 
                data={dailyFuelData.report}
                vehicleId={selectedNoPolice ? parseInt(selectedNoPolice) : undefined}
                date={date ? format(date, "yyyy-MM-dd") : undefined}
              />
            ) : (
              <div className='text-center text-muted-foreground py-8'>Tidak ada data bahan bakar harian.</div>
            )
          ) : selectedPeriod === "Bulanan" ? (
            monthlyFuelData?.data && monthlyFuelData.data.report.length > 0 ? (
              <FuelMonthlyTable
                data={{
                  report: monthlyFuelData.data.report,
                  totalTripDistance: monthlyFuelData.data.totalTripDistance,
                  totalFuelConsumption: monthlyFuelData.data.totalFuelConsumption,
                }}
                vehicleId={selectedNoPolice ? parseInt(selectedNoPolice) : undefined}
                month={date ? `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}` : undefined}
              />
            ) : (
              <div className='text-center text-muted-foreground py-8'>Tidak ada data bahan bakar bulanan.</div>
            )
          ) : selectedPeriod === "Tahunan" ? (
            yearlyFuelData?.monthlyReport && yearlyFuelData.monthlyReport.length > 0 ? (
              <FuelYearlyTable 
                data={yearlyFuelData.monthlyReport}
                vehicleId={selectedNoPolice ? parseInt(selectedNoPolice) : undefined}
                year={date ? date.getFullYear().toString() : undefined}
              />
            ) : (
              <div className='text-center text-muted-foreground py-8'>Tidak ada data bahan bakar tahunan.</div>
            )
          ) : null
        ) : selectedReport === "Perjalanan" ? (
          travelDetailData.length > 0 ? (
            <TravelTable 
              data={travelDetailData}
              vehicleId={selectedNoPolice ? parseInt(selectedNoPolice) : undefined}
              startDate={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined}
              endDate={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined}
            />
          ) : (
            <div className='text-center text-muted-foreground py-8'>Tidak ada data perjalanan untuk rentang tanggal ini.</div>
          )
        ) : selectedReport === "Idle" ? (
          idleDetailData.length > 0 ? (
            <IdleTable 
              data={idleDetailData}
              vehicleId={selectedNoPolice ? parseInt(selectedNoPolice) : undefined}
              startDate={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined}
              endDate={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined}
            />
          ) : (
            <div className='text-center text-muted-foreground py-8'>Tidak ada data idle untuk rentang tanggal ini.</div>
          )
        ) : null}
      </div>
    </div>
  );

  return (
    <div className='p-6 flex flex-col'>
      <DetailHeader
        setSelectedReport={setSelectedReport}
        setSelectedPeriod={setSelectedPeriod}
        selectedReport={selectedReport}
        selectedPeriod={selectedPeriod}
        setShowResults={setShowResults}
        setDate={setDate}
        setDateRange={setDateRange}
        date={date}
        dateRange={dateRange}
        selectedNoPolice={selectedNoPolice}
        setSelectedNoPolice={setSelectedNoPolice}
        handleSearch={handleSearch}
        vehicleOptions={vehicleOptions}
      />

      <div className='mt-8'>
        {isLoading ? (
          <div className='flex items-center justify-center h-96 text-muted-foreground'>
            <span className='animate-pulse'>Memuat data...</span>
          </div>
        ) : !showResults ? (
          <div className='flex flex-col items-center justify-center h-96 text-center text-muted-foreground'>
            <img src='/file.svg' alt='Pilih data untuk melihat laporan' className='w-64 mx-auto' />
          </div>
        ) : (
          renderResultTable()
        )}
      </div>
    </div>
  );
}
