import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../components/layout/dashboard-layout";
import { KendaraanLayout } from "../components/layout/kendaraan-layout";
import Dashboard from "../pages/dashboard/dashboard";
import { Kendaraan } from "../pages/kendaraan/kendaraan";
import Laporan from "../pages/laporan/laporan";
import Notifikasi from "../pages/dashboard/notifikasi";
import Profil from "../pages/profil/profil";
import Pengguna from "../pages/pengguna/pengguna";
import PrivateRoute from "./PrivateRoute";
import LoginPage from "@/pages/auth/login/login";
import NotFoundPage from "@/pages/not-found";
import { Toaster } from "sonner";
import VehicleMaintenanceIndexPage from "@/pages/vehicle-maintenance";
import VehicleMaintenanceShowPage from "@/pages/vehicle-maintenance/show";
import VehicleMaintenanceReportPage from "@/pages/vehicle-maintenance/report";
import { ManajemenOrganisasiPage } from "@/pages/manajemen-organisasi/manajemen-organisasi";
import { ManajemenUserPage } from "@/pages/manajemen-user/manajemen-user";
import { ManajemenDevicePage } from "@/pages/manajemen-device/manajemen-device";
import { FuelCalibrationPage } from "@/pages/fuel-calibration/fuel-calibration";
import { ListKendaraanPage } from "@/pages/kendaraan/list-kendaraan";
import { ListOdometerPage } from "@/pages/odometer/list-odometer";
import { HomePage } from "@/pages/home/home";

const AppRoutes = () => {
  return (
    <>
      <Toaster richColors closeButton position="bottom-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Outlet />
              </DashboardLayout>
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/vehicle-maintenances">
            <Route index element={<VehicleMaintenanceIndexPage />} />
            <Route path="reports" element={<VehicleMaintenanceReportPage />} />
            <Route path=":id" element={<VehicleMaintenanceShowPage />} />
          </Route>
          <Route path="/notifikasi" element={<Notifikasi />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/profile" element={<Profil />} />
          <Route path="/pengguna" element={<Pengguna />} />
          <Route path="/manajemen-organisasi" element={<ManajemenOrganisasiPage />} />
          <Route path="/manajemen-user" element={<ManajemenUserPage />} />
          <Route path="/manajemen-device" element={<ManajemenDevicePage />} />
          <Route path="/list-kendaraan/:companyId" element={<ListKendaraanPage />} />
          <Route path="/list-odometer/:companyId" element={<ListOdometerPage />} />
          <Route path="/fuel-calibration" element={<FuelCalibrationPage />} />
          <Route path="/home" element={<HomePage />} />
        </Route>

        <Route
          path="/kendaraan"
          element={
            <PrivateRoute>
              <KendaraanLayout>
                <Kendaraan />
              </KendaraanLayout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
