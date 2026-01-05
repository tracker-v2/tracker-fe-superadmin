// src/hooks/useReverseGeocode.ts
import { useEffect, useState } from "react";

export function useReverseGeocode(lat: number | null, lon: number | null) {
  const [address, setAddress] = useState("Memuat alamat...");

  useEffect(() => {
    if (lat == null || lon == null) return;

    const controller = new AbortController();
    const { signal } = controller;

    const fetchAddress = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
          headers: {
            "User-Agent": "tracker-app (elektronis@widyamatador.com)",
            "Accept-Language": "id", // agar hasil lebih lokal
          },
          signal,
        });

        const data = await res.json();
        setAddress(data.display_name || "Alamat tidak ditemukan");
      } catch (error) {
        if (!signal.aborted) {
          console.error("Reverse geocoding failed:", error);
          setAddress("Gagal memuat alamat");
        }
      }
    };

    fetchAddress();
    return () => controller.abort();
  }, [lat, lon]);

  return address;
}

export async function reverseGeocode(lat: string, lon: string): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
      headers: {
        "User-Agent": "tracker-app (elektronis@widyamatador.com)",
        "Accept-Language": "id",
      },
    });
    const data = await res.json();
    return data.display_name || "Alamat tidak ditemukan";
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return "Gagal memuat alamat";
  }
}
