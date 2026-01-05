import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadFuelReportDetailMonth } from "@/api/report";
import { toast } from "sonner";

// Define the data type from API
export interface MonthlyFuelItem {
  date: string;
  tripDistance: number;
  fuelConsumption: number;
}
interface FuelMonthlyTableProps {
  data: {
    report: MonthlyFuelItem[];
    totalTripDistance: number;
    totalFuelConsumption: number;
  };
  vehicleId?: number;
  month?: string;
}

export function FuelMonthlyTable({
  data,
  vehicleId,
  month,
}: FuelMonthlyTableProps) {
  const handleDownload = async () => {
    if (!vehicleId || !month) {
      toast.error("Data kendaraan atau bulan tidak lengkap");
      return;
    }

    try {
      const { blob, filename } = await downloadFuelReportDetailMonth(
        vehicleId,
        month
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Laporan detail bahan bakar bulanan berhasil diunduh!");
    } catch (error) {
      console.error("Gagal mengunduh laporan:", error);
      toast.error("Gagal mengunduh laporan. Silakan coba lagi.");
    }
  };

  if (!data || data.report.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        Tidak ada data bahan bakar bulanan.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Laporan Bahan Bakar Bulanan</h3>
        <Button
          onClick={handleDownload}
          className="bg-blue-900 hover:bg-blue-800"
          disabled={!vehicleId || !month}
        >
          <Download className="w-4 h-4 mr-2" />
          Unduh Laporan
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-zinc-900 font-bold">Tanggal</TableHead>
            <TableHead className="text-zinc-900 font-bold text-left">
              Jarak Tempuh (Km)
            </TableHead>
            <TableHead className="text-zinc-900 font-bold text-left">
              Total Konsumsi Bahan Bakar (L)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.report.map((item) => (
            <TableRow key={item.date}>
              <TableCell>{item.date}</TableCell>
              <TableCell className="text-left">{item.tripDistance}</TableCell>
              <TableCell className="text-left">
                {item.fuelConsumption}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-gray-100 font-semibold">
            <TableCell>Total</TableCell>
            <TableCell className="text-left">
              {data.totalTripDistance}
            </TableCell>
            <TableCell className="text-left">
              {data.totalFuelConsumption}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
