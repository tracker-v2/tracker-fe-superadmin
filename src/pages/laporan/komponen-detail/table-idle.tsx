import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadIdleReportDetail } from "@/api/report";
import type { IdleDetail } from "@/types/report";
import { toast } from "sonner";

type IdleTableProps = {
  data: IdleDetail[];
  vehicleId?: number;
  startDate?: string; // format: YYYY-MM-DD
  endDate?: string; // format: YYYY-MM-DD
};

export function IdleTable({ data, vehicleId, startDate, endDate }: IdleTableProps) {
  const handleDownload = async () => {
    if (!vehicleId || !startDate || !endDate) {
      toast.error("Data kendaraan atau tanggal tidak lengkap");
      return;
    }

    try {
      const { blob, filename } = await downloadIdleReportDetail(vehicleId, startDate, endDate);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Laporan detail idle berhasil diunduh!");
    } catch (error) {
      console.error("Gagal mengunduh laporan:", error);
      toast.error("Gagal mengunduh laporan. Silakan coba lagi.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Laporan Idle Detail</h3>
        <Button
          onClick={handleDownload}
          className="bg-blue-900 hover:bg-blue-800"
          disabled={!vehicleId || !startDate || !endDate}
        >
          <Download className="w-4 h-4 mr-2" />
          Unduh Laporan
        </Button>
      </div>
      
      <Table>
        {/* <TableCaption>Laporan Idle</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className='text-zinc-900 font-bold'>Waktu Mulai</TableHead>
            <TableHead className='text-zinc-900 font-bold'>Waktu Selesai</TableHead>
            <TableHead className='text-zinc-900 w-[600px] font-bold'>Lokasi</TableHead>
            <TableHead className='text-zinc-900 font-bold'>Waktu Idle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{(item.startTime)}</TableCell>
              <TableCell>{(item.endTime)}</TableCell>
              <TableCell>{item.location.address}</TableCell>
              <TableCell>{item.idleTime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
