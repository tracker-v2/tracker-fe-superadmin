import axios from "@/lib/axios";

type RequestParams = Record<
  string,
  string | number | boolean | string[] | number[] | undefined
>;

export const downloadFile = async (url: string, params?: RequestParams) => {
  const formattedParams: Record<string, string | number | boolean | undefined> =
    {};
  if (params) {
    for (const key in params) {
      const value = params[key];
      if (Array.isArray(value)) {
        formattedParams[key] = value.join(",");
      } else {
        formattedParams[key] = value as string | number | boolean | undefined;
      }
    }
  }

  const res = await axios.get(url, {
    params: formattedParams,
    responseType: "blob",
  });

  const contentDisposition = res.headers["content-disposition"];

  let filename = generateDetailedFilename(url, formattedParams);

  if (contentDisposition) {
    // Format 1: filename="namafile.xlsx"
    // Format 2: filename*=UTF-8''namafile.xlsx
    // Format 3: attachment; filename="namafile.xlsx"

    const patterns = [
      /filename\*=UTF-8''([^;]+)/i, // RFC 5987 encoded filename
      /filename="([^"]+)"/i, // Quoted filename
      /filename=([^;,\n]+)/i, // Unquoted filename
    ];

    for (const pattern of patterns) {
      const match = contentDisposition.match(pattern);
      if (match && match[1]) {
        try {
          filename = decodeURIComponent(match[1].trim());
          break;
        } catch {
          filename = match[1].trim();
          break;
        }
      }
    }

    console.log("Filename from backend:", filename);
    console.log("Content-Disposition header:", contentDisposition);
  } else {
    console.warn(
      "No Content-Disposition header found, using generated filename:",
      filename
    );
  }

  return { blob: res.data, filename };
};

function generateDetailedFilename(
  url: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  let reportType = "Laporan";
  let reportLevel = ""; // Ringkasan atau Detail
  let periodType = ""; // Harian, Bulanan, Tahunan

  if (url.includes("fuel-report") || url.includes("fuel")) {
    reportType = "Laporan_Bahan_Bakar";
  } else if (url.includes("trip") || url.includes("logs-trip")) {
    reportType = "Laporan_Perjalanan";
  } else if (url.includes("idle")) {
    reportType = "Laporan_Idle";
  }

  if (
    url.includes("detail") ||
    url.includes("daily") ||
    url.includes("monthly") ||
    url.includes("yearly") ||
    url.includes("fuel-report-year")
  ) {
    reportLevel = "_Detail";

    if (url.includes("fuel-report") || url.includes("fuel")) {
      if (url.includes("daily") || url.includes("day")) {
        periodType = "_Harian";
      } else if (url.includes("monthly") || url.includes("month")) {
        periodType = "_Bulanan";
      } else if (url.includes("yearly") || url.includes("year")) {
        periodType = "_Tahunan";
      }
    }
  } else {
    reportLevel = "_Ringkasan";
  }

  let dateRange = "";

  if (periodType === "_Bulanan" && params.month) {
    // Format: YYYY-MM -> Bulan_MM-YYYY
    const monthValue = String(params.month);
    if (monthValue.includes("-")) {
      const [year, month] = monthValue.split("-");
      dateRange = `_Bulan_${month}-${year}`;
    } else {
      dateRange = `_Bulan_${monthValue}`;
    }
  } else if (periodType === "_Tahunan" && params.year) {
    dateRange = `_Tahun_${params.year}`;
  } else if (periodType === "_Harian" && params.date) {
    // Untuk harian, gunakan parameter date
    const formatToIndonesian = (dateStr: string): string => {
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    };
    dateRange = `_Tanggal_${formatToIndonesian(String(params.date))}`;
  } else if (params.startDate && params.endDate) {
    // Default date range formatting untuk laporan lainnya
    const formatToIndonesian = (dateStr: string): string => {
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    };

    const startDate = formatToIndonesian(String(params.startDate));
    const endDate = formatToIndonesian(String(params.endDate));

    if (params.startDate === params.endDate) {
      dateRange = `_Tanggal_${startDate}`;
    } else {
      dateRange = `_Tanggal_${startDate}_to_${endDate}`;
    }
  }

  let vehicleInfo = "";
  if (params.vehicleIds && reportLevel === "_Ringkasan") {
    const vehicleCount = String(params.vehicleIds).split(",").length;
    vehicleInfo = `_${vehicleCount}_Kendaraan`;
  }

  const filename = `${reportType}${periodType}${dateRange}${vehicleInfo}.xlsx`;

  return filename;
}
