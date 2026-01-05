"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  fetchVehicleFuelLevelDistance,
  fetchVehicleFuelLevelTime,
  fetchVehicleSpeedTime,
  fetchVehicleSpeedDistance,
} from "@/api/activity";
import { useVehicleStore } from "@/store/useVehicleStore"; // Adjust path sesuai struktur project Anda

// Types untuk API responses
interface FuelLevelTimeItem {
  timestamp: string;
  fuelLevel: string;
}

interface FuelLevelDistanceItem {
  odometer: string;
  fuel_level: string;
}

interface SpeedTimeItem {
  timestamp: string;
  speed: number;
}

interface SpeedDistanceItem {
  speed: number;
  tripDistance: string;
}

// Types untuk chart data
interface ChartDataPoint {
  xValue: string; // time atau distance
  fuel?: number;
  speed?: number;
}

const chartConfig = {
  fuel: {
    label: "Bahan Bakar",
    color: "#E46E07",
  },
  speed: {
    label: "Kecepatan",
    color: "#205986",
  },
} satisfies ChartConfig;

export default function VehicleMonitoringChart() {
  const [activeView, setActiveView] = React.useState<"waktu" | "jarak">("waktu");
  const [showFuel, setShowFuel] = React.useState(true);
  const [showSpeed, setShowSpeed] = React.useState(true);
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  // Error states
  const [fuelError, setFuelError] = React.useState(false);
  const [speedError, setSpeedError] = React.useState(false);

  const vehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const selectedDate = useVehicleStore((s) => s.selectedDate); // Ambil tanggal dari state
  const date = selectedDate || new Date().toISOString().split('T')[0]; // Fallback ke hari ini

  // Function untuk fetch data berdasarkan view dan checkbox
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setFuelError(false);
    setSpeedError(false);

    try {
      const promises = [];
      let fuelPromise = null;
      let speedPromise = null;

      // Guard clause untuk vehicleId
      if (!vehicleId) {
        setChartData([]);
        return;
      }

      // Fetch fuel data jika checkbox fuel aktif
      if (showFuel) {
        if (activeView === "waktu") {
          fuelPromise = fetchVehicleFuelLevelTime(vehicleId, date);
        } else {
          fuelPromise = fetchVehicleFuelLevelDistance(vehicleId, date);
        }
        promises.push(fuelPromise);
      }

      // Fetch speed data jika checkbox speed aktif
      if (showSpeed) {
        if (activeView === "waktu") {
          speedPromise = fetchVehicleSpeedTime(vehicleId, date);
        } else {
          speedPromise = fetchVehicleSpeedDistance(vehicleId, date);
        }
        promises.push(speedPromise);
      }

      // Jika tidak ada yang di-fetch
      if (promises.length === 0) {
        setChartData([]);
        return;
      }

      // Execute promises
      const results = await Promise.allSettled(promises);
      
      let fuelData: FuelLevelTimeItem[] | FuelLevelDistanceItem[] = [];
      let speedData: SpeedTimeItem[] | SpeedDistanceItem[] = [];

      // Process fuel data
      if (showFuel && fuelPromise) {
        const fuelResult = results.find((_, index) => 
          (showSpeed ? index === 0 : index === 0)
        );
        
        if (fuelResult && fuelResult.status === "fulfilled") {
          fuelData = fuelResult.value;
        } else {
          setFuelError(true);
        }
      }

      // Process speed data
      if (showSpeed && speedPromise) {
        const speedResultIndex = showFuel ? 1 : 0;
        const speedResult = results[speedResultIndex];
        
        if (speedResult && speedResult.status === "fulfilled") {
          speedData = speedResult.value;
        } else {
          setSpeedError(true);
        }
      }

      // Format data untuk chart
      const formattedData = formatChartData(fuelData, speedData, activeView, showFuel, showSpeed);
      setChartData(formattedData);

    } catch (error) {
      console.error("Error fetching data:", error);
      setFuelError(showFuel);
      setSpeedError(showSpeed);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [activeView, showFuel, showSpeed, vehicleId, date]);

  // Function untuk format data ke format chart
  const formatChartData = (
    fuelData: (FuelLevelTimeItem | FuelLevelDistanceItem)[],
    speedData: (SpeedTimeItem | SpeedDistanceItem)[],
    view: "waktu" | "jarak",
    hasFuel: boolean,
    hasSpeed: boolean
  ): ChartDataPoint[] => {
    const dataMap = new Map<string, ChartDataPoint>();

    // Process fuel data
    if (hasFuel && fuelData.length > 0) {
      fuelData.forEach((item) => {
        let xValue: string;
        let fuelValue: number;

        if (view === "waktu") {
          const timeItem = item as FuelLevelTimeItem;
          xValue = new Date(timeItem.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          fuelValue = Number(timeItem.fuelLevel);
        } else {
          const distanceItem = item as FuelLevelDistanceItem;
          xValue = distanceItem.odometer;
          fuelValue = Number(distanceItem.fuel_level);
        }

        if (!dataMap.has(xValue)) {
          dataMap.set(xValue, { xValue });
        }
        const existing = dataMap.get(xValue)!;
        existing.fuel = fuelValue;
      });
    }

    // Process speed data
    if (hasSpeed && speedData.length > 0) {
      speedData.forEach((item) => {
        let xValue: string;
        let speedValue: number;

        if (view === "waktu") {
          const timeItem = item as SpeedTimeItem;
          xValue = new Date(timeItem.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          speedValue = timeItem.speed;
        } else {
          const distanceItem = item as SpeedDistanceItem;
          xValue = distanceItem.tripDistance;
          speedValue = distanceItem.speed;
        }

        if (!dataMap.has(xValue)) {
          dataMap.set(xValue, { xValue });
        }
        const existing = dataMap.get(xValue)!;
        existing.speed = speedValue;
      });
    }

    // Convert map to array dan sort
    const result = Array.from(dataMap.values());
    
    if (view === "jarak") {
      // Sort by numeric value for distance
      result.sort((a, b) => Number(a.xValue) - Number(b.xValue));
    } else {
      // Sort by time
      result.sort((a, b) => a.xValue.localeCompare(b.xValue));
    }

    return result;
  };

  // Get Y-axis domain dynamically
  const getYAxisDomain = () => {
    if (chartData.length === 0) return [0, 100];

    const fuelValues = showFuel ? chartData.map(d => d.fuel).filter(v => v !== undefined) as number[] : [];
    const speedValues = showSpeed ? chartData.map(d => d.speed).filter(v => v !== undefined) as number[] : [];

    const allValues = [...fuelValues, ...speedValues];
    if (allValues.length === 0) return [0, 100];

    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);

    // Tambahkan padding 10%
    const padding = Math.max((maxValue - minValue) * 0.1, 10);
    return [Math.max(0, minValue - padding), maxValue + padding];
  };

  // Effect untuk fetch data ketika view atau checkbox berubah
  React.useEffect(() => {
    if (vehicleId) {
      fetchData();
    }
  }, [fetchData, vehicleId]);

  const hasError = fuelError || speedError;
  const hasData = chartData.length > 0;

  // Early return jika vehicleId belum ada (setelah hooks)
  if (!vehicleId) {
    return (
      <div className="w-full mx-auto">
        <Card className="border-none h-[300px]">
          <CardContent className="p-4">
            <div className="text-center text-gray-500 py-8">
              Silakan pilih kendaraan terlebih dahulu
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full ">
      <Card className="border-none ">
        <CardHeader className="flex flex-row  items-center justify-between">
          <div className="flex gap-2">
            <Button
              style={{
                background: activeView === "waktu" ? "#1E3A8A" : "#fff",
                color: activeView === "waktu" ? "#fff" : "#1E3A8A",
                border: "1px solid #1E3A8A",
              }}
              onClick={() => setActiveView("waktu")}
              disabled={loading}
            >
              Waktu
            </Button>
            <Button
              style={{
                background: activeView === "jarak" ? "#1E3A8A" : "#fff",
                color: activeView === "jarak" ? "#fff" : "#1E3A8A",
                border: "1px solid #1E3A8A",
              }}
              onClick={() => setActiveView("jarak")}
              disabled={loading}
            >
              Jarak
            </Button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fuel"
                checked={showFuel}
                onCheckedChange={(checked) => setShowFuel(checked === true)}
                disabled={loading}
              />
              <label htmlFor="fuel" className="text-sm font-medium">
                Bahan Bakar
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="speed"
                checked={showSpeed}
                onCheckedChange={(checked) => setShowSpeed(checked === true)}
                disabled={loading}
              />
              <label htmlFor="speed" className="text-sm font-medium">
                Kecepatan
              </label>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 ">
          {/* Loading state */}
          {loading && (
            <div className="text-center text-gray-500 py-8">
              Memuat data...
            </div>
          )}

          {/* Error messages */}
          {!loading && hasError && (
            <div
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "8px",
                padding: "8px",
                marginBottom: "12px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {fuelError && showFuel && "Data bahan bakar tidak ditemukan."}
              {fuelError && speedError && showFuel && showSpeed && <br />}
              {speedError && showSpeed && "Data kecepatan tidak ditemukan."}
            </div>
          )}

          {/* No data message */}
          {!loading && !hasData && !hasError && (
            <div
              style={{
                color: "gray",
                marginTop: "16px",
                textAlign: "center",
              }}
            >
              {!showFuel && !showSpeed 
                ? "Pilih setidaknya satu data untuk ditampilkan."
                : "Tidak ada data grafik untuk ditampilkan."
              }
            </div>
          )}

          {/* Chart */}
          {!loading && hasData && (
            <ChartContainer config={chartConfig} className="aspect-auto h-[150px] p-0 w-full">
              <LineChart
                data={chartData}
                margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="xValue"
                  tickLine={false}
                  axisLine
                  tickMargin={8}
                  tick={{ fontSize: 10 }}
                  stroke="#1D1D1D"
                />
                <YAxis
                  tickLine={false}
                  axisLine
                  tickMargin={8}
                  tick={{ fontSize: 10 }}
                  stroke="#1D1D1D"
                  domain={getYAxisDomain()}
                />
                <ChartTooltip
                  cursor={{ stroke: "#205986", strokeWidth: 1 }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        `${activeView === "waktu" ? "Waktu" : "Jarak"}: ${value}`
                      }
                    />
                  }
                />
                {showFuel && (
                  <Line
                    dataKey="fuel"
                    type="monotone"
                    stroke="#E46E07"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                )}
                {showSpeed && (
                  <Line
                    dataKey="speed"
                    type="monotone"
                    stroke="#205986"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}