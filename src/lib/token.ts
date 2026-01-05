import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
  // Tambahkan properti lain jika ingin (misalnya: email, sub, role, dsb)
}

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000; // dalam detik
    return decoded.exp < now;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return true; // kalau gagal decode, dianggap invalid/expired
  }
};
