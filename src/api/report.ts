// src/api/fuelReport.ts
import axios from "@/lib/axios";
import { downloadFile } from "@/lib/downloadFile";

// get report fuel year detail
export const getDetailYearlyFuelReportApi = async (vehicleId: number, year: string) => {
  const res = await axios.get(`/vehicles/fuel-report/detail/year/${vehicleId}/date`, {
    params: {
      year,
    },
  });

  return res.data.data;
};

// get report fuel detail month
export const getDetailMonthlyFuelReportApi = async (
  vehicleId: number,
  monthYear: string // format: "MM-YYYY"
) => {
  const res = await axios.get(`/vehicles/fuel-report/detail/month/${vehicleId}/date`, {
    params: {
      month: monthYear, // ✅ key must be "month" not "date"
    },
  });
  return res.data;
};

// get report fuel daily fuel report detail
export const getDetailDailyFuelReportApi = async (
  vehicleId: number,
  dayMonthYear: string // format: "DD-MM-YYYY"
) => {
  const res = await axios.get(`/vehicles/fuel-report/detail/day/${vehicleId}/date`, {
    params: {
      date: dayMonthYear,
    },
  });

  return res.data.data;
};

// api get report detail trip/perjalanan
export const getTripReportDetail = async (vehicleId: number, startDate: string, endDate: string) => {
  const res = await axios.get(`vehicles/logs-trip/detail/${vehicleId}/date`, {
    params: {
      startDate,
      endDate,
    },
  });
  
  return res.data.data || res.data;
};

// api get report detail idle
export const getIdleReportDetail = async (vehicleId: number, startDate: string, endDate: string) => {
  const res = await axios.get(`vehicles/idle-report/detail/${vehicleId}/date`, {
    params: {
      startDate,
      endDate,
    },
  });

  return res.data.data;
};

// api get report ringkasan
export const getReportFuelRingkasan = async (vehicleIds: number[], startDate: string, endDate: string) => {
  const res = await axios.get("vehicles/fuel-report", {
    params: {
      vehicleIds: vehicleIds.join(","), // hasil: '14,24,34'
      startDate,
      endDate,
    },
  });

  return res.data.data;
};

// api get report ringkasan idle
export const getReportIdleRingkasan = async (vehicleIds: number[], startDate: string, endDate: string) => {
  const res = await axios.get("vehicles/idle-report/date", {
    params: {
      vehicleIds: vehicleIds.join(","),
      startDate,
      endDate,
    },
  });

  return res.data.data;
};

// api get logs trip or Perjalanan Ringkasan
export const getReportLogsTrip = async (vehicleIds: number[], startDate: string, endDate: string) => {
  const res = await axios.get("vehicles/logs-trip/date", {
    params: {
      vehicleIds: vehicleIds.join(","),
      startDate,
      endDate,
    },
  });

  return res.data.data;
};

// api download fuel report ringkasan
export const downloadFuelReport = async (vehicleIds: number[], startDate: string, endDate: string) => {
  return downloadFile("/vehicles/download/fuel-report", {
    vehicleIds,
    startDate,
    endDate,
  });
};

// api download trip log report ringkasan
export const downloadTripLogReport = async (vehicleIds: number[], startDate: string, endDate: string) => {
  return downloadFile("/vehicles/download/trip-log", {
    vehicleIds,
    startDate,
    endDate,
  });
};

// api download idle report ringkasan
export const downloadIdleReport = async (vehicleIds: number[], startDate: string, endDate: string) => {
  return downloadFile("/vehicles/download/idle-report", {
    vehicleIds,
    startDate,
    endDate,
  });
};

// api download yearly fuel report detail
export const downloadYearlyFuelReport = async (vehicleId: number, year: string) => {
  return downloadFile("/vehicles/download/fuel-report-year", {
    vehicleId,
    year,
  });
};

// api download fuel report detail harian
export const downloadFuelReportDetailDay = async (vehicleId: number, date: string) => {
  return downloadFile(`vehicles/download/fuel-report/detail/day/${vehicleId}/date`, {
    date, 
  });
};

// api download fuel report detail bulanan
export const downloadFuelReportDetailMonth = async (vehicleId: number, month: string) => {
  const convertToBackendFormat = (monthStr: string): string => {
    if (monthStr.includes("-")) {
      const [monthPart, year] = monthStr.split("-");
      return `${year}-${monthPart}`; 
    }
    return monthStr;
  };
  
  const formattedMonth = convertToBackendFormat(month);
  
  return downloadFile(`/vehicles/download/fuel-report/detail/month/${vehicleId}/date`, {
    month: formattedMonth, 
  });
};

// api download idle report detail
export const downloadIdleReportDetail = async (vehicleId: number, startDate: string, endDate: string) => {
  return downloadFile(`vehicles/download/idle-report/detail/${vehicleId}`, {
    startDate,
    endDate,
  });
};

// api download logs-trip report detail 
export const downloadTripReportDetail = async (vehicleId: number, startDate: string, endDate: string) => {
  return downloadFile(`vehicles/download/logs-trip/detail/${vehicleId}/date`, {
    startDate,
    endDate,
  });
};

