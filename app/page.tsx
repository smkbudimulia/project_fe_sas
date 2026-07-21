"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Marquee from "react-fast-marquee";

// Components
import Header from "./header";
import DigitalClock from "./components/digitalclock";
import { Footer_2, FOOTER_TEXT } from "./version";

// Types
type Item = {
  id: string;
  nama_siswa: string;
  kelas: string;
  name: string;
  id_siswa: string;
};

interface Set {
  jam_masuk: string;
  jam_pulang: string;
  jam_terlambat: string;
  id_setting: string;
  hari: string;
}

interface SplitSettingItem {
  hari: string;
  jamMasukAwal: string;
  jamMasukAkhir: string;
  jamTerlambatAwal: string;
  jamTerlambatAkhir: string;
  jamPulangAwal: string;
  jamPulangAkhir: string;
}

interface AbsensiItem {
  id_siswa: string;
  absensi: { [key: string]: string | undefined };
}

interface KelasData {
  i: number;
  kelas: string;
  total_siswa: string;
  total_hadir_perkelas: string;
  total_sakit_perkelas: string;
  total_izin_perkelas: string;
  total_alpa_perkelas: string;
  total_terlambat_perkelas: string;
  walas: string;
}

// Constants
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper parser agar aman dengan response BE kamu
const ensureArray = (val: any) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    // Menghilangkan tanda kutip ekstra dari format BE '"07:00","08:00"'
    const cleaned = val.replace(/"/g, '').trim();
    if (!cleaned) return ['', ''];
    return cleaned.split(',').map(s => s.trim());
  }
  return ['', ''];
};

const Page = () => {
  const router = useRouter();
  
  // Authentication
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("../login");
      return;
    }
    axios.defaults.headers.common["Authorization"] = token;
  }, [router]);

  // State declarations
  const [barcode, setBarcode] = useState("");
  const [clickedRowIndex, setClickedRowIndex] = useState<number | null>(null);
  const [id_siswa, setIdSiswa] = useState<string | null>(null);
  const [kelas, setKelas] = useState<KelasData[]>([]);
  const [namaInstansi, setNamaInstansi] = useState<string>("");
  const [setting, setSetting] = useState<SplitSettingItem[]>([]);
  const [siswaData, setSiswaData] = useState<Item[]>([]);
  const [siswaKetinggalan, setSiswaKetinggalan] = useState<Item[]>([]);

  // Refs
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropref = useRef<HTMLSelectElement>(null);

  // Fetch functions
  const fetchNamaKelas = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/joinNonMaster/nama-siswa-kelas`);
      setSiswaData(response.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  const fetchNama = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/joinNonMaster/nama-siswa-ketinggalan`);
      setSiswaKetinggalan(response.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  const fetchKelasSiswaTotal = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/joinNonMaster/total-kelas-siswa`);
      setKelas(response.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  const fetchInstansi = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/setting/all-instansi`);
      const data = response.data.data;
      const instansi = data.find((instansi: any) => instansi.nama_instansi);
      if (instansi) {
        setNamaInstansi(instansi.nama_instansi);
      }
    } catch (error) {
      console.error("Error fetching instansi data:", error);
    }
  }, []);

  const fetchSetting = useCallback(async () => {
  try {
    const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
    const response = await axios.get(`${baseUrl}/setting/all-setting`);
    
      const normalizeTime = (val: any): string => {
        if (!val) return "-";
        if (Array.isArray(val)) return val.join(",");
        return String(val).replace(/"/g, "");
      };

    const filteredData = (response.data.data || [])
      .filter((item: Set) => item.hari.toLowerCase() === today.toLowerCase())
      .map((item: Set) => {
        const jamMasuk = normalizeTime(item.jam_masuk);
        const jamTerlambat = normalizeTime(item.jam_terlambat);
        const jamPulang = normalizeTime(item.jam_pulang);

        const [jamMasukAwal, jamMasukAkhir] = jamMasuk.split(",") || ["-", "-"];
        const [jamTerlambatAwal, jamTerlambatAkhir] = jamTerlambat.split(",") || ["-", "-"];
        const [jamPulangAwal, jamPulangAkhir] = jamPulang.split(",") || ["-", "-"];

        // Gunakan regex /\\./g agar SEMUA titik diganti menjadi titik dua (:)
        return {
          hari: item.hari,
          jamMasukAwal: (jamMasukAwal || "-").trim().replace(/\./g, ":"),
          jamMasukAkhir: (jamMasukAkhir || "-").trim().replace(/\./g, ":"),
          jamTerlambatAwal: (jamTerlambatAwal || "-").trim().replace(/\./g, ":"),
          jamTerlambatAkhir: (jamTerlambatAkhir || "-").trim().replace(/\./g, ":"),
          jamPulangAwal: (jamPulangAwal || "-").trim().replace(/\./g, ":"),
          jamPulangAkhir: (jamPulangAkhir || "-").trim().replace(/\./g, ":"),
        };
      });

    setSetting(filteredData);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}, []);

  // Initial data fetching
  useEffect(() => {
    fetchNamaKelas();
    fetchNama();
    fetchKelasSiswaTotal();
    fetchInstansi();
    fetchSetting();
  }, [fetchNamaKelas, fetchNama, fetchKelasSiswaTotal, fetchInstansi, fetchSetting]);

  // Auto-refresh kelas data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchKelasSiswaTotal();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchKelasSiswaTotal]);

  // Focus management for barcode input
  useEffect(() => {
    const handleFocus = (event: MouseEvent) => {
      if (
        barcodeInputRef.current &&
        !barcodeInputRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node) &&
        !dropref.current?.contains(event.target as Node)
      ) {
        barcodeInputRef.current?.focus();
      }
    };

    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }

    document.addEventListener("click", handleFocus);
    return () => document.removeEventListener("click", handleFocus);
  }, []);

  // Handle click outside table
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setClickedRowIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Konversi jam string (format "HH:MM" atau "H:M") ke total menit
const timeToMinutes = (time: string): number => {
  if (!time || time === "-") return -1;
  const parts = time.split(":");
  if (parts.length < 2) return -1;
  
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
};

  const handleRowClick = (row: Item, index: number) => {
    setClickedRowIndex(index);
    setIdSiswa(row.id_siswa);
  };

  const getAbsensiStatus = () => {
  const currentTime = new Date();
  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();
  const currentMinutes = hour * 60 + minute;
  const currentTimeStr = `${hour < 10 ? "0" + hour : hour}:${minute < 10 ? "0" + minute : minute}`;

  let keterangan = "";
  let datang = "";
  let pulang = "";

  if (setting.length > 0) {
    const s = setting[0];
    const masukAwal = timeToMinutes(s.jamMasukAwal);
    const masukAkhir = timeToMinutes(s.jamMasukAkhir);
    const terlambatAwal = timeToMinutes(s.jamTerlambatAwal);
    const terlambatAkhir = timeToMinutes(s.jamTerlambatAkhir);
    const pulangAwal = timeToMinutes(s.jamPulangAwal);
    const pulangAkhir = timeToMinutes(s.jamPulangAkhir);

    if (masukAwal !== -1 && masukAkhir !== -1 && currentMinutes >= masukAwal && currentMinutes <= masukAkhir) {
      keterangan = "Datang";
      datang = currentTimeStr;
    } else if (terlambatAwal !== -1 && terlambatAkhir !== -1 && currentMinutes >= terlambatAwal && currentMinutes <= terlambatAkhir) {
      keterangan = "Terlambat";
      datang = currentTimeStr;
    } else if (pulangAwal !== -1 && pulangAkhir !== -1 && currentMinutes >= pulangAwal && currentMinutes <= pulangAkhir) {
      keterangan = "Pulang";
      pulang = currentTimeStr;
    } else {
      return "Waktu absensi tidak valid";
    }
  } else {
    // Fallback jika data setting dari API kosong
    if (hour >= 6 && hour < 7) {
      keterangan = "Datang";
      datang = currentTimeStr;
    } else if (hour >= 7 && hour < 9) {
      keterangan = "Terlambat";
      datang = currentTimeStr;
    } else if (hour >= 9 && hour < 14) {
      keterangan = "Alpa";
    } else if (hour >= 14 && hour < 16) {
      keterangan = "Pulang";
      pulang = currentTimeStr;
    } else {
      return "Waktu absensi tidak valid";
    }
  }

  return { keterangan, datang, pulang };
};

  const showToast = (type: "success" | "error" | "warning", message: string) => {
    const options = {
      position: "top-left" as const,
      className: "bg-white shadow-lg rounded-lg p-4 font-bold",
      style: { 
        top: "250px", 
        width: "800px",
        fontSize: "4rem",
        color: "#000000",
        boxShadow: "20px 20px 40px rgba(0, 0, 0, 0.6)",
      },
    };

    if (type === "success") {
      toast.success(message, options);
    } else if (type === "warning") {
      toast.warning(message, options);
    } else if (type === "error") {
      toast.error(message, options);
    }
  };

  const handleSubmit1 = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const absensiStatus = getAbsensiStatus();
    
    if (typeof absensiStatus !== "string") {
      const { keterangan, datang, pulang } = absensiStatus;
      const tanggal = new Date().toISOString().split("T")[0];
      const formattedBarcode = barcode.trim();

      setTimeout(() => setBarcode(""), 500);

      if (keterangan === "") {
        showToast("error", "Waktu absensi tidak valid");
        return;
      }

      try {
        const response = await axios.post(`${baseUrl}/absensi/siswa-abseni`, {
          id_siswa: formattedBarcode,
          datang,
          tanggal,
          pulang,
          keterangan,
        });

        const { message } = response.data;

        if (message.includes("Terlambat")) {
          showToast("warning", message);
        } else {
          showToast("success", message);
        }
      } catch (error: any) {
        if (error.response?.data?.message) {
          showToast("error", error.response.data.message);
        } else {
          console.error(error);
        }
      }
    } else {
      showToast("error", absensiStatus);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/[()]/g, "");
    setBarcode(cleanValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit1(event);
    }
  };

  // Today's date
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });

  return (
    <div className="bg-gradient-to-b from-teal-100 to-teal-300 min-h-screen">
      <Header />
      <ToastContainer className="mt-14" />
      
      {/* Hidden barcode input */}
      <div className="p-4 text-teal-100">
        <input
          ref={barcodeInputRef}
          type="text"
          value={barcode}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder=""
          className="pointer-events-auto border-none outline-none bg-transparent"
        />
      </div>

      {/* Institution name */}
      <div className="text-center text-4xl md:text-5xl lg:text-4xl font-bold px-4" style={{ fontFamily: "Poppins, sans-serif" }}>
        {namaInstansi}
        
      </div>

      {/* Marquee */}
          <div className="mt-4 lg:mt-8">
            <Marquee gradient={false} speed={200} loop={0}>
              <span className="text-4xl lg:text-6xl text-teal-900 mx-2" style={{ fontFamily: 'Linebeam, sans-serif' }}>
                SEKOLAH ITU IBADAH. JADI JANGAN LUPA NIAT, JANGAN LUPA DOA ... DAN JANGAN LUPA ABSEN! OK ;) ~ 
              </span>
            </Marquee>
          </div>



      {/* Main content */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between p-4 gap-4">
        {/* Left column - Clock and schedule */}
        <div className={`w-full lg:w-[40%]`}>
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4 text-center ">
            <DigitalClock />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-4">
            {setting.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 font-bold rounded-l-lg">Jam Masuk</th>
                    <th className="p-2 font-bold">Jam Terlambat</th>
                    <th className="p-2 font-bold rounded-r-lg">Jam Pulang</th>
                  </tr>
                </thead>
                <tbody>
                  {setting.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td className="p-2 font-bold">{item.jamMasukAwal} - {item.jamMasukAkhir}</td>
                      <td className="p-2 font-bold">{item.jamTerlambatAwal} - {item.jamTerlambatAkhir}</td>
                      <td className="p-2 font-bold">{item.jamPulangAwal} - {item.jamPulangAkhir}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center p-4">Tidak ada jadwal untuk hari ini.</p>
            )}
          </div>

          
        </div>

        {/* Right column - Attendance table */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-4 rounded-lg shadow-md h-full">
            <div className="bg-slate-600 p-4 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">
                Absensi Global
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-700">
                      <th className="text-white p-3 text-start">No</th>
                      <th className="text-white p-3 text-start">Kelas</th>
                      <th className="text-white p-3 text-start">Jumlah Siswa</th>
                      <th className="text-white p-3">H</th>
                      <th className="text-white p-3">S</th>
                      <th className="text-white p-3">I</th>
                      <th className="text-white p-3">A</th>
                      <th className="text-white p-3">T</th>
                      <th className="text-white p-3 text-start">Walas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kelas.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3 border-b text-center">{index + 1}</td>
                        <td className="p-3 border-b">{row.kelas}</td>
                        <td className="p-3 border-b">{row.total_siswa}</td>
                        <td className="p-3 border-b text-center bg-green-500 text-white">{row.total_hadir_perkelas}</td>
                        <td className="p-3 border-b text-center bg-blue-500 text-white">{row.total_sakit_perkelas}</td>
                        <td className="p-3 border-b text-center bg-orange-400 text-white">{row.total_izin_perkelas}</td>
                        <td className="p-3 border-b text-center bg-red-500 text-white">{row.total_alpa_perkelas}</td>
                        <td className="p-3 border-b text-center bg-gray-400 text-white">{row.total_terlambat_perkelas}</td>
                        <td className="p-3 border-b">{row.walas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-center lg:text-left py-4 lg:py-5 lg:rounded-tr-3xl lg:fixed lg:bottom-0 px-4 py-4">
        <p className="text-sm text-teal-500 whitespace-pre-line">
          {FOOTER_TEXT}
        </p>
        <p className="text-sm text-teal-500 whitespace-pre-line">
          {Footer_2}
        </p>
      </footer>








    </div>
  );
};

export default Page;
