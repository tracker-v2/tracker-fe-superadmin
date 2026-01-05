import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadYearlyFuelReport } from "@/api/report";
import { toast } from "sonner";

export interface YearlyFuelItem {
  month: string;
  distance: number;
  fuelConsumption: number;
}

interface FuelYearlyTableProps {
  data: YearlyFuelItem[];
  vehicleId?: number;
  year?: string;
}

export function FuelYearlyTable({ data, vehicleId, year }: FuelYearlyTableProps) {
  const handleDownload = async () => {
    if (!vehicleId || !year) {
      toast.error("Data kendaraan atau tahun tidak lengkap");
      return;
    }

    try {
      const { blob, filename } = await downloadYearlyFuelReport(vehicleId, year);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Laporan detail bahan bakar tahunan berhasil diunduh!");
    } catch (error) {
      console.error("Gagal mengunduh laporan:", error);
      toast.error("Gagal mengunduh laporan. Silakan coba lagi.");
    }
  };

  if (!data || data.length === 0) {
    return <div className='text-muted-foreground p-4 text-center'>Tidak ada data bahan bakar tahunan.</div>;
  }

  const totalDistance = data.reduce((sum, item) => sum + item.distance, 0);
  const totalFuel = data.reduce((sum, item) => sum + item.fuelConsumption, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Laporan Bahan Bakar Tahunan</h3>
        <Button
          onClick={handleDownload}
          className="bg-blue-900 hover:bg-blue-800"
          disabled={!vehicleId || !year}
        >
          <Download className="w-4 h-4 mr-2" />
          Unduh Laporan
        </Button>
      </div>
      
      <Table>
        {/* <TableCaption>Laporan Bahan Bakar Tahunan</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className='text-zinc-900 font-bold'>Bulan</TableHead>
            <TableHead className='text-zinc-900 font-bold'>Jarak Tempuh (Km)</TableHead>
            <TableHead className='text-zinc-900 font-bold'>Total Bahan Bakar (L)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>{item.month}</TableCell>
              <TableCell>{item.distance}</TableCell>
              <TableCell>{item.fuelConsumption}</TableCell>
            </TableRow>
          ))}
          <TableRow className='font-semibold bg-gray-100'>
            <TableCell>Total</TableCell>
            <TableCell>{totalDistance}</TableCell>
            <TableCell className='text-left'>{totalFuel}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
