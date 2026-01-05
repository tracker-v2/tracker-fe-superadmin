import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { downloadTripReportDetail } from "@/api/report";

export interface TravelDetail {
  startTime: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  distance: string;
  duration: string;
}

export type RawLocation = {
  latitude: number | string;
  longitude: number | string;
};

interface TravelTableProps {
  data: TravelDetail[];
  vehicleId?: number;
  startDate?: string;
  endDate?: string;
}

export function TravelTable({ data, vehicleId, startDate, endDate }: TravelTableProps) {
  const handleDownload = async () => {
    if (!vehicleId || !startDate || !endDate) {
      toast.error("Data kendaraan atau tanggal tidak lengkap");
      return;
    }

    try {
      const { blob, filename } = await downloadTripReportDetail(vehicleId, startDate, endDate);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Laporan detail perjalanan berhasil diunduh!");
    } catch (error) {
      console.error("Gagal mengunduh laporan:", error);
      toast.error("Gagal mengunduh laporan. Silakan coba lagi.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Laporan Perjalanan Detail</h3>
        <Button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!vehicleId || !startDate || !endDate}
        >
          <Download className="w-4 h-4 mr-2" />
          Unduh Laporan
        </Button>
      </div>
      
      <Table>
        {/* <TableCaption>Laporan Perjalanan</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className='text-zinc-900 font-bold'>Waktu Mulai</TableHead>
            <TableHead className='text-zinc-900 font-bold'>Waktu Selesai</TableHead>
            <TableHead className='text-zinc-900 font-bold'>Lokasi Mulai</TableHead>
            <TableHead className='text-zinc-900 font-bold'>Lokasi Selesai</TableHead>
            <TableHead className='text-zinc-900 font-bold'>Jarak Tempuh (Km)</TableHead>
            <TableHead className='text-zinc-900 font-bold'>Durasi Perjalanan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i}>
              <TableCell>{item.startTime}</TableCell>
              <TableCell>{item.endTime}</TableCell>
              <TableCell>{item.startLocation}</TableCell>
              <TableCell>{item.endLocation}</TableCell>
              <TableCell>{item.distance}</TableCell>
              <TableCell>{item.duration}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
