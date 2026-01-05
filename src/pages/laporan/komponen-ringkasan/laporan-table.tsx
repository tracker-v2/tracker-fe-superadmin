import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { FuelReport, TravelReport, IdleReport } from "@/data/report-data";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  downloadFuelReport,
  downloadIdleReport,
  downloadTripLogReport,
} from "@/api/report";
import { toast } from "sonner";

type ReportItem = FuelReport | TravelReport | IdleReport;

interface LaporanTableProps {
  selectedReport: string;
  filteredData: ReportItem[];
  showTable: boolean;
  lokasiMap?: Record<number, string>;
  startDate: string; // tambahkan
  endDate: string; // tambahkan
  vehicleIds: number[]; // tambahkan
}

function formatDate(dateValue: Date | string | undefined, dateFormat: string) {
  if (!dateValue) return "";
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  return isNaN(date.getTime()) ? "" : format(date, dateFormat);
}

const LaporanTable: React.FC<LaporanTableProps> = ({
  selectedReport,
  filteredData,
  showTable,
  lokasiMap = {},
  startDate,
  endDate,
  vehicleIds,
}) => {
  if (!showTable) return null;

  const handleDownload = async () => {
    try {
      if (!startDate || !endDate) {
        toast.error("Harap pilih tanggal mulai dan tanggal selesai terlebih dahulu");
        return;
      }

      // Gunakan vehicleIds dari prop, bukan dari filteredData
      if (!vehicleIds.length) {
        toast.error("Tidak ada kendaraan untuk diunduh");
        return;
      }

      console.log("Downloading report with params:", {
        selectedReport,
        vehicleIds,
        startDate,
        endDate,
      });

      let downloadFn;
      if (selectedReport === "Bahan Bakar") {
        downloadFn = downloadFuelReport;
      } else if (selectedReport === "Perjalanan") {
        downloadFn = downloadTripLogReport;
      } else if (selectedReport === "Idle") {
        downloadFn = downloadIdleReport;
      }

      if (!downloadFn) {
        toast.error("Jenis laporan tidak valid untuk diunduh");
        return;
      }

      const { blob, filename } = await downloadFn(
        vehicleIds,
        startDate,
        endDate
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Laporan ${selectedReport} berhasil diunduh!`);
    } catch (error) {
      console.error("Gagal mengunduh laporan:", error);
      toast.error("Gagal mengunduh laporan. Silakan coba lagi.");
    }
  };

  const renderTableHeaders = () => {
    switch (selectedReport) {
      case "Bahan Bakar":
        return (
          <TableRow>
            <TableHead>No. Polisi</TableHead>
            <TableHead>Info Kendaraan</TableHead>
            <TableHead>Total Konsumsi Bahan Bakar (L)</TableHead>
            <TableHead>Jarak Tempuh (Km)</TableHead>
          </TableRow>
        );
      case "Perjalanan":
        return (
          <TableRow>
            <TableHead>No. Polisi</TableHead>
            <TableHead>Info Kendaraan</TableHead>
            <TableHead>Jarak Tempuh (Km)</TableHead>
            <TableHead>Jumlah Perjalanan</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Selesai</TableHead>
            <TableHead>Drive Time</TableHead>
            <TableHead>Idle Time</TableHead>
            <TableHead>Stop Time</TableHead>
            <TableHead>Durasi</TableHead>
          </TableRow>
        );
      case "Idle":
        return (
          <TableRow>
            <TableHead>No. Polisi</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Total Waktu Idle</TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    return filteredData.map((item) => {
      switch (selectedReport) {
        case "Bahan Bakar": {
          const fuelItem = item as FuelReport;
          return (
            <TableRow key={fuelItem.id}>
              <TableCell>{fuelItem.noPolisi}</TableCell>
              <TableCell>{fuelItem.namaKendaraan}</TableCell>
              <TableCell>{fuelItem.totalKonsumsi}</TableCell>
              <TableCell>{fuelItem.jarakTempuh}</TableCell>
            </TableRow>
          );
        }
        case "Perjalanan": {
          const travelItem = item as TravelReport;
          return (
            <TableRow key={travelItem.id}>
              <TableCell>{travelItem.noPolisi}</TableCell>
              <TableCell>{travelItem.namaKendaraan}</TableCell>
              <TableCell>{travelItem.jarakTempuh}</TableCell>
              <TableCell>{travelItem.jumlahPerjalanan}</TableCell>
              <TableCell>
                {formatDate(travelItem.tanggalMulai, "dd/MM/yyyy")}
              </TableCell>
              <TableCell>
                {formatDate(travelItem.tanggalSelesai, "dd/MM/yyyy")}
              </TableCell>
              <TableCell>{travelItem.driveTime}</TableCell>
              <TableCell>{travelItem.idleTime}</TableCell>
              <TableCell>{travelItem.stopTime}</TableCell>
              <TableCell>{travelItem.durasi}</TableCell>
            </TableRow>
          );
        }
        case "Idle": {
          const idleItem = item as IdleReport;
          return (
            <TableRow key={idleItem.id}>
              <TableCell>{idleItem.noPolisi}</TableCell>
              <TableCell>
                {formatDate(idleItem.tanggal, "dd/MM/yyyy")}
              </TableCell>
              <TableCell>
                {lokasiMap[idleItem.id] || "Memuat lokasi..."}
              </TableCell>
              <TableCell>{idleItem.totalIdle}</TableCell>
            </TableRow>
          );
        }
        default:
          return null;
      }
    });
  };

  return (
    <div className="mt-8 w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4">Laporan {selectedReport}</h2>
        <Button
          onClick={handleDownload}
          className="bg-blue-900 hover:bg-blue-800"
        >
          <Download />
          Unduh Laporan
        </Button>
      </div>
      <div className="rounded-md w-full overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
        <Table className="w-full min-w-full">
          <TableHeader className="sticky top-0 bg-white z-10">
            {renderTableHeaders()}
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              renderTableRows()
            ) : (
              <TableRow>
                <TableCell
                  colSpan={selectedReport === "Perjalanan" ? 10 : 4}
                  className="text-center py-4"
                >
                  Tidak ada data yang ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LaporanTable;
