import { TdataDummyKendaraan, TdataDummyNotification, TdataDummyPengguna, TdataDummyPerawatanDetail, TdataDummyPerawatanKendaraan, TdataPengguna } from "./type";

export const dataDummyNotification: TdataDummyNotification[] = [
  {
    id: 1,
    type: "Service",
    title: "Waktunya Service Mobil",
    description: "Mobil AB 1234 TY sudah waktunya service, segera lakukan service agar mobil anda tetap terawat",
    time: new Date("2025-02-09"),
    read: true,
  },
  {
    id: 2,
    type: "Geofance",
    title: "Pelanggaran Geofance",
    description: "Mobil AB 1234 TY sudah keluar dari zona A, cek segera",
    time: new Date("2025-02-09"),
    read: false,
  },
  {
    id: 3,
    type: "Service",
    title: "Waktunya Service Mobil",
    description: "Mobil AB 1234 TY sudah waktunya service, segera lakukan service agar mobil anda tetap terawat",
    time: new Date("2025-03-09"),
    read: false,
  },
  {
    id: 4,
    type: "Service",
    title: "Waktunya Service Mobil",
    description: "Mobil AB 1234 TY sudah waktunya service, segera lakukan service agar mobil anda tetap terawat",
    time: new Date("2025-03-09"),
    read: false,
  },
];

export const dataDummyKendaraan: TdataDummyKendaraan[] = [
  {
    id: 1,
    license_plate: "AB 1234 TY",
    type: "Menyala",
  },
  {
    id: 2,
    license_plate: "AB 3213 DD",
    type: "Mati",
  },
  {
    id: 3,
    license_plate: "AB LO21 KW",
    type: "Diam",
  },
  {
    id: 4,
    license_plate: "AB SH1 L4",
    type: "Menyala",
  },
  {
    id: 5,
    license_plate: "AB 1234 TY",
    type: "Menyala",
  },
  {
    id: 6,
    license_plate: "AB 3213 DD",
    type: "Mati",
  },
  {
    id: 7,
    license_plate: "AB LO21 KW",
    type: "Diam",
  },
  {
    id: 8,
    license_plate: "AB SH1 L4",
    type: "Menyala",
  },
  {
    id: 9,
    license_plate: "AB 1234 TY",
    type: "Menyala",
  },
  {
    id: 10,
    license_plate: "AB 3213 DD",
    type: "Mati",
  },
  {
    id: 11,
    license_plate: "AB LO21 KW",
    type: "Diam",
  },
  {
    id: 12,
    license_plate: "AB SH1 L4",
    type: "Menyala",
  },
  {
    id: 13,
    license_plate: "AB 1234 TY",
    type: "Menyala",
  },
  {
    id: 14,
    license_plate: "AB 3213 DD",
    type: "Mati",
  },
  {
    id: 15,
    license_plate: "AB 3213 DD",
    type: "Mati",
  },
];

export const dataDummyDetaillPerawatanKendaraan: TdataDummyPerawatanDetail[] = [
  {
    id: 0,
    maintanance_id: 0,
    license_plat: "AB 1270 UK",
    description: "Ganti oli mesin, periksa dan setel sistem pendinginan, ganti ban belang, periksa dan setel transmisi",
    last_date_maintanance: new Date("2025-01-25"),
    last_distance_maintanance: 139267,
  },
  {
    id: 1,
    maintanance_id: 1,
    license_plat: "AB K23 LO",
    description: "Periksa rem depan, ganti oli power steering, cek aki dan sistem pengisian",
    last_date_maintanance: new Date("2025-02-10"),
    last_distance_maintanance: 120980,
  },
  {
    id: 2,
    maintanance_id: 2,
    license_plat: "AD 4456 RW",
    description: "Ganti oli transmisi, setel sistem kemudi, periksa tekanan ban",
    last_date_maintanance: new Date("2025-03-01"),
    last_distance_maintanance: 104500,
  },
  {
    id: 3,
    maintanance_id: 3,
    license_plat: "AA 9087 EX",
    description: "Ganti filter udara, periksa sistem bahan bakar, cek sistem kelistrikan",
    last_date_maintanance: new Date("2025-03-15"),
    last_distance_maintanance: 98050,
  },
];

export const dataDummyPerawaanKendaraan: TdataDummyPerawatanKendaraan[] = [
  {
    id: 1,
    vehicle_id: 1,
    last_maintenance: new Date("2025-03-20"),
    month_remainder: 3,
    license_plate: "AB 2314 TY",
    distance_remainder: 3000,
    detail: dataDummyDetaillPerawatanKendaraan.find((detail) => detail.maintanance_id === 1),
  },
  {
    id: 2,
    vehicle_id: 2,
    last_maintenance: new Date("2024-12-25"),
    month_remainder: 3,
    license_plate: "AB 3312 TY",
    distance_remainder: 3000,
    detail: dataDummyDetaillPerawatanKendaraan.find((detail) => detail.maintanance_id === 2),
  },
  {
    id: 3,
    vehicle_id: 3,
    last_maintenance: new Date("2025-01-25"),
    month_remainder: 4,
    license_plate: "AB 1234 WA",
    distance_remainder: 4000,
    detail: dataDummyDetaillPerawatanKendaraan.find((detail) => detail.maintanance_id === 3),
  },
];

export const dataDummyPengguna: TdataDummyPengguna[] = [
  {
    id: 1,
    name: "Matador",
    phone: "+62 834565432786 ",
    email: "matadortracker@gmail.com",
    status: "Aktif",
  },
  {
    id: 2,
    name: "trackeradmin",
    phone: "+62 834565432786 ",
    email: "trackeradmin@gmail.com",
    status: "Aktif",
  },
  {
    id: 3,
    name: "adminmatador",
    phone: "+62 834565432786 ",
    email: "adminmatadortracker@gmail.com",
    status: "Tidak Aktif",
  },
];

export const currentUser: TdataPengguna = {
  username: "Tcracker",
  email: "widyamatador@tracker.id",
  phone: "087696571265",
  password: "matador@tracker",
  isActive: false,
};
