"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import {
  UserIcon,
  UserGroupIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import DataTable from "../components/dataTabel";

// Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Siswa {
  id_siswa: number;
  nama_siswa: string;
  kelas_rombel: string;
  kelas: string;
  nomor_wali: string;
}

interface KelasData {
  kelas: string;
  total_siswa: number;
  total_hadir_perkelas: number;
  total_sakit_perkelas: number;
  total_izin_perkelas: number;
  total_alpa_perkelas: number;
  total_terlambat_perkelas: number;
  walas: string;
}

interface Kehadiran {
  total_hadir: number;
  total_terlambat: number;
  total_alpa: number;
  total_sakit: number;
  total_izin: number;
  total_pulang: number;
}

const AdminPage = () => {
  const router = useRouter();

  // Statistik
  const [totalSemuaSiswa, setTotalSemuaSiswa] = useState(0);
  const [totalSemuaRombel, setTotalSemuaRombel] = useState(0);
  const [totalSemuaGuru, setTotalSemuaGuru] = useState(0);
  const [totalSemuaKehadiran, setTotalSemuaKehadiran] = useState<Kehadiran>({
    total_hadir: 0,
    total_terlambat: 0,
    total_alpa: 0,
    total_sakit: 0,
    total_izin: 0,
    total_pulang: 0,
  });
  const [totalPerkategori, setTotalPerkategori] = useState(0);
  const [kelas, setKelas] = useState<KelasData[]>([]);

  // Data siswa
  const [siswaBelumAbsen, setSiswaBelumAbsen] = useState<Siswa[]>([]);
  const [alpaData, setAlpaData] = useState<Siswa[]>([]);

  // Pagination
  const [currentPageBelumAbsen, setCurrentPageBelumAbsen] = useState(1);
  const [currentPageAlpa, setCurrentPageAlpa] = useState(1);
  const itemsPerPage = 10;

  // Chart data
  const pieData = {
    labels: ["Hadir", "Terlambat", "Alpa", "Sakit", "Izin", "Pulang"],
    datasets: [
      {
        data: [
          totalSemuaKehadiran.total_hadir,
          totalSemuaKehadiran.total_terlambat,
          totalSemuaKehadiran.total_alpa,
          totalSemuaKehadiran.total_sakit,
          totalSemuaKehadiran.total_izin,
          totalSemuaKehadiran.total_pulang,
        ],
        backgroundColor: [
          "#10B981", // Hadir - hijau
          "#F59E0B", // Terlambat - kuning
          "#EF4444", // Alpa - merah
          "#6366F1", // Sakit - ungu
          "#3B82F6", // Izin - biru
          "#8B5CF6", // Pulang - ungu muda
        ],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: kelas.map((k) => k.kelas),
    datasets: [
      {
        label: "Jumlah Siswa",
        data: kelas.map((k) => k.total_siswa),
        backgroundColor: "#3B82F6",
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Auth
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, [router]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          kelasRes,
          belumAbsenRes,
          alpaRes,
        ] = await Promise.all([
          axios.get(`${baseUrl}/joinNonMaster/total-kelas-siswa`),
          fetch(`${baseUrl}/absensi/siswa-belum-absen`),
          fetch(`${baseUrl}/absensi/all-absensi`),
        ]);

        const kelasData = kelasRes.data;
        setKelas(kelasData.data || []);
        setTotalSemuaSiswa(kelasData.totalSemuaSiswa || 0);
        setTotalSemuaRombel(kelasData.totalSemuaRombel || 0);
        setTotalSemuaGuru(kelasData.totalSemuaGuru || 0);
        setTotalSemuaKehadiran(kelasData.totalKeseluruhan || {});
        setTotalPerkategori(kelasData.totalSemuaKategori || 0);

        const belumAbsenJson = await belumAbsenRes.json();
        setSiswaBelumAbsen(belumAbsenJson.data || []);

        const alpaJson = await alpaRes.json();
        if (alpaJson.Status === 200) {
          const today = new Date().toISOString().split("T")[0];
          const alpaSiswa = alpaJson.data.filter(
            (item: any) => item.keterangan === "Alpa" && item.tanggal === today
          );
          setAlpaData(alpaSiswa);
        }
      } catch (error) {
        console.error("Error fetching dashboard ", error);
      }
    };

    fetchData();
  }, []);

  // Pagination helper
  const getPaginatedData = (data: Siswa[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPagesBelumAbsen = Math.ceil(siswaBelumAbsen.length / itemsPerPage);
  const totalPagesAlpa = Math.ceil(alpaData.length / itemsPerPage);

  const tableColumns = [
    { header: "Kelas", accessor: "kelas" },
    { header: "Jumlah Siswa", accessor: "total_siswa" },
    { header: "H", accessor: "total_hadir_perkelas" },
    { header: "S", accessor: "total_sakit_perkelas" },
    { header: "I", accessor: "total_izin_perkelas" },
    { header: "A", accessor: "total_alpa_perkelas" },
    { header: "T", accessor: "total_terlambat_perkelas" },
    { header: "Walas", accessor: "walas" },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Statistik Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {[
          { title: "Total Siswa", value: totalSemuaSiswa, icon: UserIcon, bg: "bg-blue-500" },
          { title: "Total Rombel", value: totalSemuaRombel, icon: UserGroupIcon, bg: "bg-green-500" },
          { title: "Total Staff", value: totalSemuaGuru, icon: IdentificationIcon, bg: "bg-orange-500" },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`rounded-xl shadow-md p-5 text-white ${item.bg} flex items-center justify-between`}
          >
            <div>
              <p className="text-sm font-medium opacity-90">{item.title}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </div>
            <item.icon className="h-10 w-10 text-white" />
          </div>
        ))}
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart - Rekap Kehadiran */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-center">Rekap Kehadiran Hari Ini</h3>
          <div className="h-64">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        {/* Bar Chart - Siswa per Kelas */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-center">Jumlah Siswa per Kelas</h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Tabel Rekap (opsional, bisa dihapus jika sudah ada grafik) */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
        <h3 className="font-semibold text-gray-700 mb-3">Ringkasan Angka</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {["Hadir", "Terlambat", "Alpa", "Sakit", "Izin", "Total", "Pulang"].map((col) => (
                <th key={col} className="px-3 py-2 text-center">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="px-3 py-2">{totalSemuaKehadiran.total_hadir}</td>
              <td className="px-3 py-2">{totalSemuaKehadiran.total_terlambat}</td>
              <td className="px-3 py-2">{totalSemuaKehadiran.total_alpa}</td>
              <td className="px-3 py-2">{totalSemuaKehadiran.total_sakit}</td>
              <td className="px-3 py-2">{totalSemuaKehadiran.total_izin}</td>
              <td className="px-3 py-2 font-semibold">{totalPerkategori}</td>
              <td className="px-3 py-2">{totalSemuaKehadiran.total_pulang}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sisa konten: Tabel & Daftar Siswa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-center">
  Absensi Global
</h3>
          <div className="overflow-x-auto">
            <DataTable columns={tableColumns} data={kelas} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Belum Absen */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-center">Siswa Belum Absen</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-700 text-white">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Nama</th>
                    <th className="px-3 py-2">Kelas</th>
                  </tr>
                </thead>
                <tbody>
                  {siswaBelumAbsen.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                        Semua siswa sudah absen
                      </td>
                    </tr>
                  ) : (
                    getPaginatedData(siswaBelumAbsen, currentPageBelumAbsen).map((siswa, idx) => (
                      <tr key={siswa.id_siswa} className="border-b text-gray-700 hover:bg-gray-50">
                        <td className="px-3 py-2">{(currentPageBelumAbsen - 1) * itemsPerPage + idx + 1}</td>
                        <td className="px-3 py-2">{siswa.id_siswa}</td>
                        <td className="px-3 py-2">{siswa.nama_siswa}</td>
                        <td className="px-3 py-2">{siswa.kelas_rombel}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Belum Absen */}
              {totalPagesBelumAbsen > 1 && (
                <div className="flex justify-center mt-4 overflow-x-auto pb-2">
                  <div className="flex flex-wrap justify-center gap-1 max-w-full">
                    {[...Array(totalPagesBelumAbsen)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPageBelumAbsen(i + 1)}
                        className={`px-3 py-1.5 text-sm rounded-md min-w-[36px] flex items-center justify-center ${
                          currentPageBelumAbsen === i + 1
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Siswa Alpa */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-center">Siswa Alpa</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-700 text-white">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Nama</th>
                    <th className="px-3 py-2">Kelas</th>
                    <th className="px-3 py-2">Wa Ortu</th>
                  </tr>
                </thead>
                <tbody>
                  {alpaData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                        Tidak ada siswa alpa hari ini
                      </td>
                    </tr>
                  ) : (
                    getPaginatedData(alpaData, currentPageAlpa).map((siswa, idx) => (
                      <tr key={siswa.id_siswa} className="border-b text-gray-700 hover:bg-gray-50">
                        <td className="px-3 py-2">{(currentPageAlpa - 1) * itemsPerPage + idx + 1}</td>
                        <td className="px-3 py-2">{siswa.nama_siswa}</td>
                        <td className="px-3 py-2">{siswa.kelas}</td>
                        <td className="px-3 py-2">{siswa.nomor_wali}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Alpa */}
              {totalPagesAlpa > 1 && (
                <div className="flex justify-center mt-4 overflow-x-auto pb-2">
                  <div className="flex flex-wrap justify-center gap-1 max-w-full">
                    {[...Array(totalPagesAlpa)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPageAlpa(i + 1)}
                        className={`px-3 py-1.5 text-sm rounded-md min-w-[36px] flex items-center justify-center ${
                          currentPageAlpa === i + 1
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;