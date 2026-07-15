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
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [clickedRowIndex, setClickedRowIndex] = useState<number | null>(null);
  const [id_siswa, setIdSiswa] = useState<string | null>(null);
  const [kelas, setKelas] = useState<KelasData[]>([]);
  const [namaInstansi, setNamaInstansi] = useState<string>("");
  const [setting, setSetting] = useState<SplitSettingItem[]>([]);
  const [siswaData, setSiswaData] = useState<Item[]>([]);
  const [siswaKetinggalan, setSiswaKetinggalan] = useState<Item[]>([]);

  // Popup states
  const [isPopupVisibleSakit, setIsPopupVisibleSakit] = useState(false);
  const [isPopupVisibleKeteranganLain, setIsPopupVisibleKeteranganLain] = useState(false);
  const [isPopupVisibleAlpa, setIsPopupVisibleAlpa] = useState(false);
  const [isPopupVisiblePulang, setIsPopupVisiblePulang] = useState(false);

  // Search states
  const [searchTermSakit, setSearchTermSakit] = useState("");
  const [searchTermKeterangan, setSearchTermKeterangan] = useState("");
  const [searchTermAlpa, setSearchTermAlpa] = useState("");
  const [searchTermPulang, setSearchTermPulang] = useState("");

  // Pagination states
  const [sakitItemsPerPage, setSakitItemsPerPage] = useState(5);
  const [sakitCurrentPage, setSakitCurrentPage] = useState(1);
  const [keteranganItemsPerPage, setKeteranganItemsPerPage] = useState(5);
  const [keteranganCurrentPage, setKeteranganCurrentPage] = useState(1);
  const [alpaItemsPerPage, setAlpaItemsPerPage] = useState(5);
  const [alpaCurrentPage, setAlpaCurrentPage] = useState(1);
  const [pulangItemsPerPage, setPulangItemsPerPage] = useState(5);
  const [pulangCurrentPage, setPulangCurrentPage] = useState(1);

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
      
      const filteredData = response.data.data
        .filter((item: Set) => item.hari === today)
        .map((item: Set) => {
          const [jamMasukAwal, jamMasukAkhir] = item.jam_masuk.split(",") || ["-", "-"];
          const [jamTerlambatAwal, jamTerlambatAkhir] = item.jam_terlambat.split(",") || ["-", "-"];
          const [jamPulangAwal, jamPulangAkhir] = item.jam_pulang.split(",") || ["-", "-"];

          return {
            hari: item.hari,
            jamMasukAwal: jamMasukAwal.trim(),
            jamMasukAkhir: jamMasukAkhir.trim(),
            jamTerlambatAwal: jamTerlambatAwal.trim(),
            jamTerlambatAkhir: jamTerlambatAkhir.trim(),
            jamPulangAwal: jamPulangAwal.trim(),
            jamPulangAkhir: jamPulangAkhir.trim(),
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

  // Helper functions
  const handleDropdownToggle = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleRowClick = (row: Item, index: number) => {
    setClickedRowIndex(index);
    setIdSiswa(row.id_siswa);
  };

  const getAbsensiStatus = () => {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();

    let keterangan = "";
    let datang = "";
    let pulang = "";

    if (hour >= 6 && hour < 7) {
      keterangan = "Datang";
      datang = `${hour}:${minute < 10 ? "0" + minute : minute}`;
    } else if (hour >= 7 && hour < 9) {
      keterangan = "Terlambat";
      datang = `${hour}:${minute < 10 ? "0" + minute : minute}`;
    } else if (hour >= 9 && hour < 14) {
      keterangan = "Alpa";
    } else if (hour >= 14 && hour < 16) {
      keterangan = "Pulang";
      pulang = `${hour}:${minute < 10 ? "0" + minute : minute}`;
    } else {
      return "Waktu absensi tidak valid";
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

  // Popup toggle functions
  const togglePopupSakit = () => {
    if (isPopupVisibleSakit) {
      setSakitItemsPerPage(5);
      setSakitCurrentPage(1);
      setSearchTermSakit("");
    }
    setIsPopupVisibleSakit(!isPopupVisibleSakit);
  };

  const togglePopupKeteranganLain = () => {
    if (isPopupVisibleKeteranganLain) {
      setKeteranganItemsPerPage(5);
      setKeteranganCurrentPage(1);
      setSearchTermKeterangan("");
    }
    setIsPopupVisibleKeteranganLain(!isPopupVisibleKeteranganLain);
  };

  const togglePopupAlpa = () => {
    if (isPopupVisibleAlpa) {
      setAlpaItemsPerPage(5);
      setAlpaCurrentPage(1);
      setSearchTermAlpa("");
    }
    setIsPopupVisibleAlpa(!isPopupVisibleAlpa);
  };

  const togglePopupPulang = () => {
    if (isPopupVisiblePulang) {
      setPulangItemsPerPage(5);
      setPulangCurrentPage(1);
      setSearchTermPulang("");
    }
    setIsPopupVisiblePulang(!isPopupVisiblePulang);
  };

  // Filtered data
  const filteredSiswaSakit = siswaData
    .filter(row => row.nama_siswa.toLowerCase().includes(searchTermSakit.toLowerCase()))
    .sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa));

  const filteredSiswaKeterangan = siswaData
    .filter(row => row.nama_siswa.toLowerCase().includes(searchTermKeterangan.toLowerCase()))
    .sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa));

  const filteredSiswaAlpa = siswaKetinggalan
    .filter(row => row.nama_siswa.toLowerCase().includes(searchTermAlpa.toLowerCase()))
    .sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa));

  const filteredSiswaPulang = siswaData
    .filter(row => row.nama_siswa.toLowerCase().includes(searchTermPulang.toLowerCase()))
    .sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa));

  // Total pages
  const sakitTotalPages = Math.ceil(filteredSiswaSakit.length / sakitItemsPerPage);
  const keteranganTotalPages = Math.ceil(filteredSiswaKeterangan.length / keteranganItemsPerPage);
  const alpaTotalPages = Math.ceil(filteredSiswaAlpa.length / alpaItemsPerPage);
  const pulangTotalPages = Math.ceil(filteredSiswaPulang.length / pulangItemsPerPage);

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

      {/* Action buttons dropdown */}
      <div className="relative px-4">
        <div className="text-white py-2 flex items-center">
          <span
            onClick={handleDropdownToggle}
            className="cursor-pointer flex items-end text-gray-200 text-3xl"
          >
            {isDropdownVisible ? "▾" : "▸"}
          </span>
        </div>
        
        {isDropdownVisible && (
          <div className="lg:absolute lg:w-1/3 lg:p-6 top-full mt-2 z-10">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border">
              <div className="flex flex-col items-center justify-center">
                <h1 className="font-bold text-xl text-center lg:text-2xl mb-4">
                  Tombol untuk siswa
                </h1>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    onClick={togglePopupSakit}
                  >
                    Sakit
                  </button>
                  <button
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                    onClick={togglePopupKeteranganLain}
                  >
                    Keterangan Lain
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    onClick={togglePopupAlpa}
                  >
                    Alpa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between p-4 gap-4">
        {/* Left column - Clock and schedule */}
        <div className={`w-full lg:w-[40%] ${isDropdownVisible ? "mt-40 lg:mt-60" : ""}`}>
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

      {/* Popup Sakit */}
      {isPopupVisibleSakit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Daftar Siswa - Sakit</h2>
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchTermSakit}
              onChange={(e) => setSearchTermSakit(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">No</th>
                    <th className="p-2 border text-start">Nama Siswa</th>
                    <th className="p-2 border">Kelas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSiswaSakit.length > 0 ? (
                    filteredSiswaSakit.map((row, index) => (
                      <tr key={row.id_siswa || index}>
                        <td className="p-2 border text-center">{index + 1}</td>
                        <td className="p-2 border">{row.nama_siswa}</td>
                        <td className="p-2 border text-center">{row.kelas}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-2 border text-center">Tidak ada data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={togglePopupSakit}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Keterangan Lain */}
      {isPopupVisibleKeteranganLain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Daftar Siswa - Keterangan Lain</h2>
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchTermKeterangan}
              onChange={(e) => setSearchTermKeterangan(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">No</th>
                    <th className="p-2 border text-start">Nama Siswa</th>
                    <th className="p-2 border">Kelas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSiswaKeterangan.length > 0 ? (
                    filteredSiswaKeterangan.map((row, index) => (
                      <tr key={row.id_siswa || index}>
                        <td className="p-2 border text-center">{index + 1}</td>
                        <td className="p-2 border">{row.nama_siswa}</td>
                        <td className="p-2 border text-center">{row.kelas}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-2 border text-center">Tidak ada data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={togglePopupKeteranganLain}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Alpa */}
      {isPopupVisibleAlpa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Daftar Siswa - Alpa</h2>
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchTermAlpa}
              onChange={(e) => setSearchTermAlpa(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">No</th>
                    <th className="p-2 border text-start">Nama Siswa</th>
                    <th className="p-2 border">Kelas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSiswaAlpa.length > 0 ? (
                    filteredSiswaAlpa.map((row, index) => (
                      <tr key={row.id_siswa || index}>
                        <td className="p-2 border text-center">{index + 1}</td>
                        <td className="p-2 border">{row.nama_siswa}</td>
                        <td className="p-2 border text-center">{row.kelas}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-2 border text-center">Tidak ada data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={togglePopupAlpa}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Pulang */}
      {isPopupVisiblePulang && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Daftar Siswa - Pulang</h2>
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchTermPulang}
              onChange={(e) => setSearchTermPulang(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">No</th>
                    <th className="p-2 border text-start">Nama Siswa</th>
                    <th className="p-2 border">Kelas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSiswaPulang.length > 0 ? (
                    filteredSiswaPulang.map((row, index) => (
                      <tr key={row.id_siswa || index}>
                        <td className="p-2 border text-center">{index + 1}</td>
                        <td className="p-2 border">{row.nama_siswa}</td>
                        <td className="p-2 border text-center">{row.kelas}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-2 border text-center">Tidak ada data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={togglePopupPulang}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;