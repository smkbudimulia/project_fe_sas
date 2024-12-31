"use client";
import { useState, useEffect, useRef } from "react";
import DataTable from "../../../components/dataTabel";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import { useRouter } from "next/navigation";
import {
  addKelas,
  fetchKelas,
  deleteKelas,
  updateKelas,
  Kelas,
} from "../../../api/kelas";
import useUserInfo from "@/app/components/useUserInfo";
import Swal from "sweetalert2";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function _Kelas() {
  const [filterKelas, setFilterKelas] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [isJurusanValid, setIsJurusanValid] = useState(true);
  const router = useRouter();
  const [admins, setAdmins] = useState<
    { id_admin: string; nama_admin: string }[]
  >([]);
  const [isKelasValid, setIsKelasValid] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [editData, setEditData] = useState<Kelas | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // Menyimpan ID baris yang dropdown-nya terbuka
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk mengontrol modal
  const [selectedRow, setSelectedRow] = useState<Kelas | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { namaAdmin, status, idAdmin } = useUserInfo();

  // Fungsi untuk mendapatkan data
  const fetchKelas = async (): Promise<AxiosResponse<{ data: Kelas[] }>> => {
    const response = await axios.get(`${baseUrl}/kelas/all-kelas`);
    return response; // respons ini memiliki properti data
  };
  useEffect(() => {
    //   const token = Cookies.get('token');
    //   console.log(token)
    // if (!token) {
    //   router.push('../../../login');
    //   return;
    // }

    // axios.defaults.headers.common['Authorization'] = token;
    const loadKelas = async () => {
      const response = await fetchKelas();
      console.log("API Kelas:", response); // Debugging tambahan
      const data = response.data;
      setKelas(data.data);
    };
    loadKelas();
  }, []);

  // useEffect(() => {
  //   //   const token = Cookies.get('token');
  //   //   console.log(token)
  //   // if (!token) {
  //   //   router.push('../../../login');
  //   //   return;
  //   // }

  //   // axios.defaults.headers.common['Authorization'] = token;
  //   const loadKelas = async () => {
  //     const response = await fetchKelas();
  //     console.log("API Kelas:", response); // Debugging tambahan
  //     const data = response.data;
  //     setKelas(data);
  //   };
  //   loadKelas();
  // }, []);

  // Mengambil data admins dari API
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
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
      setKelasData((prevData) => ({
        ...prevData,
        id_admin: idAdmin,
      }));
    }
  }, [idAdmin]);

  const handleDetailClick = (row: Kelas) => {
    const admin = admins.find((admin) => admin.id_admin === row.id_admin); // Cari admin berdasarkan id_admin
    console.log("id admin", admin);
    const namaAdmin = admin ? admin.nama_admin : "Tidak ada"; // Jika ditemukan, ambil nama_admin
    console.log("iki admin", namaAdmin);
    Swal.fire({
      html: `
        <div style="text-align: center;">
          <p>Kelas: ${JSON.stringify(row.kelas) || "Tidak ada"}</p>
          <p>Ditambah oleh: ${namaAdmin || "Tidak ada"}</p>
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

  const handleToggleDropdown = (id_kelas: string) => {
    setOpenDropdownId(openDropdownId === id_kelas ? null : id_kelas); // Toggle dropdown
  };

  const [kelasData, setKelasData] = useState({
    id_kelas: "",
    id_admin: idAdmin || "",
    kelas: "",
  });

  const handleKelasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKelasData({
      ...kelasData,
      [name]: value,
    });
  };
  //handle menambah data
  const handleKelasSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validasi: Pastikan semua field tidak kosong
    if (!kelasData.kelas) {
      toast.error("Data kelas tidak boleh kosong");
      return;
    }

    try {
      const response = await addKelas(kelasData);
      console.log("API response:", response);
      // Cek status respon
      if (response?.data?.exists) {
        // Gantilah dengan logika yang sesuai
        toast.error("Data sudah ada!"); // Menampilkan pesan jika data sudah ada
      } else {
        toast.success("Tahun kelas berhasil ditambahkan!"); // Menampilkan pesan sukses
        // Tambahkan kelas baru ke dalam kelasList
        setKelas((prevKelasList) => [...prevKelasList, response.data]);

        // Reset form
        setKelasData({
          id_kelas: "",
          id_admin: idAdmin,
          kelas: "",
        });
      }
    } catch (error) {
      // Tangani kesalahan di sini
      console.error("Error adding kelas:", error);

      // Cek apakah error berasal dari response API
      if (error instanceof AxiosError) {
        // Memeriksa apakah error adalah AxiosError
        if (error.response) {
          // Mengakses error.response jika ada
          toast.error(
            "Terjadi kesalahan saat menambah kelas: " +
              error.response.data.message
          );
        } else {
          toast.error("Terjadi kesalahan pada server");
        }
      } else {
        // Jika error bukan AxiosError, tangani error umum lainnya
        toast.error("Terjadi kesalahan saat menambah kelas");
      }
    }
  };
  const handleDeleteClickk = (row: Kelas) => {
    setSelectedRow(row); // Simpan data yang ingin dihapus
    setIsConfirmOpen(true); // Buka modal
  };
  //handle hapus
  const handleConfirmDelete = async () => {
    try {
      // Panggil fungsi delete kelas untuk menghapus di backend
      if (selectedRow) {
        await deleteKelas(selectedRow.id_kelas);
      } else {
        console.error("No row is selected");
      }

      // Setelah sukses, update state di frontend
      if (selectedRow !== null) {
        setKelas((prevKelas) =>
          prevKelas.filter(
            (rombel) => rombel.id_kelas !== selectedRow.id_kelas
          )
        );
      }
      toast.success(`Kelas ${selectedRow?.kelas} berhasil dihapus`);
      setIsConfirmOpen(false); // Tutup modal
      setSelectedRow(null); // Reset selectedRow
    } catch (error) {
      console.error("Error deleting kelas:", error);
      toast.error("Gagal menghapus kelas");
    }
  };
  const handleCancel = () => {
    setIsConfirmOpen(false); // Tutup modal tanpa hapus
    setSelectedRow(null); // Reset selectedRow
  };
  // Fungsi untuk handle klik edit
  const handleEditClick = (row: Kelas) => {
    setEditData(row); // Set data yang dipilih ke form edit
    setIsModalOpen(true); // Buka modal saat tombol edit diklik
  };
  // Handle perubahan input pada form edit
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData((prev) => {
      if (prev) {
        // Pastikan prev tidak null
        return { ...prev, [e.target.name]: e.target.value };
      }
      return prev; // Kembalikan prev jika null
    });
  };
  // Handle update data setelah form edit disubmit
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editData) {
      // Validasi sebelum mengupdate
      if (editData.kelas.trim() === "") {
        setIsKelasValid(false);
        return;
      }

      // Cek apakah ada perubahan
      const existingKelas = kelas.find(
        (kelas) => kelas.id_kelas === editData.id_kelas
      );
      if (
        existingKelas &&
        JSON.stringify(existingKelas) === JSON.stringify(editData)
      ) {
        toast.error("Tidak ada perubahan data yang dilakukan.");
        return;
      }

      try {
        await updateKelas(editData.id_kelas, editData);
        setKelas((prev) =>
          prev.map((kelas) =>
            kelas.id_kelas === editData.id_kelas
              ? { ...kelas, ...editData }
              : kelas
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKelasIds, setSelectedKelasIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  // Fungsi untuk menampilkan modal konfirmasi
  const showDeleteModal = () => {
    setIsDeleteModalOpen(true); // Menampilkan modal
  };

  const confirmDelete = async () => {
    if (selectedKelasIds.length === 0) {
      toast.error("Pilih kelas yang ingin dihapus!");
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      // Panggil fungsi backend untuk menghapus siswa yang dipilih
      await Promise.all(
        selectedKelasIds.map(async (id_kelas) => {
          await deleteKelas(id_kelas); // Pastikan deleteSiswa adalah fungsi yang memanggil API backend untuk menghapus data
        })
      );

      // Setelah sukses, update state di frontend
      setKelas((prevKelas) => {
        const updatedKelas = prevKelas.filter(
          (kelas) => !selectedKelasIds.includes(kelas.id_kelas)
        );

        // Periksa apakah data di halaman saat ini masih cukup, jika tidak arahkan ke halaman sebelumnya
        const totalItems = updatedKelas.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Jika currentPage melebihi total halaman baru, arahkan ke halaman sebelumnya
        if (currentPage > totalPages) {
          setCurrentPage(totalPages > 0 ? totalPages : 1); // Pastikan tidak mengarahkan ke halaman 0
        }

        return updatedKelas;
      });

      toast.success("Kelas yang dipilih berhasil dihapus");
      setSelectedKelasIds([]);
      setSelectAll(false); // Reset checkbox "Select All"
      setIsDeleteModalOpen(false); // Reset selectedSiswa setelah penghapusan
    } catch (error) {
      console.error("Error deleting kelas:", error);
      toast.error("Gagal menghapus kelas");
    }
  };

  // Fungsi untuk membatalkan penghapusan
  const cancelDelete = () => {
    setIsDeleteModalOpen(false); // Tutup modal tanpa melakukan apa-apa
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedKelasIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((kelasId) => kelasId !== id)
        : [...prevSelected, id]
    );
  };
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allIds = kelas.map((kelas) => kelas.id_kelas);
      setSelectedKelasIds(allIds);
    } else {
      setSelectedKelasIds([]);
    }
  };

  const kelasColumns = [
    //adalah istilah yang digunakan dalam konteks tabel, terutama saat menggunakan pustaka seperti React Table, untuk menunjukkan kunci atau nama properti dalam data yang akan diambil dan ditampilkan di kolom tabel tertentu
    // { header: "No", accessor: (_: any, index: number) => index + 1 },
    // { header: "Admin", accessor: "id_admin" as keyof Kelas },
    { header: "Kelas", accessor: "kelas" as keyof Kelas },
    {
      header: "Aksi",
      Cell: ({ row }: { row: Kelas }) => {
        return (
          <div>
            <button
              className="px-4 py-2 rounded"
              onClick={() => handleToggleDropdown(row.id_kelas)}
            >
              &#8942; {/* Simbol menu */}
            </button>
            {openDropdownId === row.id_kelas && ( // Hanya tampilkan dropdown jika id_kelas sesuai
              <div className="absolute mt-2 w-48 bg-white border rounded shadow-md">
                <button
                  onClick={() => handleEditClick(row)}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClickk(row)}
                  className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-200"
                >
                  Hapus
                </button>
                <button
                  onClick={() => handleDetailClick(row)}
                  className="block w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-gray-200"
                >
                  Detail
                </button>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
      ),
      accessor: "select",
      Cell: ({ row }: { row: Kelas }) => (
        <input
          type="checkbox"
          checked={selectedKelasIds.includes(row.id_kelas)}
          onChange={() => handleCheckboxChange(row.id_kelas)}
        />
      ),
    },
  ];

  //tombol untuk filter, pindah halaman, search dan reset
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default value is 5
  const [currentPage, setCurrentPage] = useState(1);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target && e.target.value) {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1); // Reset ke halaman pertama saat jumlah item per halaman berubah
    } else {
      console.error('e.target atau e.target.value tidak tersedia');
    }
  };
  

  // Memfilter data berdasarkan searchTerm
  const filteredData = kelas.filter((item) => {
    // Asumsikan 'kelas' memiliki properti 'kelas' untuk dicari
    return item.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    // item.id_admin.toLowerCase().includes(searchTerm.toLowerCase())
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (a.kelas < b.kelas) return -1;
    if (a.kelas > b.kelas) return 1;
    return 0;
  });

  // Menghitung pagination
  const totalData = sortedData.length; // Total item setelah difilter
  const startIndex = (currentPage - 1) * itemsPerPage; // Indeks awal untuk pagination
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage); // Data yang akan ditampilkan
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
          <h1 className="text-2xl font-bold">Kelas</h1>
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
                  Akademik
                </a>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li className="text-gray-500">Kelas</li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Column 1: Input */}
          <div className="w-full lg:w-1/2 p-4 lg:p-6">
            <form
              onSubmit={handleKelasSubmit}
              className="bg-white rounded-lg shadow-md p-4 lg:p-6 border"
            >
              <input
                name="id_kelas"
                value={kelasData.id_kelas}
                onChange={handleKelasChange}
                className="hidden"
              />
              <h2 className="text-sm mb-2 sm:text-sm font-bold"></h2>
              <input
                name="id_admin"
                value={kelasData.id_admin}
                onChange={handleKelasChange}
                className="hidden"
              />
              <h2 className="text-sm mb-2 sm:text-sm font-bold"> Kelas</h2>
              <input
                type="text"
                name="kelas"
                value={kelasData.kelas}
                onChange={handleKelasChange}
                className={`w-full p-2 border rounded text-sm sm:text-base mb-2 ${
                  isKelasValid ? "border-gray-300" : "border-red-500"
                }`}
                placeholder="Kelas..."
              />
              <div className="flex m-4 space-x-2">
                <button
                  type="submit"
                  className="ml-auto px-3 py-2 sm:px-4 sm:py-2 bg-teal-400 hover:bg-teal-500 text-white rounded text-sm sm:text-base"
                >
                  Simpan
                </button>
              </div>
            </form>
            <ToastContainer className="mt-14" />
          </div>

          {/* Column 2: Table */}
          <div className="w-full  lg:w-2/3 p-4 lg:p-6">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border">
              <div className="bg-slate-600 px-2 rounded-xl">
                <div className="flex flex-col lg:flex-row justify-between mb-4">
                  <div className="p-2">
                    <h2 className="text-sm pt-3 sm:text-2xl text-white font-bold">
                      Tabel Kelas
                    </h2>
                  </div>
                </div>
                {/* Filter Dropdown */}
                <div className="flex flex-wrap justify-start items-center w-full mt-4">
                  {/* Dropdown Items per Page */}
                  <div className="flex items-center">
                    <select
                      id="items-per-page"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="p-2 border border-gray-300 rounded text-sm sm:text-base"
                    >
                      <option value={1}>1</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>

                  {/* Input Search */}
                  <div className="flex items-center ml-3">
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                    />
                  </div>

                  {/* Tombol Reset */}
                  <div className="flex items-center mt-3 lg:mt-0 md:mt-0 lg:mb-0 space-x-2 lg:order-1 w-full lg:w-auto md:w-auto">
                    <button
                      onClick={handleResetClick}
                      disabled={!isResettable}
                      className={`w-full p-2 lg:ml-3 md:ml-3 rounded text-sm sm:text-base transition ${
                        isResettable
                          ? "text-white bg-red-500 hover:bg-red-600 cursor-pointer"
                          : "text-gray-400 bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Reset
                    </button>
                  </div>

                  {/* Tombol Hapus Siswa Terpilih */}
                  <div className="ml-3">
                    <button
                      onClick={showDeleteModal}
                      className="px-4 py-2 bg-red-600 text-white rounded text-base"
                    >
                      Hapus Siswa Terpilih
                    </button>

                    {/* Modal Konfirmasi Penghapusan */}
                    {isDeleteModalOpen && (
                      <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-md shadow-lg w-96">
                          <h3 className="text-lg font-semibold mb-4">
                            Konfirmasi Penghapusan
                          </h3>
                          <p className="mb-4">
                            Apakah Anda yakin ingin menghapus siswa yang
                            dipilih?
                          </p>
                          <div className="flex justify-between">
                            <button
                              onClick={cancelDelete}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                            >
                              Batal
                            </button>
                            <button
                              onClick={confirmDelete}
                              className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <div>
                    <DataTable
                      columns={kelasColumns as { header: string; accessor: keyof Kelas; Cell?: ({ row }: { row: Kelas }) => JSX.Element; }[]}
                      data={paginatedData}
                      // onEdit={handleEditClick}
                      // onDelete={handleDeleteClickk}
                    />
                    {isModalOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded p-4 shadow-lg">
                          <h3 className="pb-2">Edit Data Kelas</h3>
                          <form onSubmit={handleEditSubmit}>
                            <input
                              type="text"
                              name="kelas"
                              value={editData ? editData.kelas : ""}
                              onChange={handleEditChange}
                              className={`w-full p-2 border rounded text-sm sm:text-base mb-2 ${
                                isKelasValid
                                  ? "border-gray-300"
                                  : "border-red-500"
                              }`}
                              placeholder="Kelas..."
                            />
                            <button
                              type="submit"
                              className="py-2 sm:px-4 sm:py-2 bg-teal-400 hover:bg-teal-500 text-white rounded text-sm sm:text-base"
                            >
                              Edit
                            </button>
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
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-white">
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
          {/* Modal untuk konfirmasi penghapusan
        {confirmDelete.visible && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <p>Apakah Anda yakin ingin menghapus item ini?</p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleCancelDelete}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-300 text-black rounded text-sm sm:text-base mr-2"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded text-sm sm:text-base"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )} */}
          {/* Modal untuk mengedit data */}
          {/* {showEditModal && (
          <div className="fixed z-50 inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-sm pt-3 sm:text-2xl font-bold">Edit Data</h2>
             
              <input
                type="text"
                value={editKelasValue}
                onChange={(e) => setEditKelasValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base mb-2"
                placeholder="Kelas..."
              />
              <select
                value={editJurusanOptions}
                onChange={(e) => setEditJurusanOptions(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base mb-2"
              >
                <option value="">Pilih Jurusan...</option>
                {jurusanOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-300 text-black rounded text-sm sm:text-base mr-2"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-teal-400 text-white rounded text-sm sm:text-base"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )} */}
        </div>
      </div>
    </>
  );
} // Komponen DropdownMenu yang menampilkan menu aksi untuk setiap item dalam tabel.
// isOpen: Properti boolean yang menentukan apakah menu dropdown saat ini terbuka.
// onClick: Fungsi callback yang dipanggil saat tombol dropdown diklik, untuk membuka atau menutup menu.
// onDelete: Fungsi callback yang dipanggil saat opsi 'Hapus' dipilih dari menu dropdown.
// function DropdownMenu({ isOpen, onClick, onEdit, onDelete, onClose }) {
//     const dropdownRef = useRef(null);

//     // Fungsi untuk menutup dropdown saat pengguna mengklik di luar dropdown.
//     const handleClickOutside = (event) => {
//       console.log('Clicked outside'); // Debugging
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         console.log('Outside detected'); // Debugging
//         if (typeof onClick === 'function') {
//           onClick(); // Memanggil fungsi onClose untuk menutup dropdown
//         }
//       }
//     };

//     useEffect(() => {
//       console.log('Effect ran', isOpen); // Debugging
//       // Menambahkan event listener untuk menangani klik di luar dropdown jika dropdown terbuka.
//       if (isOpen) {
//         document.addEventListener('mousedown', handleClickOutside);
//       } else {
//         // Menghapus event listener ketika dropdown ditutup.
//         document.removeEventListener('mousedown', handleClickOutside);
//       }

//       // Cleanup function untuk menghapus event listener saat komponen di-unmount atau isOpen berubah.
//       return () => {
//         document.removeEventListener('mousedown', handleClickOutside);
//         console.log('Cleanup'); // Debugging
//       };
//     }, [isOpen]);

//     return (
//       <div className="relative" ref={dropdownRef}>
//         <button
//           onClick={onClick}
//           className="p-1 z-40  text-white text-xs sm:text-sm"

//         >
//           &#8942;
//         </button>
//         {isOpen && (
//           <div
//             className="absolute z-50 mt-1 w-24 sm:w-32 bg-slate-600 border rounded-md shadow-lg"
//             style={{ left: '-62px', top: '20px' }} // Menggeser dropdown ke kiri
//           >
//             <button
//               className="block w-full px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm hover:bg-slate-500"
//               onClick={() => {
//                 alert('Detail clicked');
//                 if (typeof onClose === 'function') {
//                   onClose(); // Menutup dropdown setelah detail diklik
//                 }
//               }}
//             >
//               Detail
//             </button>
//             <button
//               onClick={() => {
//                 onEdit();
//                 if (typeof onClose === 'function') {
//                   onClose(); // Menutup dropdown setelah edit diklik
//                 }
//               }}
//               className="block w-full px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm hover:bg-slate-500"
//             >
//               Edit
//             </button>
//             <button
//               onClick={() => {
//                 onDelete();
//                 if (typeof onClose === 'function') {
//                   onClose(); // Menutup dropdown setelah delete diklik
//                 }
//               }}
//               className="block w-full px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm hover:bg-slate-500"
//             >
//               Hapus
//             </button>
//           </div>
//         )}
//       </div>
//     );
// }

// function FileUpload() {
//     const [file, setFile] = useState(null);
//     const fileInputRef = useRef(null);

//     const handleFileChange = (event) => {
//       const selectedFile = event.target.files[0];
//       setFile(selectedFile);
//     };

//     const handleClearFile = () => {
//       setFile(null);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = ''; // Reset input file
//       }
//     };

//     return (
//       <div>
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileChange}
//           className="w-full border border-gray-300 rounded-lg px-3 py-2"
//         />
//         {file && (
//           <img
//             src={URL.createObjectURL(file)}
//             alt="Preview"
//             className="w-full border border-gray-300 rounded-lg mt-4"
//           />
//         )}
//         <button onClick={handleClearFile}>Clear File</button>
//       </div>
//     );
//   }
