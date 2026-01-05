// src/routes/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { JSX } from "react";
import { isTokenExpired } from "@/lib/token";


export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);

  const isValid = token && !isTokenExpired(token);

  return isValid ? children : <Navigate to="/login" replace />;
}
