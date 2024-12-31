"use client";
import { useState, useEffect, useRef } from "react";
import DataTable from "../../../components/dataTabel";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import { useRouter } from "next/navigation";
import {
  addRombel,
  fetchRombel,
  deleteRombel,
  updateRombel,
  Rombel,
} from "../../../api/rombel";
import useUserInfo from "@/app/components/useUserInfo";
import Swal from "sweetalert2";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type Column<T> = {
  header: string;
  accessor: keyof T; // Harus sesuai dengan properti yang ada pada tipe data T
  Cell?: (props: { row: T }) => React.ReactNode; // Opsional
};

export default function _Rombel() {
  // State untuk menyimpan nilai input
  const [isRombelValid, setIsRombelValid] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataRombel, setDataRombel] = useState<Rombel[]>([]);
  const [rombel, setRombel] = useState<Rombel[]>([]);
  const [editData, setEditData] = useState<Rombel | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // Menyimpan ID baris yang dropdown-nya terbuka
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk mengontrol modal
  const [selectedRow, setSelectedRow] = useState<Rombel | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { idAdmin } = useUserInfo();
  const [admins, setAdmins] = useState<
    { id_admin: string; nama_admin: string }[]
  >([]);
  const [formData, setFormData] = useState({
    id_rombel: "",
    nama_rombel: "",
    id_admin: idAdmin || "",
  });
  // Fungsi untuk mendapatkan data
  const fetchRombel = async (): Promise<AxiosResponse<{ data: Rombel[] }>> => {
    const response = await axios.get(`${baseUrl}/rombel/all-rombel`);
    return response; // respons ini memiliki properti data
  };
  useEffect(() => {
    const loadRombel = async () => {
      try {
        const response = await fetchRombel();
        console.log("API Rombel:", response);
        const data = response.data;
        setDataRombel(data.data);
      } catch (error) {
        console.error("Error fetching rombel:", error);
      }
    };
    loadRombel();
  }, []);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRombelIds, setSelectedRombelIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  // Fungsi untuk menampilkan modal konfirmasi
  const showDeleteModal = () => {
    setIsDeleteModalOpen(true); // Menampilkan modal
  };

  const confirmDelete = async () => {
    if (selectedRombelIds.length === 0) {
      toast.error("Pilih rombel yang ingin dihapus!");
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      // Panggil fungsi backend untuk menghapus siswa yang dipilih
      await Promise.all(
        selectedRombelIds.map(async (id_rombel: String) => {
          // Mengonversi id_rombel dari string ke number sebelum memanggil deleteRombel
          const id_rombel_number = String(id_rombel); // atau gunakan parseInt(id_rombel, 10)

          await deleteRombel(id_rombel_number); // Mengirimkan id_rombel sebagai number
        })
      );

      // Setelah sukses, update state di frontend
      setDataRombel((prevRombel) => {
        const updatedRombel = prevRombel.filter(
          (rombel) => !selectedRombelIds.includes(rombel.id_rombel)
        );

        // Periksa apakah data di halaman saat ini masih cukup, jika tidak arahkan ke halaman sebelumnya
        const totalItems = updatedRombel.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Jika currentPage melebihi total halaman baru, arahkan ke halaman sebelumnya
        if (currentPage > totalPages) {
          setCurrentPage(totalPages > 0 ? totalPages : 1); // Pastikan tidak mengarahkan ke halaman 0
        }

        return updatedRombel;
      });

      toast.success("Rombel yang dipilih berhasil dihapus");
      setSelectedRombelIds([]);
      setSelectAll(false); // Reset checkbox "Select All"
      setIsDeleteModalOpen(false); // Reset selectedSiswa setelah penghapusan
    } catch (error) {
      console.error("Error deleting rombel:", error);
      toast.error("Gagal menghapus rombel");
    }
  };

  // Fungsi untuk membatalkan penghapusan
  const cancelDelete = () => {
    setIsDeleteModalOpen(false); // Tutup modal tanpa melakukan apa-apa
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedRombelIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rombelId) => rombelId !== id)
        : [...prevSelected, id]
    );
  };
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allIds = dataRombel.map((rombel) => rombel.id_rombel);

      // Mengonversi nilai menjadi string dan menangani null
      const allIdsAsString = allIds.map((id) =>
        id !== null ? String(id) : ""
      ); // Menjadi string atau kosong jika null

      setSelectedRombelIds(allIdsAsString); // Menggunakan array string
    } else {
      setSelectedRombelIds([]);
    }
  };

  const rombelColumns = [] = [
    { header: "Nama Rombel", accessor: "nama_rombel" as keyof Rombel },
    {
      header: "Aksi",
      Cell: ({ row }: { row: Rombel }) => {
        return (
          <div>
            <button
              className="px-4 py-2 rounded"
              onClick={() => handleToggleDropdown(String(row.id_rombel))}
            >
              &#8942; {/* Simbol menu */}
            </button>

            {openDropdownId === row.id_rombel && ( // Hanya tampilkan dropdown jika id_rombel sesuai
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
      Cell: ({ row }: { row: Rombel }) => (
        <input
          type="checkbox"
          checked={selectedRombelIds.includes(String(row.id_rombel))}
          onChange={() => handleCheckboxChange(String(row.id_rombel))}
        />
      ),
    },
  ];
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
      setFormData((prevData) => ({
        ...prevData,
        id_admin: idAdmin,
      }));
    }
  }, [idAdmin]);

  const handleDetailClick = (row: Rombel) => {
    const admin = admins.find(
      (admin) => admin.id_admin === String(row.id_admin)
    ); // Cari admin berdasarkan id_admin
    console.log("id admin", admin);
    const namaAdmin = admin ? admin.nama_admin : "Tidak ada"; // Jika ditemukan, ambil nama_admin
    console.log("iki admin", namaAdmin);
    Swal.fire({
      html: `
        <div style="text-align: center;">
          <p>Jurusan ${JSON.stringify(row.nama_rombel) || "Tidak ada"}</p>
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

  const handleToggleDropdown = (id_rombel: string) => {
    setOpenDropdownId(openDropdownId === id_rombel ? null : id_rombel); // Toggle dropdown
  };

  // Fungsi untuk handle klik edit
  const handleEditClick = (row: Rombel) => {
    setEditData(row); // Set data yang dipilih ke form edit
    setIsModalOpen(true); // Buka modal saat tombol edit diklik
  };

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
      if (editData.nama_rombel.trim() === "") {
        setIsRombelValid(false);
        return;
      }

      try {
        console.log(editData.id_rombel); // Cek nilai id_rombel
        await updateRombel(String(editData.id_rombel), editData);
        setDataRombel((prev) =>
          prev.map((rombel) =>
            rombel.id_rombel === editData.id_rombel
              ? { ...rombel, ...editData }
              : rombel
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

  //handle hapus
  const handleDeleteClickk = (row: Rombel) => {
    setSelectedRow(row); // Simpan data yang ingin dihapus
    setIsConfirmOpen(true); // Buka modal
  };

  const handleConfirmDelete = async () => {
    try {
      // Panggil fungsi delete kelas untuk menghapus di backend
      if (selectedRow) {
        await deleteRombel(selectedRow.id_rombel);
      } else {
        console.error("No row is selected");
      }

      // Setelah sukses, update state di frontend
      if (selectedRow !== null) {
        setDataRombel((prevRombel) =>
          prevRombel.filter(
            (rombel) => rombel.id_rombel !== selectedRow.id_rombel
          )
        );
      }

      toast.success(`Rombel ${selectedRow?.nama_rombel} berhasil dihapus`);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRombelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.nama_rombel) {
      toast.error("Nama rombel tidak boleh kosong");
      return;
    }

    try {
      const response = await addRombel(formData);
      console.log("API response:", response);
      toast.success("Rombel berhasil ditambahkan!");

      // Update state dengan data baru
      setDataRombel((prevRombel) => [...prevRombel, response.data]);
      setFormData({
        id_rombel: "",
        nama_rombel: "",
        id_admin: idAdmin,
      });
    } catch (error) {
      console.error("Error adding rombel:", error);
      toast.error("Terjadi kesalahan saat menambah data");
    }
  };

  // const handleEdit = async (updatedRow: Rombel) => {
  //   try {
  //     if (!updatedRow.id_rombel || !updatedRow.nama_rombel) {
  //       throw new Error("ID Rombel atau Nama Rombel tidak ditemukan");
  //     }

  //     setDataRombel((prevRombel) =>
  //       prevRombel.map((rombel) =>
  //         rombel.id_rombel === updatedRow.id_rombel ? updatedRow : rombel
  //       )
  //     );

  //     await updateRombel(updatedRow.id_rombel, updatedRow);
  //     toast.success("Data rombel berhasil diperbarui!");
  //   } catch (error) {
  //     console.error("Gagal memperbarui data:", error);
  //     toast.error("Gagal memperbarui data");
  //   }
  // };

  // const handleDelete = async (deletedRow: Rombel) => {
  //   const confirmed = window.confirm(
  //     `Apakah Anda yakin ingin menghapus rombel ${deletedRow.nama_rombel}?`
  //   );
  //   if (confirmed) {
  //     try {
  //       await deleteRombel(deletedRow.id_rombel);

  //       setDataRombel((prevRombel) =>
  //         prevRombel.filter(
  //           (rombel) => rombel.id_rombel !== deletedRow.id_rombel
  //         )
  //       );

  //       toast.success("Rombel berhasil dihapus");
  //     } catch (error) {
  //       console.error("Error deleting Rombel:", error);
  //       toast.error("Terjadi kesalahan saat menghapus data");
  //     }
  //   }
  // };

  //tombol untuk filter, pindah halaman, search dan reset
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default value is 5
  const [currentPage, setCurrentPage] = useState(1);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;  // Pastikan e.target ada dan value terdefinisi
    const numericValue = Number(value);  // Mengonversi ke angka

    if (!isNaN(numericValue)) {
      setItemsPerPage(numericValue);  // Mengubah state itemsPerPage
      setCurrentPage(1);  // Reset ke halaman pertama
    } else {
      console.error("Input tidak valid");
    }
  };

  // Memfilter data berdasarkan searchTerm
  const filteredData = dataRombel.filter((item) => {
    // Asumsikan 'kelas' memiliki properti 'kelas' untuk dicari
    return item.nama_rombel.toLowerCase().includes(searchTerm.toLowerCase());
    // item.id_admin.toLowerCase().includes(searchTerm.toLowerCase())
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (a.nama_rombel < b.nama_rombel) return -1;
    if (a.nama_rombel > b.nama_rombel) return 1;
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
          <h1 className="text-2xl font-bold">Rombel</h1>
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
              <li className="text-gray-500">Rombel</li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Column 1: Input */}
          <div className="w-full lg:w-1/3 p-4 lg:p-6">
            <form
              onSubmit={handleRombelSubmit}
              className="bg-white rounded-lg shadow-md p-4 lg:p-6 border"
            >
              <input
                type="text"
                name="id_admin"
                value={formData.id_admin}
                onChange={handleChange}
                className="hidden"
              />
              <h2 className="text-sm mb-2 sm:text-sm font-bold"> Rombel</h2>
              <input
                type="text"
                name="nama_rombel"
                value={formData.nama_rombel}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md w-full"
                placeholder="Rombel..."
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
                      Tabel Rombel
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

                <div className="overflow-x-auto">
                  <DataTable
                    columns={rombelColumns as { header: string; accessor: keyof Rombel; Cell?: ({ row }: { row: Rombel }) => JSX.Element; }[]}
                    data={paginatedData}
                    // onEdit={handleEdit}
                    // onDelete={handleDelete}
                  />
                  {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="bg-white rounded p-4 shadow-lg">
                        <h3 className="pb-2">Edit Data Rombel</h3>
                        <form onSubmit={handleEditSubmit}>
                          <input
                            type="text"
                            name="nama_rombel"
                            value={editData ? editData.nama_rombel : ""}
                            onChange={handleEditChange}
                            className={`w-full p-2 border rounded text-sm sm:text-base mb-2 ${
                              isRombelValid
                                ? "border-gray-300"
                                : "border-red-500"
                            }`}
                            placeholder="Rombel..."
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
                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center pb-4">
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
//   }

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
// }
