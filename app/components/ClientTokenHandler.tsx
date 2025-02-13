// app/components/ClientTokenHandler.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const TOKEN_EXPIRATION_MINUTES = 60; // Waktu token dalam menit

export default function ClientTokenHandler() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = () => {
      const token = Cookies.get("token");
      if (!token) {
        router.replace("/login"); // Redirect ke halaman login jika token tidak ada
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 5000); // Cek token setiap 5 detik

    return () => {
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
