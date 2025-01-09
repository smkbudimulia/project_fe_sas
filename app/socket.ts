import { useEffect } from "react";
import { io,  } from "socket.io-client";

// Ganti dengan URL backend yang menggunakan WebSocket
const SOCKET_URL = "http://localhost:3005"; // Sesuaikan URL dengan backend kamu

export const useWebSocket = (onUpdate: (data: any) => void) => {
  useEffect(() => {
    const socket = io(SOCKET_URL);

    // Menerima data saat ada pembaruan absensi
    socket.on("absensiUpdated", (data) => {
      // Memanggil fungsi onUpdate yang diteruskan dari komponen
      onUpdate(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [onUpdate]);
};
