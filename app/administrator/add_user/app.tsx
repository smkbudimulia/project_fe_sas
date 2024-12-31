"use client";
import { useState, useEffect, useRef } from "react";
import Pw from "./pass";
import axios from "axios";
import bcrypt from "bcryptjs"; // Pastikan bcryptjs sudah terinstal
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchAdmins,
  addAdmins,
  updateAdmins,
  deleteAdmins,
  Admin,
} from "../../api/admin";
import DataTable from "../../components/dataTabel";
import useUserInfo from "@/app/components/useUserInfo";
import Swal from "sweetalert2";

interface Kelas {
  id: number;
  nama: string;
  deskripsi?: string;
}



export default function DataSiswa() {
  // const bcrypt = require("bcryptjs");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default value is 5
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState<Admin | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);  // Menyesuaikan tipe state menjadi string
  const [isAdminsValid, setIsAdminsValid] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk mengontrol modal
  const [selectedRow, setSelectedRow] = useState<Admin | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev); // Toggle state
  };
  const { namaAdmin, status, idAdmin } = useUserInfo();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [formData, setFormData] = useState({
    id_admin: "",
    nama_admin: "",
    alamat: "",
    jenis_kelamin: "",
    no_telp: "",
    email: "",
    username: "",
    pass: "",
    foto: null as File | null,
    status: "aktif", // Default status
  });

  useEffect(() => {
    const loadAdmins = async () => {
      const response = await fetchAdmins(); // response sekarang sudah berupa array Admin[]
      console.log("API response:", response); // Debugging tambahan
      setAdmins(response); // Set langsung ke admins karena response sudah berupa Admin[]
    };
    loadAdmins();
  }, []);
  
  const adminColumns = [] = [
    { header: "Id_admin", accessor: "id_admin" as keyof Admin },
    { header: "Nama", accessor: "nama_admin" as keyof Admin },
    { header: "Alamat", accessor: "alamat" as keyof Admin },
    { header: "Jk", accessor: "jenis_kelamin" as keyof Admin },
    { header: "No Tlpn", accessor: "no_telp" as keyof Admin },
    { header: "Email", accessor: "email" as keyof Admin },
    // { header: 'Username', accessor: 'username' as keyof Admin },
    // { header: "Password", accessor: "pass" as keyof Admin },
    { header: "Foto", accessor: "foto" as keyof Admin },
    { header: "Status", accessor: "status" as keyof Admin },
    {
      header: "Aksi",
      Cell: ({ row }: { row: Admin }) => {
        return (
          <div>
            <button
              className="px-4 py-2 rounded"
              onClick={() => handleToggleDropdown(row.id_admin)}
            >
              &#8942; {/* Simbol menu */}
            </button>
            {openDropdownId === row.id_admin && ( // Hanya tampilkan dropdown jika id_admin sesuai
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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false); // Kontrol pop-up detail
  const [matchedAdmin, setMatchedAdmin] = useState<Admin | null>(null);// Simpan admin yang cocok
 
  const handleDetailClick = (row: Admin) => {
    setIsPopupOpen(true); // Buka pop-up
    setOpenDropdownId(null); // Tutup dropdown setelah melihat detail
  };
  const handlePassSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const enteredPassword = password.trim();

    let foundAdmin = null;

    // Loop untuk mencari admin dengan password yang sesuai
    for (const admin of admins) {
      
      const isMatch = await bcrypt.compare(enteredPassword, admin.pass ?? "");
      if (isMatch) {
        foundAdmin = admin;
        break; // Hentikan pencarian jika ditemukan
      }
    }

    if (foundAdmin) {
      console.log("Password benar, akses diberikan:", foundAdmin);
      setMatchedAdmin(foundAdmin); // Simpan admin yang ditemukan
      setIsPopupOpen(false); // Tutup pop-up login
      setIsDetailPopupOpen(true); // Tampilkan pop-up detail
    } else {
      console.error("Password salah atau admin tidak ditemukan!");
      toast("Password yang dimasukkan salah atau admin tidak ditemukan!");
    }
  };
  // Fungsi untuk menutup pop-up detail
  const handleCloseDetailPopup = () => {
    setIsDetailPopupOpen(false);
  };

  // console.log('Daftar Password Admin:', admins.map(admin => admin.pass));
  //$2b$11$Tbc4/cpJ8aSIZkEw7HK3e.OQHKgFQ3jaOkFj.61B8YJJXiAmiFtDa

  const handleToggleDropdown = (id_kelas: string) => {
    setOpenDropdownId(openDropdownId === id_kelas ? null : id_kelas); // Toggle dropdown
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFormData({
        ...formData,
        [name]: file,
      });

      // Preview file jika ada
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFotoPreview(null);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi jika ada input yang kosong
    if (
      !formData.nama_admin ||
      !formData.alamat ||
      !formData.jenis_kelamin ||
      !formData.no_telp ||
      !formData.email ||
      !formData.username ||
      !formData.pass ||
      !formData.foto ||
      !formData.status
    ) {
      toast.error("Data tidak boleh kosong");
      return;
    }

    try {
      const response = await addAdmins(formData); // Sesuaikan dengan fungsi API yang sesuai
      console.log("API response:", response);
      if (response?.exists) {
        toast.error("Data sudah ada!");
      } else {
        toast.success("Admin berhasil ditambahkan!");
        // Menambahkan admin yang baru ke dalam state admins agar langsung muncul di tabel
        setAdmins((prevAdmins) => [...prevAdmins, response]);

        // Reset form setelah berhasil
        setFormData({
          id_admin: "",
          nama_admin: "",
          alamat: "",
          jenis_kelamin: "",
          no_telp: "",
          email: "",
          username: "",
          pass: "",
          foto: null,
          status: "",
        });
        setFotoPreview(null);
      }
    } catch (error) {
      console.error("Error adding admin:", error);

      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response);
        if (error.response) {
          // Tampilkan pesan error spesifik dari server jika ada
          const errorMessage =
            error.response.data.message || "Terjadi kesalahan pada server";
          toast.error(`Error: ${error.response.status} - ${errorMessage}`);
        } else {
          toast.error(
            "Tidak dapat terhubung ke server. Periksa koneksi Anda atau coba lagi nanti."
          );
        }
      } else {
        toast.error("Terjadi kesalahan saat menambah data");
      }
    }
  };

  // Fungsi untuk handle klik edit
  const handleEditClick = (row: Admin) => {
    setEditData(row); // Set data yang dipilih ke form edit
    setIsModalOpen(true); // Buka modal saat tombol edit diklik
  };
  // Handle perubahan input pada form edit
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name as keyof Admin; // Pastikan fieldName valid
    setEditData((prev) => {
      if (!prev) return null; // Jika prev null, tidak melakukan apa-apa
      return {
        ...prev,
        [fieldName]: e.target.value, // Perbarui properti dengan validasi tipe
      };
    });
  };
  
  
  
  // Handle update data setelah form edit disubmit
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editData) {
      // Validasi sebelum mengupdate
      if (editData.nama_admin.trim() === "") {
        setIsAdminsValid(false);
        return;
      }

      // Cek apakah ada perubahan
      const existingAdmin = admins.find(
        (admin) => admin.id_admin === editData.id_admin
      );
      if (
        existingAdmin &&
        JSON.stringify(existingAdmin) === JSON.stringify(editData)
      ) {
        toast.error("Tidak ada perubahan data yang dilakukan.");
        return;
      }

      try {
        await updateAdmins(editData.id_admin, editData);
        setAdmins((prev) =>
          prev.map((admin) =>
            admin.id_admin === editData.id_admin
              ? { ...admin, ...editData }
              : admin
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

  const handleDeleteClickk = (row: Admin) => {
    setSelectedRow(row); // Simpan data yang ingin dihapus
    setIsConfirmOpen(true); // Buka modal
  };
  const handleConfirmDelete = async () => {
    if (!selectedRow) {
      console.error("Tidak ada baris yang dipilih untuk dihapus");
      return;
    }
    try {
      // Panggil fungsi delete Admin untuk menghapus di backend
      await deleteAdmins(selectedRow.id_admin);

      // Setelah sukses, update state di frontend
      setAdmins((prevAdmins) =>
        prevAdmins.filter(
          (admin) => admin.nama_admin !== selectedRow.nama_admin
        )
      );
      toast.success(`Admin ${selectedRow.nama_admin} berhasil dihapus`);
      setIsConfirmOpen(false); // Tutup modal
      setSelectedRow(null); // Reset selectedRow
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Gagal menghapus admin");
    }
  };
  const handleCancel = () => {
    setIsConfirmOpen(false); // Tutup modal tanpa hapus
    setSelectedRow(null); // Reset selectedRow
  };

  //tombol untuk filter, pindah halaman, search dan reset
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); //  Reset ke halaman pertama saat jumlah item per halaman berubah
  };

  // Memfilter data berdasarkan searchTerm
  const filteredData = admins.filter((item) => {
    // Asumsikan 'kelas' memiliki properti 'kelas' untuk dicari
    return (
      item.nama_admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jenis_kelamin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_telp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const isResettable = searchTerm.length > 0; // Tombol reset aktif jika ada input pencarian

  return (
    <>
      <div className="rounded-lg max-w-full bg-slate-100">
        <div className="pt-8 ml-7">
          <h1 className="text-2xl font-bold">Add User</h1>
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
                  Administrator
                </a>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li className="text-gray-500">Add User</li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Column 1: Input */}
          <div className="w-full lg:w-1/3 p-4 lg:p-6">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md p-4 lg:p-6 border"
            >
              <h2 className="text-sm mb-2 sm:text-sm pt-3 font-bold">
                {" "}
                Nama Admin
              </h2>
              <input
                type="text"
                name="nama_admin"
                value={formData.nama_admin}
                onChange={handleChange}
                placeholder="Nama Admin..."
                className="w-full p-2 border rounded text-sm sm:text-base mb-2"
              />
              <h2 className="text-sm mb-2 sm:text-sm pt-3 font-bold">
                {" "}
                Alamat
              </h2>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Alamat..."
                className="w-full p-2 border rounded text-sm sm:text-base mb-2"
              />
              <h2 className="text-sm mb-2 sm:text-sm pt-3 font-bold">
                {" "}
                Jenis Kelamin
              </h2>
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm sm:text-base mb-2"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <h2 className="text-sm mb-2 sm:text-sm pt-3 font-bold">
                {" "}
                Nomor Telepon
              </h2>
              <input
                type="tel"
                name="no_telp"
                value={formData.no_telp}
                onChange={handleChange}
                placeholder="No Telepon..."
                className="w-full p-2 border rounded text-sm sm:text-base mb-2"
              />
              <h2 className="text-sm mb-2 sm:text-sm pt-3 font-bold">
                {" "}
                Email
              </h2>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email..."
                className="w-full p-2 border rounded text-sm sm:text-base mb-2"
              />
              <h2 className="text-sm mb-2 sm:text-sm pt-3 font-bold">
                {" "}
                Username
              </h2>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username..."
                className="w-full p-2 border rounded text-sm sm:text-base mb-2"
              />
              <h2 className="text-sm mb-2 sm:text-sm pt-3 font-bold">
                {" "}
                Password
              </h2>
              <div className="relative w-full">
                <input
                  type={passwordVisible ? "text" : "password"} // Ubah tipe input berdasarkan state
                  name="pass"
                  value={formData.pass}
                  onChange={handleChange}
                  placeholder="Password..."
                  className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                />
                <span
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-2 pb-2 flex items-center cursor-pointer text-gray-600"
                >
                  {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              <h2 className="text-sm mb-2 sm:text-sm pt-3 font-bold">
                {" "}
                Foto
              </h2>
              <input
                type="file"
                name="foto"
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                accept="image/*"
              />
              <h2 className="text-sm pt-3 mb-2 sm:text-sm font-bold">
                {" "}
                Status
              </h2>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm sm:text-base mb-2"
              >
                <option value="">Pilih Status</option>
                <option value="Administrator">Administrator</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="mt-4 flex justify-end items-center">
                {/* Tombol Simpan */}
                <div className="flex m-4 space-x-2">
                  <button
                    type="submit"
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-teal-400 hover:bg-teal-500 text-white items-end-end rounded text-sm sm:text-base"
                  >
                    Simpan
                  </button>
                </div>
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
                      Tabel Add USer
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
                  {/* <div className="">
                    <label
                      htmlFor="filterPeran"
                      className="block text-sm font-medium text-gray-700"
                    >
                    </label>
                    <select
                      id="filterPeran"
                      value={filterPeran}
                      onChange={handleFilterChange(setFilterperan)}
                      className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                    >
                      <option value="">Semua peran</option>
                      {peranOptions.map((peran, index) => (
                        <option key={index} value={peran}>
                          {peran}
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
                    columns={adminColumns as { header: string; accessor: keyof Admin; Cell?: ({ row }: { row: Admin }) => JSX.Element; }[]}
                    data={paginatedData}
                    // onEdit={handleEdit} // Fungsi ini dipassing ke komponen DataTable
                    // onDelete={handleDelete}
                  />
                  {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="bg-white rounded p-4 shadow-lg">
                        <h3 className="pb-2">Edit Data Admin</h3>
                        <form onSubmit={handleEditSubmit}>
                          <input
                            type="text"
                            name="nama_admin"
                            value={editData ? editData.nama_admin : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="Nama Admin..."
                          />

                          <input
                            type="text"
                            name="alamat"
                            value={editData ? editData.alamat : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="Alamat..."
                          />

                          <select
                            name="jenis_kelamin"
                            value={editData ? editData.jenis_kelamin : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                          >
                            <option value="">Pilih Jenis Kelamin</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>

                          <input
                            type="text"
                            name="no_telp"
                            value={editData ? editData.no_telp : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="No Telepon..."
                          />

                          <input
                            type="email"
                            name="email"
                            value={editData ? editData.email : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="Email..."
                          />

                          <input
                            type="text"
                            name="username"
                            value={editData ? editData.username : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="Username..."
                          />

                          <div className="relative w-full">
                            <input
                              type={passwordVisible ? "text" : "password"} // Ubah tipe input berdasarkan state
                              name="pass"
                              value={formData.pass}
                              onChange={handleChange}
                              placeholder="Password..."
                              className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            />
                            <span
                              onClick={togglePasswordVisibility}
                              className="absolute inset-y-0 right-2 pb-2 flex items-center cursor-pointer text-gray-600"
                            >
                              {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                            </span>
                          </div>

                          <input
                            type="file"
                            name="foto"
                            accept="image/*"
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                          />

                          <select
                            name="status"
                            value={editData ? editData.status : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                          >
                            <option value="">Pilih Status</option>
                            <option value="Administrator">Administrator</option>
                            <option value="Admin">Admin</option>
                          </select>

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
                  {isPopupOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out">
                      <div className="bg-white p-6 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out scale-95 opacity-100">
                        <h2 className="text-lg font-bold">Masukkan Password</h2>
                        <form onSubmit={handlePassSubmit}>
                          <input
                            type="password"
                            name="pass"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border p-2 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Password Administrator..."
                            required
                          />
                          <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
                          >
                            Submit
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsPopupOpen(false)}
                            className="ml-2 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200"
                          >
                            Batal
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                  {isDetailPopupOpen && matchedAdmin && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out">
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold">Detail Admin</h2>
                        <p>
                          <strong>Username:</strong> {matchedAdmin.username}
                        </p>
                        <p>
                          <strong>Password:</strong> {matchedAdmin.pass}
                        </p>
                        <button
                          type="button"
                          onClick={handleCloseDetailPopup}
                          className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition duration-200"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-white">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex m-4 space-x-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`px-2 py-1 border rounded ${
                        currentPage === 1
                          ? "bg-gray-300"
                          : "bg-teal-400 hover:bg-teal-600 text-white"
                      }`}
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
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
