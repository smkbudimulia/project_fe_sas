"use client";
import DataTable from "../../../components/dataTabel";
import React, { useState, useEffect, useRef } from "react";
import {
  addSiswa,
  fetchSiswa,
  deleteSiswa,
  updateSiswa,
  Siswa,
} from "../../../api/siswa";
import {
  addRombel,
  fetchRombel,
  deleteRombel,
  updateRombel,
  Rombel,
} from "../../../api/rombel";
import {
  addKelas,
  fetchKelas,
  deleteKelas,
  updateKelas,
  Kelas,
} from "../../../api/kelas";
import {
  addTahunAjaran,
  fetchTahunAjaran,
  TahunAjaran,
} from "../../../api/tahunAjaran";

// function DropdownMenu({ isOpen, onClick, onEdit, onDelete, onClose }) {
//   const dropdownRef = useRef(null);

//   // Fungsi untuk menutup dropdown saat pengguna mengklik di luar dropdown.
//   const handleClickOutside = (event) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       if (typeof onClose === 'function') {
//         onClose();
//       }
//     }
//   };

//   useEffect(() => {
//     // Menambahkan event listener untuk menangani klik di luar dropdown jika dropdown terbuka.
//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     } else {
//       // Menghapus event listener ketika dropdown ditutup.
//       document.removeEventListener('mousedown', handleClickOutside);
//     }

//     // Cleanup function untuk menghapus event listener saat komponen di-unmount atau isOpen berubah.
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen]);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={onClick}
//         className="p-1 z-50 text-white text-xs sm:text-sm"
//       >
//         &#8942;
//       </button>
//       {isOpen && (
//         <div className="absolute z-50 mt-1 w-24 sm:w-32 bg-slate-600 border rounded-md shadow-lg">
//           <button
//             className="block w-full px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm hover:bg-slate-500"
//             onClick={() => {
//               alert('Detail clicked');
//               if (typeof onClose === 'function') {
//                 onClose(); // Menutup dropdown setelah detail diklik
//               }
//             }}
//           >
//             Detail
//           </button>
//           <button
//             onClick={() => {
//               onEdit();
//               if (typeof onClose === 'function') {
//                 onClose(); // Menutup dropdown setelah edit diklik
//               }
//             }}
//             className="block w-full px-2 py-1 sm:px-4 sm:py-2 text-xs text-green-600 sm:text-sm hover:bg-slate-500"
//           >
//             Edit
//           </button>
//           <button
//             onClick={() => {
//               onDelete();
//               if (typeof onClose === 'function') {
//                 onClose(); // Menutup dropdown setelah delete diklik
//               }
//             }}
//             className="block w-full px-2 py-1 sm:px-4 sm:py-2 text-xs text-red-600 sm:text-sm hover:bg-slate-500"
//           >
//             Hapus
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

type Item = {
  kelas: string;
  jurusan: string;
  walas: string;
  // properti lainnya jika ada
};

export default function DataRombel() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [tableData, setTableData] = useState<Siswa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [filterThn, setFilterThn] = useState("");
  const [filterWalas, setFilterWalas] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    visible: false,
    id: null,
  });
  const [editData, setEditData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // fields untuk DataTabel
  const rombelColumns = [
    { header: "Kelas", accessor: "id_kelas" },
    { header: "Jurusan", accessor: "id_rombel" },
    { header: "Tahun Ajaran", accessor: "id_tahun_pelajaran" },
    { header: "Jumlah siswa", accessor: "jumlah siswa" },
    { header: "Wali Kelas", accessor: "wali_kelas" },
    // {
    //   header: "Aksi",
    //   Cell: ({ row }: { row: Siswa }) => {
    //     return (
    //       <div>
    //         <button
    //           className="px-4 py-2 rounded"
    //           onClick={() => handleToggleDropdown(row.id_siswa)}
    //         >
    //           &#8942; {/* Simbol menu */}
    //         </button>
    //         {openDropdownId === row.id_siswa && ( // Hanya tampilkan dropdown jika id_siswa sesuai
    //           <div className="absolute -ml-64 mt-2 w-48 bg-white border rounded shadow-md">
    //             <button
    //               onClick={() => handleEditClick(row)}
    //               className="block w-full  px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
    //             >
    //               Edit
    //             </button>
    //             <button
    //               onClick={() => handleDeleteClickk(row)}
    //               className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-200"
    //             >
    //               Hapus
    //             </button>
    //             <button
    //               onClick={() => handleDetailClick(row)}
    //               className="block px-4 py-2"
    //             >
    //               Detail
    //             </button>
    //           </div>
    //         )}
    //       </div>
    //     );
    //   },
    // },
  ];

  // useEffect(() => {
  //   const storedJurusan = localStorage.getItem('tableDataJurusan');

  //   // Pastikan data ada di localStorage dan mengonversinya menjadi array
  //   if (storedJurusan) {
  //     // Jika data berupa array objek, pastikan akses nilai `jurusan` di setiap objek
  //     const parsedData = JSON.parse(storedJurusan);
  //     const jurusanList = parsedData.map((item) => item.jurusan); // Mengambil hanya properti `jurusan`
  //     setJurusanOptions(jurusanList);
  //   }
  // }, []);

  //  // useEffect to monitor changes and update isResettable
  //  useEffect(() => {
  //   const savedData = JSON.parse(localStorage.getItem("tableDataKelas")) || [];
  //   setTableData(savedData);
  //   if (filterKelas || filterJurusan || filterThn || searchTerm) {
  //     setIsResettable(true);
  //   } else {
  //     setIsResettable(false);
  //   }
  // }, [filterKelas, filterJurusan, filterThn, searchTerm]);

  // useEffect(() => {
  //   const savedData = JSON.parse(localStorage.getItem("tableDataKelas")) || [];
  //   setTableData(savedData);
  // }, []);

  //tombol untuk filter, pindah halaman, search dan reset
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default value is 5
  const [currentPage, setCurrentPage] = useState(1);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); //  Reset ke halaman pertama saat jumlah item per halaman berubah
  };

  // Memfilter data berdasarkan searchTerm
  const filteredData = tableData.filter((item) => {
    return (
      item.nis?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      "" ||
      (item.nama_siswa
        ? item.nama_siswa
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : false) ||
      (item.jenis_kelamin
        ? item.jenis_kelamin.toLowerCase().includes(searchTerm.toLowerCase())
        : false) ||
      (item.id_kelas
        ? item.id_kelas
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : false) ||
      (item.id_rombel
        ? item.id_rombel
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : false)
    );
  });

  // Menghitung pagination
  const totalData = filteredData.length; // Total item setelah difilter
  const startIndex = (currentPage - 1) * itemsPerPage; // Indeks awal untuk pagination
  const paginatedData = filteredData.slice(
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

  const isResettable = searchTerm.length > 0;

  const handleCloseClick = () => {
    setSelectedItem(null);
  };

  return (
    <>
      <div className="rounded-lg max-w-full bg-slate-100">
        <div className="pt-8 ml-7">
          <h1 className="text-2xl font-bold">Rombel</h1>
          <nav>
            <ol className="flex space-x-2 text-sm text-gray-700">
              <li>
                <a href="index.html" className="text-teal-500 hover:underline">
                  Home
                </a>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li>
                <a href="#" className="text-teal-500 hover:underline">
                  Master Data
                </a>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li>
                <a href="#" className="text-teal-500 hover:underline">
                  Siswa
                </a>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li className="text-gray-500">Rombel</li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 p-4 lg:p-6">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border">
              <div className="bg-slate-600 p-4 rounded-lg">
                <div className="bg-slate-600 px-2 rounded-xl">
                  <div className="flex flex-col lg:flex-row justify-between mb-4">
                    <div className="p-2">
                      <h2 className="text-xl sm:text-2xl text-white font-bold">
                        Tabel Kelas
                      </h2>
                    </div>
                    {/* <div className="flex lg:flex-row justify-between p-2 items-center">
                  <div className="flex items-center pt-2 mb-2 lg:mb-0 space-x-2 lg:order-1">
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="p-2 border border-gray-300 rounded-r-xl rounded-l-xl text-sm sm:text-base"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  
                </div> */}
                  </div>
                </div>
                {/* Filter Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mt-4">
                  <div className="lg:flex-row justify-between items-center">
                    <div className=" items-center lg:mb-0 space-x-2 lg:order-1">
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
                  {/* <div>
                <label htmlFor="filterKelas" className="block text-sm font-medium text-gray-700">
                  {/* Filter Kelas 
                </label>
                <select
                    id="filterKelas"
                    value={filterKelas}
                    onChange={handleFilterChange(setFilterKelas)}
                    className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                >
                  <option value="">Semua Kelas</option>
                  {kelasOptions.map((kelas, index) => (
                    <option key={index} value={kelas}>
                      {kelas}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filterJurusan" className="block text-sm font-medium text-gray-700">
                  {/* Filter Jurusan 
                </label>
                <select
                  id="filterJurusan"
                  value={filterJurusan}
                  onChange={handleFilterChange(setFilterJurusan)}
                  className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                >
                  <option value="">Semua Jurusan</option>
                  {jurusanOptions.map((jurusan, index) => (
                    <option key={index} value={jurusan}>
                      {jurusan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filterThn" className="block text-sm font-medium text-gray-700">
                  {/* Filter Tahun Ajaran 
                </label>
                <select
                  id="filterThn"
                  value={filterThn}
                  onChange={handleFilterChange(setFilterThn)}
                  className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                >
                  <option value="">Semua Tahun Ajaran</option>
                  {thnOptions.map((thn, index) => (
                    <option key={index} value={thn}>
                      {thn}
                    </option>
                  ))}
                </select>
              </div> */}

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
                      className={`w-full p-2 rounded text-sm sm:text-base transition   ${
                        isResettable
                          ? "text-white bg-red-500 hover:bg-red-600 cursor-pointer"
                          : "text-gray-400 bg-gray-300 cursor-not-allowed"
                      } overflow-hidden`}
                    >
                      <p className="">Reset</p>
                    </button>
                  </div>
                </div>

                {/* Tabel */}
                <div className="overflow-x-auto">
                  <DataTable
                    columns={
                      rombelColumns as {
                        header: string;
                        accessor: keyof Siswa;
                        Cell?: ({ row }: { row: Siswa }) => JSX.Element;
                      }[]
                    }
                    data={paginatedData}
                  />
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-white">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 border rounded ${
                        currentPage === 1
                          ? "bg-gray-300"
                          : "bg-teal-400 text-white"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-2 py-1 border rounded ${
                        currentPage === totalPages
                          ? "bg-gray-300"
                          : "bg-teal-400 text-white"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* tabel inputan */}

          <div className="w-full lg:w-1/2 p-4 lg:p-6">
            <div className="rounded-lg shadow-md p-4 lg:p-6 border">
              <h2 className="text-lg font-bold pl-4">Detail siswa</h2>
              {selectedItem && (
                <div
                  className={`mt-4 p-4 bg-gray-100 transition-all duration-500 ease-in-out transform ${
                    selectedItem
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <h2 className="text-lg font-bold">
                    Kelas {selectedItem.kelas} {selectedItem.jurusan}{" "}
                    {selectedItem.walas}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full mt-4 border-collapse">
                      <thead>
                        <tr className="bg-slate-500 text-white">
                          <th className="p-2 text-left text-sm sm:text-xs rounded-l-lg">
                            No
                          </th>
                          <th className="p-2 text-left text-sm sm:text-xs rounded-r-lg">
                            Nama
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-slate-100 text-black">
                          <td className="p-2 border-b text-sm sm:text-xs">1</td>
                          <td className="p-2 border-b text-sm sm:text-xs">
                            salim
                          </td>
                        </tr>
                        <tr className="bg-slate-100 text-black">
                          <td className="p-2 border-b text-sm sm:text-xs">2</td>
                          <td className="p-2 border-b text-sm sm:text-xs">
                            aziz
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={handleCloseClick}
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
