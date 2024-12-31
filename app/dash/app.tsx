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

type Admin = {
  id_admin: number;
  nama_admin: string;
  alamat: string;
  // Tambahkan properti lain yang sesuai dengan struktur data di tabel 'admin'
};

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
        const response = await fetch(`${baseUrl}/total-kelas-siswa`);
        const result = await response.json();

        // Memeriksa apakah response berhasil
        if (result.Status === 200) {
          // Menghitung total siswa dari response.data
          const total = result.data.reduce((sum: number, item: DataItem) => sum + item.total_siswa, 0);

          // Menyimpan total siswa ke dalam state
          setTotalSiswa(total);

          // Menyimpan data kelas ke dalam state
          setKelas(result.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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
  const [totalSemuaRombel, setTotalSemuaRombel] = useState(0);
  const [totalSemuaGuru, setTotalSemuaGuru] = useState(0);
  const fetchKelasSiswaTotal = async () => {
    try {
      const response = await axios.get(`${baseUrl}/joinNonMaster/total-kelas-siswa`);
      
      // Menyimpan data ke state
      setKelas(response.data.data); 
      setTotalSemuaSiswa(response.data.totalSemuaSiswa); // Simpan totalSemuaSiswa
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
    { header: "S", accessor: "s" },
    { header: "I", accessor: "i" },
    { header: "A", accessor: "a" },
    { header: "T", accessor: "t" },
    { header: "Walas", accessor: "walas" },
    
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-3 2xl:gap-7.5 px-6">
        <div className="rounded-lg border border-stroke bg-blue-500 px-7.5 px-2 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 rounded-full bg-meta-2 dark:bg-meta-4">
            <UserIcon className="h-8 w-8 text-gray-700" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
            <h1>Total Siswa: </h1>
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
      <div className="flex flex-col lg:flex-row">
        {/* Column 1: Input */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border overflow-x-auto">
            <div className="bg-slate-600 p-2 rounded-lg h-full">
              <div className="overflow-x-auto h-full">
                <DataTable columns={tableColumns} data={kelas} />
              </div>
            </div>
            
          </div>
        </div>
        {/* Column 2: Table */}
        <div className="w-full  lg:w-1/2 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border">
            <div className="bg-slate-600 p-2 rounded-xl">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-white tracking-wider">
                      NO
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-white tracking-wider">
                      Foto
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
                  <tr>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm"></td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm"></td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm"></td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm"></td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm"></td>
                  </tr>
                  {/* Tambahkan baris lain sesuai kebutuhan */}
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
