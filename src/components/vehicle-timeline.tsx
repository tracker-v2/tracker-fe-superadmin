import { useEffect, useState } from "react";
import { useVehicleStore } from "@/store/useVehicleStore";
import axios from "@/lib/axios";

const statusColorMap = {
  OPERATING: "bg-green-500",
  IDLE: "bg-yellow-400",
  STOPPED: "bg-red-500",
  UNKNOWN: "bg-gray-300",
};

type Item = { timestamp: string; status: keyof typeof statusColorMap | string };

export default function VehicleStatusTimeline() {
  const vehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const selectedDate = useVehicleStore((s) => s.selectedDate); // Ambil tanggal dari state
  
  const [data, setData] = useState<Item[]>([]);

  useEffect(() => {
    if (!vehicleId) return;
    
    // Gunakan selectedDate jika ada, jika tidak gunakan tanggal default
    const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
    
    (async () => {
      try {
        const res = await axios.get(`vehicles/${vehicleId}/vehicle-status?date=${dateToUse}`);
        if (res.data.status && Array.isArray(res.data.data)) {
          setData(res.data.data);
        }
      } catch (e) {
        console.error("Failed to fetch vehicle status", e);
      }
    })();
  }, [vehicleId, selectedDate]); // Tambahkan selectedDate ke dependency

  // Ambil N perwakilan yang merata dari awal–akhir (selalu sertakan indeks 0 & n-1)
  const downsampleEvenly = (arr: Item[], target = 24): Item[] => {
    const n = arr.length;
    if (n === 0) return [];
    if (n <= target) return arr;

    const out: Item[] = [];
    for (let i = 0; i < target; i++) {
      // Sebar merata di rentang indeks [0, n-1]
      const idx = Math.round((i * (n - 1)) / (target - 1));
      out.push(arr[idx]);
    }
    return out;
  };

  const sampled = downsampleEvenly(data, 24);

  // Format HH:mm dengan zona Asia/Jakarta agar konsisten
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });

  return (
    <div className='w-full p-4'>
      <div className='flex items-center overflow-hidden border border-gray-300 bg-gray-100 p-1 rounded-full'>
        {sampled.map((item, i) => (
          <div
            key={`${item.timestamp}-${i}`}
            className={`${statusColorMap[item.status as keyof typeof statusColorMap] ?? statusColorMap.UNKNOWN} h-4 flex-1 ${i === 0 ? "rounded-l-full" : i === sampled.length - 1 ? "rounded-r-full" : ""}`}
            title={`${formatTime(item.timestamp)} - ${item.status}`}
          />
        ))}
      </div>

      <div className='mt-2 flex justify-between text-[10px] text-gray-600'>
        {sampled.map((item, i) => (
          <span key={`${item.timestamp}-lbl-${i}`} className='flex-1 text-center'>
            {formatTime(item.timestamp)}
          </span>
        ))}
      </div>
    </div>
  );
}