"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import {
  UserIcon,
  UserGroupIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import DataTable from "../components/dataTabel";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type DataItem = {
  total_siswa: number;
};

interface Siswa {
  id_siswa: number;
  nama_siswa: string;
  kelas: string;
  nomor_wali: string;
}

type AttendanceItem = {
  keterangan: string;
  tanggal: string;
  // Tambahkan properti lainnya sesuai dengan struktur data Anda
};

type Admin = {
  id_admin: number;
  nama_admin: string;
  alamat: string;
  // Tambahkan properti lain yang sesuai dengan struktur data di tabel 'admin'
};
interface Kehadiran {
  total_hadir: number;
  total_terlambat: number;
  total_alpa: number;
  total_sakit: number;
  total_izin: number;
  total_pulang: number; // Tambahkan total pulang
}

const AdminPage = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [totalSiswa, setTotalSiswa] = useState([]); // Menggunakan angka untuk total siswa// Inisialisasi dengan array kosong

  useEffect(() => {
    // Fungsi untuk mengambil data dari API
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}/joinNonMaster/total-kelas-siswa`);
        const result = await response.json();

        // Memeriksa apakah response berhasil
        if (result.Status === 200) {
          // Menghitung total siswa dari response.data
          const total = result.data.reduce(
            (sum: number, item: DataItem) => sum + item.total_siswa,
            0
          );

          // Menyimpan total siswa ke dalam state
          setTotalSiswa(total);

          // Menyimpan data kelas ke dalam state
          setKelas(result.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array untuk menjalankan fetch hanya sekali saat komponen pertama kali dimuat

  // const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    // console.log(token);
    if (!token) {
      router.push("../login");
      return;
    }
    axios.defaults.headers.common["Authorization"] = token;
  }, [router]);

  const [siswaData, setSiswaData] = useState([]);
  const fetchNamaKelas = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/joinNonMaster/nama-siswa-kelas`
      );
      setSiswaData(response.data.data); // Menyimpan data ke state kelas
      console.log("total", response.data);
    } catch (error) {
      console.error("Fetch error:", error); // Menangani kesalahan
    }
  };
  useEffect(() => {
    fetchNamaKelas(); // Panggil fungsi fetch saat komponen di-mount
  }, []);

  const [kelas, setKelas] = useState([]);
  const [totalSemuaSiswa, setTotalSemuaSiswa] = useState(0);
  // const [totalSemuaKehadiran, setTotalSemuaKehadiran] = useState(0);
  const [totalSemuaKehadiran, setTotalSemuaKehadiran] = useState<Kehadiran>({
    total_hadir: 0,
    total_terlambat: 0,
    total_alpa: 0,
    total_sakit: 0,
    total_izin: 0,
    total_pulang: 0,
  });
  const [totalPerkategori, setTotalPerkategori] = useState(0);
  const [totalSemuaRombel, setTotalSemuaRombel] = useState(0);
  const [totalSemuaGuru, setTotalSemuaGuru] = useState(0);
  const fetchKelasSiswaTotal = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/joinNonMaster/total-kelas-siswa`
      );

      // Menyimpan data ke state
      setKelas(response.data.data);
      setTotalSemuaSiswa(response.data.totalSemuaSiswa); // Simpan totalSemuaSiswa
      setTotalSemuaKehadiran(response.data.totalKeseluruhan);
      setTotalPerkategori(response.data.totalSemuaKategori);
      setTotalSemuaRombel(response.data.totalSemuaRombel);
      setTotalSemuaGuru(response.data.totalSemuaGuru);


      console.log("total siswa", response.data); // Debugging
    } catch (error) {
      console.error("Fetch error:", error); // Menangani kesalahan
    }
  };

  useEffect(() => {
    fetchKelasSiswaTotal(); // Panggil fungsi fetch saat komponen di-mount
  }, []);

  //   const headers = Object.keys(siswaData[0]);

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

  const [alpaData, setAlpaData] = useState<Siswa[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}/absensi/all-absensi`);
        const result = await response.json();
        if (result.Status === 200) {
          const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
          // Filter siswa dengan keterangan "Alpa"
          const alpaSiswa = result.data.filter(
            (item: AttendanceItem) => item.keterangan === "Alpa" && item.tanggal === today
          );
          setAlpaData(alpaSiswa);
        } else {
          console.error("Data tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-3 2xl:gap-7.5 px-6">
        <div className="rounded-lg border border-stroke bg-blue-500 px-7.5 px-2 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 rounded-full bg-meta-2 dark:bg-meta-4">
            <UserIcon className="h-8 w-8 text-gray-700" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="text-sm font-medium">Total Siswa</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
              {totalSemuaSiswa}
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-stroke bg-green-500 px-7.5 px-2 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 rounded-full bg-meta-2 dark:bg-meta-4">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="text-sm font-medium">Total Rombel</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
              {totalSemuaRombel}
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-stroke bg-orange-500 px-7.5 px-2 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 rounded-full bg-meta-2 dark:bg-meta-4">
            <IdentificationIcon className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="text-sm font-medium">Total Staff</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-meta-3 undefined ">
              {totalSemuaGuru}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-5 px-6 py-4 rounded-lg ">
  <div className="overflow-x-auto max-w-full">
    <table className="w-full table-auto  ">
      <thead>
        <tr className="">
          <th className="px-4 py-2 text-slate-800 ">Total Hadir</th>
          <th className="px-4 py-2 text-slate-800 ">Terlambat</th>
          <th className="px-4 py-2 text-slate-800 ">Alpa</th>
          <th className="px-4 py-2 text-slate-800 ">Sakit</th>
          <th className="px-4 py-2 text-slate-800 ">Izin</th>
          <th className="px-4 py-2 text-slate-800 ">Total Semua Kategori</th>
          <th className="px-4 py-2 text-slate-800">Total Pulang</th>
        </tr>
      </thead>
      <tbody>
        <tr className="text-center text-gray-800 bg-white">
          <td className="px-4 py-2 ">{totalSemuaKehadiran.total_hadir}</td>
          <td className="px-4 py-2 ">{totalSemuaKehadiran.total_terlambat}</td>
          <td className="px-4 py-2 ">{totalSemuaKehadiran.total_alpa}</td>
          <td className="px-4 py-2 ">{totalSemuaKehadiran.total_sakit}</td>
          <td className="px-4 py-2 ">{totalSemuaKehadiran.total_izin}</td>
          <td className="px-4 py-2  font-semibold">{totalPerkategori}</td>
          <td className="px-4 py-2">{totalSemuaKehadiran.total_pulang}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


      <div className="flex flex-col lg:flex-row">
        {/* Column 1: Input */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border overflow-x-auto">
          <p className="lg:text-center lg:pb-3 font-semibold">Tabel Absensi </p> 
            <div className="bg-slate-600 p-2 rounded-lg h-full">
              <div className="overflow-x-auto h-full">
                <DataTable columns={tableColumns} data={kelas} />
              </div>
            </div>
          </div>
        </div>
        {/* Column 2: Table */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6">
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border "> 
       <p className="lg:text-center lg:pb-3 font-semibold">Tabel Alpa </p> 
        <div className="bg-slate-600 p-2 rounded-xl">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-white tracking-wider">
                  NO
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-white tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-white tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-white tracking-wider">
                  Wa Ortu
                </th>
              </tr>
            </thead>
            <tbody>
              {alpaData.length > 0 ? (
                alpaData.map((siswa, index) => (
                  <tr key={siswa.id_siswa}>
                    <td className="px-6 py-4 border-b border-gray-300  text-white text-sm">{index + 1}</td>
                    <td className="px-6 py-4 border-b border-gray-300 text-white  text-sm">{siswa.nama_siswa}</td>
                    <td className="px-6 py-4 border-b border-gray-300 text-white  text-sm">{siswa.kelas}</td>
                    <td className="px-6 py-4 border-b border-gray-300 text-white  text-sm">{siswa.nomor_wali}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 border-b border-gray-300 text-white text-sm text-center ">
                    Tidak ada siswa yang alpa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default AdminPage;
