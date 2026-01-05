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
