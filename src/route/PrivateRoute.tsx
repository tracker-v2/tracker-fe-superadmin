// src/routes/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { JSX } from "react";
import { isTokenExpired } from "@/lib/token";


export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const isTokenValid = token && !isTokenExpired(token);
  const isSuperAdmin = user?.role === 'super_admin';

  // Harus punya token valid DAN role super_admin
  if (!isTokenValid || !isSuperAdmin) {
    // Hapus token dan user jika tidak valid
    useAuthStore.getState().clearToken();
    return <Navigate to="/login" replace />;
  }

  return children;
}
