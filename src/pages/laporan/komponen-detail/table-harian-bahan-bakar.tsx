import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadFuelReportDetailDay } from "@/api/report";
import { toast } from "sonner";

export interface DailyFuelItem {
  id: number;
  time: string;
  distance: number;
  fuelConsumption: number;
}

interface FuelDailyTableProps {
  data: DailyFuelItem[];
  vehicleId?: number;
  date?: string; // format: YYYY-MM-DD
}

export function FuelDailyTable({ data, vehicleId, date }: FuelDailyTableProps) {
  const handleDownload = async () => {
    if (!vehicleId || !date) {
      toast.error("Data kendaraan atau tanggal tidak lengkap");
      return;
    }

    try {
      const { blob, filename } = await downloadFuelReportDetailDay(vehicleId, date);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Laporan detail bahan bakar harian berhasil diunduh!");
    } catch (error) {
      console.error("Gagal mengunduh laporan:", error);
      toast.error("Gagal mengunduh laporan. Silakan coba lagi.");
    }
  };

  if (!data || data.length === 0) {
    return <div className='text-muted-foreground p-4 text-center'>Tidak ada data bahan bakar harian.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Laporan Bahan Bakar Harian</h3>
        <Button
          onClick={handleDownload}
          className="bg-blue-900 hover:bg-blue-800"
          disabled={!vehicleId || !date}
        >
          <Download className="w-4 h-4 mr-2" />
          Unduh Laporan
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-zinc-900 font-bold'>Jam</TableHead>
            <TableHead className='text-zinc-900 font-bold text-left'>Jarak Tempuh (Km)</TableHead>
            <TableHead className='text-zinc-900 font-bold text-left'>Total Konsumsi Bahan Bakar (L)</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.time}</TableCell>
              <TableCell>{item.distance}</TableCell>
              <TableCell>{item.fuelConsumption}</TableCell>
            </TableRow>
          ))}
          {/* Baris Total */}
          <TableRow className='bg-gray-100 font-semibold'>
            <TableCell>Total</TableCell>
            <TableCell className='text-left'>{data.reduce((sum, item) => sum + item.distance, 0)}</TableCell>
            <TableCell className='text-left'>{data.reduce((sum, item) => sum + item.fuelConsumption, 0)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
