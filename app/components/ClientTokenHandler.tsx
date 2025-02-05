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

    const refreshToken = () => {
      const token = Cookies.get("token");
      if (token) {
        const expireDate = new Date();
        expireDate.setTime(expireDate.getTime() + TOKEN_EXPIRATION_MINUTES * 60 * 1000);
        Cookies.set("token", token, { expires: expireDate });
        console.log("Token diperbarui, berlaku 1 menit lagi.");
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 5000); // Cek token setiap 5 detik

    // Event listener untuk memperbarui token saat ada interaksi pengguna
    const resetTimer = () => refreshToken();
    window.addEventListener("click", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("mousemove", resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("mousemove", resetTimer);
    };
  }, [router]);

  return null;
}
