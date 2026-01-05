// src/store/useAuthStore.ts
import { isTokenExpired } from "@/lib/token";
import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    companyId: number;
  } | null;
  setToken: (token: string) => void;
  setUser: (user: AuthState["user"]) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
}

// Ambil user dari localStorage (jika ada)
const savedUser = localStorage.getItem("user");

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("token"),
  user: savedUser ? JSON.parse(savedUser) : null,
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
  clearToken: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
  isAuthenticated: () => {
  const token = get().token;
  return !!token && !isTokenExpired(token);
}
}));
