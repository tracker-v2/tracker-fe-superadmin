// src/api/auth.ts
import axios from "@/lib/axios";

export async function loginApi(email: string, password: string) {
  const response = await axios.post("/auth/login", {
    email,
    password,
  });

  return response.data.data.token; // Pastikan struktur ini sesuai dengan response backend kamu
}

export const getProfileApi = async (token: string) => {
  const res = await axios.get("/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data;
};

export const getProfileDashboardApi = async (token: string) => {
  const res = await axios.get("/users/profile-dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data;
};

export const getUserByCompanyApi = async (token: string) => {
  const res = await axios.get("/users/user-by-company", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data;
};
