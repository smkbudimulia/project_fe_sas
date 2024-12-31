"use client";
import { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import {
  addMapel,
  fetchMapel,
  editMapel,
  deleteMapel,
  Mapel,
} from "../../../api/mapel"; // Sesuaikan dengan path fungsi addMapel Anda
import DataTable from "../../../components/dataTabel";
import * as XLSX from 'xlsx';
import useUserInfo from "@/app/components/useUserInfo";
import Swal from "sweetalert2";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
interface MapelRow {
  id_mapel?: string;
  id_admin?: string;
  nama_mapel?: string;
}
export default function _Mapel() {
  const [editData, setEditData] = useState<Mapel | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // Menyimpan ID baris yang dropdown-nya terbuka
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk mengontrol modal
  const [isMapelValid, setIsMapelValid] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentDataa, setCurrentDataa] = useState([]);
  const [selectedRow, setSelectedRow] = useState<Mapel | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [mapels, setMapels] = useState([]); // Untuk menyimpan daftar mapel
  const { idAdmin } = useUserInfo();
  const [admins, setAdmins] = useState<{ id_admin: string; nama_admin: string }[]>([]);

  const handleDownloadFormatClick = () => {
    // Data yang akan diisikan ke dalam file Excel untuk Mapel
  const data = [
    {
      id_mapel:"",
      id_admin:"",
      nama_mapel: "",
    },
  ];

  // Definisikan header file Excel
  const headers = [
    'id_mapel',
    'id_admin',
    "nama_mapel",
  ];

  // Membuat worksheet
  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });

  // Membuat workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Mapel");

  // Menghasilkan file Excel
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Membuat Blob untuk mengunduh
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Membuat link download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "format_mapel.xlsx"; // Nama file yang diunduh
  link.click();
  };

  const handleUploadFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger input file secara manual
    }
  };

  const getAdmins = async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/all-Admin`); // Ganti dengan endpoint API yang benar
      const data = await response.json();
      console.log('Data Admin:', data.data);
      setAdmins(data.data); // Menyimpan data admin ke state
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // Panggil getAdmins saat pertama kali komponen dirender
  useEffect(() => {
    getAdmins();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (!e.target) {
          console.error("e.target is null");
          return;
        }
        try {
          const data = new Uint8Array(e.target.result as ArrayBuffer); // Pastikan tipe adalah ArrayBuffer
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = (XLSX.utils.sheet_to_json(sheet) as MapelRow[]).map((row) => ({
            id_mapel: row.id_mapel || 'default_value',
            id_admin: Number(row.id_admin) || 0,  // Mengonversi id_admin menjadi number
            nama_mapel: row.nama_mapel || 'default_value',
          }));
          console.log('Data dari Excel:', jsonData); // Log data dari Excel
          setMapel(jsonData); // Simpan data ke state

          // Lakukan pengiriman data ke server setelah file diproses
          const response = await fetch(`${baseUrl}/mapel/add-mapel`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
          });

          const result = await response.json();
          
          if (response.ok) {
            console.log('Data berhasil dikirim', result);
          } else {
            console.error('Gagal mengirim data:', result.error || response.statusText);
          }
        } catch (error) {
          console.error('Error membaca file Excel atau mengirim data:', error);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };
  const [mapel, setMapel] = useState<Mapel[]>([]);
  const [mapelData, setMapelData] = useState<Mapel>({
    id_mapel: "",
    id_admin: "",
    nama_mapel: "",
  });
  const fetchMapel = async (): Promise<AxiosResponse<{ data: Mapel[] }>> => {
    const response = await axios.get(`${baseUrl}/mapel/all-mapel`);
    return response; // respons ini memiliki properti data
  };
  
  useEffect(() => {
    const loadMapel = async () => {
      const response = await fetchMapel();
      const data = response.data; // Mengakses data di dalam response
      setMapel(data.data); // Menyimpan data yang diperoleh ke dalam state
    };
    loadMapel();
  }, []);

  const mapelColumns = [
    // { header: "ID Admin", accessor: "id_admin" as keyof Mapel },
    { header: "Mapel", accessor: "nama_mapel" as keyof Mapel },
    {
      header: "Aksi",
      Cell: ({ row }: { row: Mapel }) => {
        return (
          <div>
            <button
              className="px-4 py-2 rounded"
              onClick={() => {
                if (row.id_mapel) {  // Pastikan id_mapel tidak null atau undefined
                  handleToggleDropdown(row.id_mapel);
                }
              }}
            >
              &#8942; {/* Simbol menu */}
            </button>
            {openDropdownId === row.id_mapel && ( // Hanya tampilkan dropdown jika id_mapel sesuai
              <div className="absolute mt-2 w-48 bg-white border rounded shadow-md">
                <button
                  onClick={() => handleEditClick(row)}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(row)}
                  className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-200"
                >
                  Hapus
                </button>
                <button
                  onClick={() => handleDetailClick(row)}
                  className="block px-4 py-2"
                >
                  Detail
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];
  // Mengambil data admins dari API
  useEffect(() => {
    const fetchAdmin = async () => {
    try{
      const response = await axios.get(`${baseUrl}/admin/all-Admin`); // Ganti dengan endpoint Anda
      console.log("admin", response);
      setAdmins(response.data.data); // Simpan semua admin ke dalam state
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
    };
    fetchAdmin();
  }, []);
  useEffect(() => {
    if (idAdmin) {
      setMapelData((prevData) => ({
        ...prevData,
        id_admin: idAdmin,
      }));
    }
  }, [idAdmin]);

  const handleDetailClick = (row: Mapel) => {
    const admin = admins.find(admin => admin.id_admin === String(row.id_admin)); // Ubah row.id_admin menjadi number
    console.log("id admin", admin)
    const namaAdmin = admin ? admin.nama_admin : "Tidak ada"; // Jika ditemukan, ambil nama_admin
    console.log("iki admin", namaAdmin)
    Swal.fire({
      html: `
        <div style="text-align: center;">
          <p>Mata pelajaran: ${JSON.stringify(row.nama_mapel) || "Tidak ada"}</p>
          <p>Ditambah oleh: ${namaAdmin  || "Tidak ada"}</p>
        </div>
      `,
      icon: "info",
      iconColor: "#009688",
      confirmButtonText: "Tutup",
      width: "400px", // Mengatur lebar popup agar lebih kecil
      confirmButtonColor: "#38b2ac", // Mengatur warna tombol OK (gunakan kode warna yang diinginkan)
    });
    setOpenDropdownId(null); // Tutup dropdown setelah melihat detail
  };
  const handleToggleDropdown = (id_mapel: string) => {
    setOpenDropdownId(openDropdownId === id_mapel ? null : id_mapel); // Toggle dropdown
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMapelData({
      ...mapelData,
      [name]: value,
    });
  };
  const handleMapelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validasi: Pastikan field tidak kosong
    if (!mapelData.nama_mapel) {
      toast.error("Data mapel tidak boleh kosong");
      return;
    }

    try {
      const response = await addMapel(mapelData);
      console.log("API response:", response);
      if (response.exists) {
        toast.error("Mapel sudah ada!");
      } else {
        toast.success("Mapel berhasil ditambahkan!");
        setMapel((prev) => [...prev, response.data]);
        setMapelData({
          id_mapel:"",
          id_admin: "",
          nama_mapel: "",
        });
      }
    } catch (error) {
      console.error("Error adding mapel:", error);
      toast.error("Terjadi kesalahan saat menambah mapel");
    }
  };
  const handleDeleteClick = (row: Mapel) => {
    setSelectedRow(row); // Simpan data yang ingin dihapus
    setIsConfirmOpen(true); // Buka modal
  };
  const handleConfirmDelete = async () => {
    
    try {
      // Panggil fungsi delete Mapel untuk menghapus di backend
      await deleteMapel(selectedRow!.id_mapel!);

      // Setelah sukses, update state di frontend
      setMapel((prevMapel) =>
        prevMapel.filter((mapel) => mapel.id_mapel !== selectedRow!.id_mapel)
      );
      toast.success(`Mapel ${selectedRow!.nama_mapel} berhasil dihapus`);
      setIsConfirmOpen(false); // Tutup modal
      setSelectedRow(null); // Reset selectedRow
    } catch (error) {
      console.error("Error deleting Mapel:", error);
      toast.error("Gagal menghapus Mapel");
    }
  };
  const handleCancel = () => {
    setIsConfirmOpen(false); // Tutup modal tanpa hapus
    setSelectedRow(null); // Reset selectedRow
  };
  // Fungsi untuk handle klik edit
  const handleEditClick = (row: Mapel) => {
    setEditData(row); // Set data yang dipilih ke form edit
    setIsModalOpen(true); // Buka modal saat tombol edit diklik
  };
  // Handle perubahan input pada form edit
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData((prev) => {
      if (!prev) {
        // Jika prev adalah null, buat objek baru yang sesuai dengan tipe Mapel
        return {
          id_mapel: "",
          id_admin: "",
          nama_mapel: "",
          [e.target.name]: e.target.value,
        };
      }
  
      // Jika prev ada, perbarui properti yang diubah
      return { ...prev, [e.target.name]: e.target.value };
    });
  };
  
  // Handle update data setelah form edit disubmit
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editData) {
      // Validasi nama mapel
      if (!editData.nama_mapel || editData.nama_mapel.trim() === "") {
        setIsMapelValid(false);
        return;
      }
  
      // Pastikan id_mapel tidak null
      if (!editData.id_mapel) {
        toast.error("ID Mapel tidak valid");
        return;
      }

      try {
        await editMapel(editData.id_mapel, editData);
        setMapel((prev) =>
          prev.map((mapel) =>
            mapel.id_mapel === editData.id_mapel ? { ...mapel, ...editData} : mapel
          )
        );
        toast.success("Data berhasil diperbarui!");
        setIsModalOpen(false); // Tutup modal setelah sukses
        setOpenDropdownId(null); // Menutup dropdown setelah edit
      } catch (error) {
        toast.error("Terjadi kesalahan saat mengedit data");
      }
    }
  };

//tombol untuk filter, pindah halaman, search dan reset
const [itemsPerPage, setItemsPerPage] = useState(5); // Default value is 5
const [currentPage, setCurrentPage] = useState(1);

const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setItemsPerPage(Number(e.target.value));
  setCurrentPage(1); //  Reset ke halaman pertama saat jumlah item per halaman berubah
};

// Memfilter data berdasarkan searchTerm
const filteredData = mapel.filter((item) => {
  // Asumsikan 'kelas' memiliki properti 'kelas' untuk dicari
  return item.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase());
  // item.id_admin.toLowerCase().includes(searchTerm.toLowerCase())
});

 // Fungsi untuk mengurutkan data berdasarkan nama secara alfabetis
 const sortedData = [...filteredData].sort((a, b) => {
  if (a.nama_mapel < b.nama_mapel) return -1; // Urutkan dari A ke Z
  if (a.nama_mapel > b.nama_mapel) return 1;
  return 0;
});

// Menghitung pagination
const totalData = sortedData.length; // Total item setelah difilter
const startIndex = (currentPage - 1) * itemsPerPage; // Indeks awal untuk pagination
const paginatedData = sortedData.slice(
  startIndex,
  startIndex + itemsPerPage
); // Data yang akan ditampilkan
const totalPages = Math.ceil(totalData / itemsPerPage); // Total halaman

const handlePageChange = (newPage: number) => {
  setCurrentPage(newPage);
};

// Fungsi untuk mengatur ulang pencarian
const handleResetClick = () => {
  setSearchTerm(""); // Reset search term
  setCurrentPage(1); // Reset ke halaman pertama
};

const isResettable = searchTerm.length > 0; // Tombol reset aktif jika ada input pencarian

  return (
    <>
      <div className="rounded-lg max-w-full bg-slate-100">
        <div className="pt-8 ml-7">
          <h1 className="text-2xl font-bold">Mapel</h1>
          <nav>
            <ol className="flex space-x-2 text-sm text-gray-700">
              <li>
                <a
                  href="index.html"
                  className="text-teal-500 hover:underline hover:text-teal-600"
                >
                  Home
                </a>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li>
                <a
                  href="#"
                  className="text-teal-500 hover:text-teal-600 hover:underline"
                >
                  Master Data
                </a>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li>
                <a
                  href="#"
                  className="text-teal-500 hover:text-teal-600 hover:underline"
                >
                  Guru
                </a>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li className="text-gray-500">Mapel</li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Column 1: Input */}
          <div className="w-full lg:w-1/3 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border">
            <form
              onSubmit={handleMapelSubmit}
              className=""
            >
              <h2 className="text-sm mb-2 sm:text-sm font-bold">Mapel</h2>
              <input
                type="text"
                name="nama_mapel"
                value={mapelData.nama_mapel}
                onChange={handleChange}
                className=" w-full p-2 border rounded text-sm sm:text-base mb-2"
                placeholder="Mapel..."
              />
              <div className="mt-4">
                {/* Tombol Simpan */}
                <div className="flex justify-end m-4 space-x-2">
                  <button
                    type="submit"
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-teal-400 hover:bg-teal-500 text-white items-end-end rounded text-sm sm:text-base"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>
            {/* Tombol Unduh Format dan Upload File */}
            <div className="absolute -mt-14">
              <button
                onClick={handleDownloadFormatClick}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 border-slate-500 text-white rounded text-sm sm:text-base"
              >
                Unduh Format
              </button>
              <button
                onClick={handleUploadFileClick}
                className="px-4 py-2 lg:ml-2 md:ml-2 bg-rose-600 hover:bg-rose-700 border-teal-400 text-white rounded text-sm sm:text-base pr-10 mt-1 text-center"
              >
                Upload File
              </button>
              {/* Input file yang disembunyikan */}
              <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
            </div>
          </div>
            <ToastContainer className="mt-14" />
          </div>

          {/* Column 2: Table */}
          <div className="w-full  lg:w-2/3 p-4 lg:p-6">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border">
              <div className="bg-slate-600 px-2 rounded-xl">
                <div className="flex flex-col lg:flex-row justify-between mb-4">
                  <div className="p-2">
                    <h2 className="text-sm pt-3 sm:text-2xl text-white font-bold">
                      Tabel Mapel
                    </h2>
                  </div>
                </div>
                {/* Filter Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mt-4">
                  <div className="lg:flex-row justify-between items-center">
                    <div className=" items-center lg:mb-0 space-x-2 mb-3 lg:order-1">
                      <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                  </div>

                  <div className=" items-center lg:mb-0 space-x-2 lg:order-1">
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                    />
                  </div>
                  <div className=" items-center lg:mb-0 space-x-2 lg:order-1">
                    <button
                      onClick={handleResetClick}
                      disabled={!isResettable}
                      className={`w-full p-2 rounded text-sm sm:text-base transition z-20 ${
                        isResettable
                          ? "text-white bg-red-500 hover:bg-red-600 cursor-pointer"
                          : "text-gray-400 bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <p>Reset</p>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <DataTable
                    columns={mapelColumns as { header: string; accessor: keyof Mapel; Cell?: ({ row }: { row: Mapel }) => JSX.Element; }[]}
                    data={paginatedData}
                    // onEdit={handleEdit}
                    // onDelete={handleDelete}
                  />
                  {isModalOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded p-4 shadow-lg">
                          <h3 className="pb-2">Edit Data Kelas</h3>
                          <form onSubmit={handleEditSubmit}>
                            <input
                              type="text"
                              name="nama_mapel"
                              value={editData ? editData.nama_mapel : ""}
                              onChange={handleEditChange}
                              className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                              placeholder="Mapel..."
                            />
                            <button type="submit" className="py-2 sm:px-4 sm:py-2 bg-teal-400 hover:bg-teal-500 text-white rounded text-sm sm:text-base">Edit</button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsModalOpen(false); // Tutup modal
                                setOpenDropdownId(null); // Tutup dropdown juga
                              }}
                              className="ml-2 py-2 sm:px-4 sm:py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm sm:text-base"
                            >
                              Tutup
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  {isConfirmOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow-md">
                          <p>Apakah kamu yakin ingin menghapus item ini?</p>
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={handleCancel}
                              className="px-4 py-2 mr-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              Batal
                            </button>
                            <button
                              onClick={handleConfirmDelete}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm  text-white">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex overflow-hidden m-4 space-x-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`px-2 py-1 border rounded ${
                        currentPage === 1
                          ? "bg-gray-300"
                          : "bg-teal-400 hover:bg-teal-600 text-white"
                      }  `}
                    >
                      Previous
                    </button>
                    <button
                      disabled={
                        currentPage === totalPages || paginatedData.length === 0
                      } // Disable tombol 'Next' jika sudah di halaman terakhir atau tidak ada data yang ditampilkan
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`px-2 py-1 border rounded ${
                        currentPage === totalPages
                          ? "bg-gray-300"
                          : "bg-teal-400 hover:bg-teal-600 text-white"
                      }  `}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
} // Komponen DropdownMenu yang menampilkan menu aksi untuk setiap item dalam tabel.
// isOpen: Properti boolean yang menentukan apakah menu dropdown saat ini terbuka.
// onClick: Fungsi callback yang dipanggil saat tombol dropdown diklik, untuk membuka atau menutup menu.
// onDelete: Fungsi callback yang dipanggil saat opsi 'Hapus' dipilih dari menu dropdown.
// function DropdownMenu({ isOpen, onClick, onEdit, onDelete, onClose }) {
//   const dropdownRef = useRef(null);

//   // Fungsi untuk menutup dropdown saat pengguna mengklik di luar dropdown.
//   const handleClickOutside = (event) => {
//     console.log("Clicked outside"); // Debugging
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       console.log("Outside detected"); // Debugging
//       if (typeof onClick === "function") {
//         onClick(); // Memanggil fungsi onClose untuk menutup dropdown
//       }
//     }
//   };

//   useEffect(() => {
//     console.log("Effect ran", isOpen); // Debugging
//     // Menambahkan event listener untuk menangani klik di luar dropdown jika dropdown terbuka.
//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       // Menghapus event listener ketika dropdown ditutup.
//       document.removeEventListener("mousedown", handleClickOutside);
//     }

//     // Cleanup function untuk menghapus event listener saat komponen di-unmount atau isOpen berubah.
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       console.log("Cleanup"); // Debugging
//     };
//   }, [isOpen]);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={onClick}
//         className="p-1 z-40  text-white text-xs sm:text-sm"
//       >
//         &#8942;
//       </button>
//       {isOpen && (
//         <div
//           className="absolute z-50 mt-1 w-24 sm:w-32 bg-slate-600 border rounded-md shadow-lg"
//           style={{ left: "-62px", top: "20px" }} // Menggeser dropdown ke kiri
//         >
//           <button
//             className="block w-full px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm hover:bg-slate-500"
//             onClick={() => {
//               alert("Detail clicked");
//               if (typeof onClose === "function") {
//                 onClose(); // Menutup dropdown setelah detail diklik
//               }
//             }}
//           >
//             Detail
//           </button>
//           <button
//             onClick={() => {
//               onEdit();
//               if (typeof onClose === "function") {
//                 onClose(); // Menutup dropdown setelah edit diklik
//               }
//             }}
//             className="block w-full px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm hover:bg-slate-500"
//           >
//             Edit
//           </button>
//           <button
//             onClick={() => {
//               onDelete();
//               if (typeof onClose === "function") {
//                 onClose(); // Menutup dropdown setelah delete diklik
//               }
//             }}
//             className="block w-full px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm hover:bg-slate-500"
//           >
//             Hapus
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function FileUpload() {
//   const [file, setFile] = useState(null);
//   const fileInputRef = useRef(null);

//   const handleFileChange = (event) => {
//     const selectedFile = event.target.files[0];
//     setFile(selectedFile);
//   };

//   const handleClearFile = () => {
//     setFile(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ""; // Reset input file
//     }
//   };

//   return (
//     <div>
//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileChange}
//         className="w-full border border-gray-300 rounded-lg px-3 py-2"
//       />
//       {file && (
//         <img
//           src={URL.createObjectURL(file)}
//           alt="Preview"
//           className="w-full border border-gray-300 rounded-lg mt-4"
//         />
//       )}
//       <button onClick={handleClearFile}>Clear File</button>
//     </div>
//   );
// }
