export type TtypeNotification = "Semua" | "Service" | "Geofance";

export type TtypeKendaraanStatus = "Menyala" | "Mati" | "Diam";

export type TdataDummyNotification = {
  id: number;
  type: TtypeNotification;
  title: string;
  description: string;
  time: Date;
  read: boolean;
};

export type TdataDummyKendaraan = {
  id: number;
  license_plate: string;
  type: TtypeKendaraanStatus;
};

export type TdataDummyPerawatanKendaraan = {
  id: number;
  vehicle_id: number;
  last_maintenance: Date;
  month_remainder: number;
  license_plate: string;
  distance_remainder: number;
  detail: TdataDummyPerawatanDetail | undefined;
};

export type TdataDummyPerawatanDetail = {
  id: number;
  maintanance_id: number;
  description: string;
  license_plat: string;
  last_date_maintanance: Date;
  last_distance_maintanance: number;
};

export type TdataDummyPengguna = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "Aktif" | "Tidak Aktif";
};

export type TdataPengguna = {
  username: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
};
