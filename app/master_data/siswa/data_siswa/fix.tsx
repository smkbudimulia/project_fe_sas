"use client";
import { useState, useEffect, useRef } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  addSiswa,
  fetchSiswa,
  deleteSiswa,
  updateSiswa,
  Siswa,
} from "../../../api/siswa";
import DataTable from "../../../components/dataTabel";
import * as XLSX from "xlsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import imageCompression from "browser-image-compression";
import useUserInfo from "@/app/components/useUserInfo";
import Swal from "sweetalert2";
import { FaWhatsapp } from "react-icons/fa";
import { TahunAjaran } from "@/app/api/tahunAjaran";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type TahunPelajaran = {
  tahun: string; // Atau bisa juga number, tergantung kebutuhan
  id_tahun_pelajaran: string;
};

type Kelas = {
  kelas: string; // Atau bisa juga number, tergantung kebutuhan
  id_kelas: string;
};

type Rombel = {
  nama_rombel: string; // Atau bisa juga number, tergantung kebutuhan
  id_rombel: string;
};

export default function DataSiswa() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev); // Toggle state
  };
  const [admins, setAdmins] = useState<
    { id_admin: string; nama_admin: string }[]
  >([]);
  const { namaAdmin, status, idAdmin } = useUserInfo();
  // const [editData, setEditData] = useState<Siswa | null>(null);
  const [editData, setEditData] = useState<Partial<Siswa>>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // Menyimpan ID baris yang dropdown-nya terbuka
  const [isSiswaValid, setIsSiswaValid] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk mengontrol modal
  const [selectedRow, setSelectedRow] = useState<Siswa | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isIdSiswaValid, setIsIdSiswaValid] = useState(true);
  const [tahunPelajaran, setTahunPelajaran] = useState<TahunPelajaran[]>([]);
  const sortedTahunPelajaran = (
    tahunPelajaran as { tahun: string; id_tahun_pelajaran: string }[]
  ).sort((a, b) => a.tahun.localeCompare(b.tahun));
  const [tahunEditPelajaran, setTahunEditPelajaran] = useState<TahunAjaran[]>(
    []
  );
  const [selectedTahun, setSelectedTahun] = useState("");
  const [selectedEditTahun, setSelectedEditTahun] = useState("");
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const sortedKelas = (kelas as { kelas: string; id_kelas: string }[]).sort(
    (a, b) => a.kelas.localeCompare(b.kelas)
  );
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedEditKelas, setSelectedEditKelas] = useState("");
  const [rombel, setRombel] = useState<Rombel[]>([]);
  const [selectedRombel, setSelectedRombel] = useState("");
  const sortedRombel = (
    rombel as { nama_rombel: string; id_rombel: string }[]
  ).sort((a, b) => a.nama_rombel.localeCompare(b.nama_rombel));
  const [selectedEditRombel, setSelectedEditRombel] = useState("");
  const [dataSiswa, setDataSiswa] = useState<Siswa[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    id_siswa: "",
    id_admin: "",
    nis: "",
    nama_siswa: "",
    jenis_kelamin: "",
    id_tahun_pelajaran: "",
    id_kelas: "",
    id_rombel: "",
    nama_wali: "",
    nomor_wali: "",
    email: "",
    pass: "",
    foto: "",
    barcode: "",
  });

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fungsi untuk mendapatkan data
  const fetchSiswa = async (): Promise<AxiosResponse<{ data: Siswa[] }>> => {
    const response = await axios.get(`${baseUrl}/siswa/all-siswa`);
    return response; // respons ini memiliki properti data
  };
  //stet untuk fecth siswa
  useEffect(() => {
    const loadSiswa = async () => {
      const response = await fetchSiswa();
      // console.log('API siswa:', response); // Debugging tambahan
      const data = response.data;
      setDataSiswa(data.data);
    };
    loadSiswa();
  }, []);

  useEffect(() => {
    const fetchTahunPelajaran = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/tahun-pelajaran/all-tahun-pelajaran`
        ); // Sesuaikan dengan URL API Anda
        setTahunPelajaran(response.data.data);
        console.log("data berhasil di fetch", response);
      } catch (error) {
        console.error("Error fetching tahun pelajaran:", error);
      }
    };

    fetchTahunPelajaran();
  }, []);
  useEffect(() => {
    const fetchTahunPelajaran = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/tahun-pelajaran/all-tahun-pelajaran`
        ); // Sesuaikan dengan URL API Anda
        setTahunEditPelajaran(response.data.data);
        console.log("data berhasil di fetch", response);
      } catch (error) {
        console.error("Error fetching tahun pelajaran:", error);
      }
    };

    fetchTahunPelajaran();
  }, []);

  const handleTahunChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // Log ID yang dipilih untuk memastikan
    console.log("ID Tahun Pelajaran yang dipilih:", value);
    setSelectedTahun(value);
    setFormData((prevData) => ({
      ...prevData,
      id_tahun_pelajaran: value, // Memperbarui formData
    }));
  };

  const handleEditTahunChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    console.log("ID Tahun Pelajaran yang dipilih:", value);
    setSelectedEditTahun(value); // Update state untuk dropdown tahun ajaran
    setEditData((prevTahun) => ({ ...prevTahun, id_tahun_pelajaran: value })); // Update id_tahun_pelajaran di editData
  };

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const response = await axios.get(`${baseUrl}/kelas/all-kelas`); // Sesuaikan dengan URL API Anda
        setKelas(response.data.data);
        console.log("data berhasil di fetch", response);
      } catch (error) {
        console.error("Error fetching tahun pelajaran:", error);
      }
    };

    fetchKelas();
  }, []);

  const handleKelasChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    console.log("ID Kelas yang dipilih:", value);
    setSelectedKelas(value);
    setFormData((prevData) => ({
      ...prevData,
      id_kelas: value, // Memperbarui formData
    }));
  };

  const handleEditKelasChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    console.log("ID Rombel yang dipilih:", value);
    setSelectedEditKelas(value); // Update state untuk dropdown kelas
    setEditData((prev) => ({ ...prev, id_kelas: value })); // Update id_kelas di editData
  };

  useEffect(() => {
    const fetchRombel = async () => {
      try {
        const response = await axios.get(`${baseUrl}/rombel/all-rombel`); // Sesuaikan dengan URL API Anda
        setRombel(response.data.data);
        console.log("data berhasil di fetch", response);
      } catch (error) {
        console.error("Error fetching tahun pelajaran:", error);
      }
    };

    fetchRombel();
  }, []);

  const handleRombelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    console.log("ID Rombel yang dipilih:", value);
    setSelectedRombel(value);
    setFormData((prevData) => ({
      ...prevData,
      id_rombel: value, // Memperbarui formData
    }));
  };

  const handleEditRombelChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    console.log("ID Rombel yang dipilih:", value);
    setSelectedEditRombel(value); // Update state untuk dropdown rombel
    setEditData((prev) => ({ ...prev, id_rombel: value })); // Update id_rombel di editData
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  // Fungsi untuk menampilkan modal konfirmasi
  const showDeleteModal = () => {
    setIsDeleteModalOpen(true); // Menampilkan modal
  };

  const confirmDelete = async () => {
    if (selectedSiswaIds.length === 0) {
      toast.error("Pilih siswa yang ingin dihapus!");
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      // Panggil fungsi backend untuk menghapus siswa yang dipilih
      await Promise.all(
        selectedSiswaIds.map(async (id_siswa) => {
          await deleteSiswa(id_siswa); // Pastikan deleteSiswa adalah fungsi yang memanggil API backend untuk menghapus data
        })
      );

      // Setelah sukses, update state di frontend
      setDataSiswa((prevSiswa) => {
        const updatedSiswa = prevSiswa.filter(
          (siswa) => !selectedSiswaIds.includes(siswa.id_siswa)
        );

        // Periksa apakah data di halaman saat ini masih cukup, jika tidak arahkan ke halaman sebelumnya
        const totalItems = updatedSiswa.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Jika currentPage melebihi total halaman baru, arahkan ke halaman sebelumnya
        if (currentPage > totalPages) {
          setCurrentPage(totalPages > 0 ? totalPages : 1); // Pastikan tidak mengarahkan ke halaman 0
        }

        return updatedSiswa;
      });

      toast.success("Siswa yang dipilih berhasil dihapus");
      setSelectedSiswaIds([]);
      setIsDeleteModalOpen(false); // Reset selectedSiswa setelah penghapusan
    } catch (error) {
      console.error("Error deleting siswa:", error);
      toast.error("Gagal menghapus siswa");
    }
  };

  // Fungsi untuk membatalkan penghapusan
  const cancelDelete = () => {
    setIsDeleteModalOpen(false); // Tutup modal tanpa melakukan apa-apa
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedSiswaIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((siswaId) => siswaId !== id)
        : [...prevSelected, id]
    );
  };
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allIds = dataSiswa.map((siswa) => siswa.id_siswa);
      setSelectedSiswaIds(allIds);
    } else {
      setSelectedSiswaIds([]);
    }
  };

  // fields untuk DataTabel
  const siswaColumns = [
    { header: "Foto", accessor: "foto" as keyof Siswa },
    { header: "Nis", accessor: "nis" as keyof Siswa },
    { header: "Id ", accessor: "id_siswa" as keyof Siswa },
    { header: "Nama", accessor: "nama_siswa" as keyof Siswa },
    { header: "JK", accessor: "jenis_kelamin" as keyof Siswa },
    { header: "Tahun Ajaran", accessor: "tahun" as keyof Siswa },
    { header: "Kelas", accessor: "kelas" as keyof Siswa },
    { header: "Jurusan", accessor: "nama_rombel" as keyof Siswa },
    { header: "Nama Wali", accessor: "nama_wali" as keyof Siswa },
    {
      header: "No Wali",
      accessor: "nomor_wali", // Ini untuk akses ke kolom nomor_wali dalam data
      Cell: ({ row }: any) => {
        const nomorWali = row.nomor_wali; // Ambil nomor_wali langsung dari row.original
        if (!nomorWali) return null; // Pastikan nomor_wali ada
        return (
          <a
            href={`https://wa.me/${nomorWali}`} // Gantikan nomor_wali dengan nomor yang diambil dari baris data
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp size={20} color="#25D366" /> {/* Ikon WhatsApp */}
          </a>
        );
      },
    },
    {
      header: "Aksi",
      Cell: ({ row }: { row: Siswa }) => {
        return (
          <div className="relative">
            <button
              className="px-4 py-2 rounded"
              onClick={() => handleToggleDropdown(row.id_siswa)}
            >
              &#8942; {/* Simbol menu */}
            </button>
            {openDropdownId === row.id_siswa && ( // Hanya tampilkan dropdown jika id_siswa sesuai
              <div className="absolute -ml-36 mt-2 w-48 bg-white border rounded shadow-md">
                <button
                  onClick={() => handleEditClick(row)}
                  className="block w-full  px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
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
                  className="block px-4 py-2 text-black"
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
      Cell: ({ row }: { row: Siswa }) => (
        <input
          type="checkbox"
          checked={selectedSiswaIds.includes(row.id_siswa)}
          onChange={() => handleCheckboxChange(row.id_siswa)}
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

  const handleDetailClick = (row: Siswa) => {
    const admin = admins.find((admin) => admin.id_admin === row.id_admin); // Cari admin berdasarkan id_admin
    console.log("id admin", admin);
    const namaAdmin = admin ? admin.nama_admin : "Tidak ada"; // Jika ditemukan, ambil nama_admin
    console.log("iki admin", namaAdmin);
    Swal.fire({
      html: `
        <div style="text-align: center;">
          <p>Nama Siswa: ${JSON.stringify(row.nama_siswa) || "Tidak ada"}</p>
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

  const handleToggleDropdown = (id_siswa: string) => {
    setOpenDropdownId(openDropdownId === id_siswa ? null : id_siswa); // Toggle dropdown
  };

  // Fungsi untuk handle klik edit
  const handleEditClick = (row: Siswa) => {
    setEditData(row);
    setIsModalOpen(true);

    // Mengatur nilai dropdown untuk kelas, jurusan, dan tahun ajaran
    setSelectedEditKelas(row.id_kelas);
    setSelectedEditTahun(row.id_tahun_pelajaran);
    setSelectedEditRombel(row.id_rombel);
  };
  // Handle perubahan input pada form edit
  // Handler umum untuk input teks
  // Fungsi untuk handle perubahan input form
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Pengecekan prev tidak null atau undefined
    setEditData((prev) => {
      if (!prev) {
        return {
          [name]: value,
        } as Siswa; // Tentukan tipe jika prev kosong
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // Fungsi untuk submit data yang sudah diedit
  // Fungsi untuk mengirimkan data yang sudah diedit
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.put(`${baseUrl}/siswa/edit-siswa`, [
        editData, // Mengirim array karena backend menerima array
      ]);

      if (response.data.success) {
        toast("Data berhasil diperbarui!");
        setIsModalOpen(false); // Menutup modal
        // Auto refresh data siswa dengan mengupdate state
        setDataSiswa((prevData) => {
          console.log("Data sebelumnya:", prevData); // Debugging untuk melihat data sebelumnya
          // Pastikan editData bukan null sebelum melakukan operasi
          if (editData) {
            const updatedData = prevData.map((siswa) =>
              siswa.id_siswa === editData.id_siswa
                ? { ...siswa, ...editData }
                : siswa
            );
            console.log("Data setelah update:", updatedData); // Debugging untuk melihat data setelah diupdate
            return updatedData;
          } else {
            // Jika editData null, kembalikan data sebelumnya tanpa perubahan
            console.log("editData is null, no changes made");
            return prevData;
          }
        });
        setOpenDropdownId(null); // Tutup dropdown juga
      } else {
        toast("Terjadi kesalahan saat memperbarui data.");
      }
    } catch (error) {
      // console.error("error apa ini", error.response?.data);
      toast.error("Gagal mengupdate data.");
    }
  };

  const handleDeleteClickk = (row: Siswa) => {
    setSelectedRow(row); // Simpan data yang ingin dihapus
    setIsConfirmOpen(true); // Buka modal
  };

  const handleConfirmDelete = async () => {
    try {
      // Panggil fungsi delete untuk menghapus data siswa di backend
      if (selectedRow) {
        await deleteSiswa(selectedRow.id_siswa);
      } else {
        console.error("Tidak ada baris yang dipilih");
      }

      // Setelah sukses, update state di frontend
      setDataSiswa((prevSiswa) => {
        if (selectedRow === null) {
          // Jika selectedRow adalah null, tidak lakukan apa-apa atau lakukan penanganan lain.
          return prevSiswa;
        }

        const updatedSiswa = prevSiswa.filter(
          (siswa) => siswa.id_siswa !== selectedRow.id_siswa
        );

        // Periksa apakah data di halaman saat ini masih cukup, jika tidak arahkan ke halaman sebelumnya
        const totalItems = updatedSiswa.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Jika currentPage melebihi total halaman baru, arahkan ke halaman sebelumnya
        if (currentPage > totalPages) {
          setCurrentPage(totalPages);
        }

        return updatedSiswa;
      });

      toast.success(`Siswa ${selectedRow?.nama_siswa} berhasil dihapus`);
      setIsConfirmOpen(false); // Tutup modal
      setSelectedRow(null); // Reset selectedRow
    } catch (error) {
      console.error("Error deleting siswa:", error);
      toast.error("Gagal menghapus siswa");
    }
  };

  const handleCancel = () => {
    setIsConfirmOpen(false); // Tutup modal tanpa hapus
    setSelectedRow(null); // Reset selectedRow
  };

  //state untuk menghandle input
  // Handler umum untuk input teks
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Validasi untuk nis dan nomor_wali agar hanya menerima angka
    if ((name === "nis" || name === "nomor_wali") && !/^\d*$/.test(value)) {
      return; // Jika bukan angka, jangan update state
    }

    // Update state dengan nilai yang valid
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handler khusus untuk input foto
  // const handleEditFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setFormData({ ...formData, foto: e.target.files[0] }); // Simpan file foto di formData
  //     setFotoPreview(URL.createObjectURL(e.target.files[0])); // Untuk menampilkan preview
  //   }
  // };

  // Handler khusus untuk input foto
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]); // Simpan file foto di formData
      setFotoPreview(URL.createObjectURL(e.target.files[0])); // Untuk menampilkan preview
    }
  };

  //state untuk simpan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    // Validasi: Pastikan nis, nama_siswa, dan jenis_kelamin tidak kosong
    if (!formData.nis || !formData.nama_siswa || !formData.jenis_kelamin) {
      // Temukan input yang kosong dan beri fokus pada input pertama yang kosong
      if (!formData.nis) {
        document.getElementById("nis-input")?.focus();
      } else if (!formData.nama_siswa) {
        document.getElementById("nama-siswa-input")?.focus();
      } else if (!formData.jenis_kelamin) {
        document.getElementById("jenis-kelamin-input")?.focus();
      }
      toast.error(
        "Semua field (NIS, Nama Siswa, dan Jenis Kelamin) harus diisi!"
      );
      return; // Menghentikan proses submit jika ada input yang kosong
    }


    try {
      // Gantikan dengan URL server Anda
      const response = await axios.post(`${baseUrl}/siswa/add-siswa`, [
        formData,
      ]);
      console.log("add respon", response);
      if (response.data.success) {
        toast.success(`Siswa ${formData.nama_siswa} berhasil ditambah!`);

        // Menambahkan data siswa yang baru ke state dataSiswa
        setDataSiswa((prevData) => [
          ...prevData,
          {
            ...formData, // Data siswa yang baru ditambahkan
          },
        ]);

        // Fetch ulang data dari server (opsional)
        const fetchSiswa = async () => {
          try {
            const res = await axios.get(`${baseUrl}/siswa/all-siswa`);
            setDataSiswa(res.data);
            console.log("fetch siswa berhasil", res);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
        await fetchSiswa();

        // Kosongkan form setelah submit berhasil
        setFormData({

          // id_siswa: '',
          // id_admin: '',
          // nis: '',
          // nama_siswa: '',
          // jenis_kelamin: '',
          // id_tahun_pelajaran:'',
          // id_kelas: '',
          // id_rombel: '',
          // nama_wali: '',
          // nomor_wali: '',

          id_siswa: "",
          id_admin: "",
          nis: "",
          nama_siswa: "",
          jenis_kelamin: "",
          id_tahun_pelajaran: "",
          id_kelas: "",
          id_rombel: "",
          nama_wali: "",
          nomor_wali: "",
          email: "",
          pass: "",
          foto: "",
          barcode: "",

        });
      } else {
        toast.error("Gagal menambahkan data siswa");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat menambahkan data siswa");
    }
  };

  //tombol untuk filter, pindah halaman, search dan reset
  const [currentPage, setCurrentPage] = useState<number>(1); // Halaman saat ini
  const [itemsPerPage, setItemsPerPage] = useState<number>(5); // Jumlah item per halaman
  const [searchQuery, setSearchQuery] = useState<string>(""); // Query pencarian // State untuk menyimpan query pencarian

  const filteredData = Array.isArray(dataSiswa)
    ? dataSiswa.filter(
        (siswa) =>
          siswa.nama_siswa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          siswa.id_siswa?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hapus tanda kurung dari input
    const cleanValue = e.target.value.replace(/[()]/g, "");

    // Perbarui state barcode dengan nilai yang sudah dibersihkan
    setSearchQuery(cleanValue);
  };

  // Fungsi untuk mengurutkan data berdasarkan nama secara alfabetis
  const sortedData = [...filteredData].sort((a, b) => {
    if (a.nama_siswa < b.nama_siswa) return -1; // Urutkan dari A ke Z
    if (a.nama_siswa > b.nama_siswa) return 1;
    return 0;
  });

  // Menghitung pagination
  const totalData = sortedData.length; // Total item setelah difilter
  const totalPages = Math.ceil(totalData / itemsPerPage); // Total halaman

  // Menentukan data yang akan ditampilkan di halaman saat ini
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex); // Data yang ditampilkan

  // Fungsi untuk menangani perubahan halaman
  const handlePageChange = (newPage: number) => {
    // Pastikan halaman baru valid sebelum mengubah state
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Fungsi untuk menangani perubahan items per page
  const handleItemsPerPageChange = (value: number) => {
    const newItemsPerPage = Number(value);
    const newPage = Math.min(
      currentPage,
      Math.ceil(totalData / newItemsPerPage)
    );
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(newPage); // Perbarui currentPage agar tetap relevan
  };

  // Fungsi untuk mengatur ulang pencarian
  const handleResetClick = () => {
    setSearchQuery(""); // Reset search term
    setCurrentPage(1); // Reset ke halaman pertama
  };

  const isResettable = searchQuery.length > 0; // Tombol reset aktif jika ada input pencarian

  const handleDownloadFormatClick = () => {
    // Data yang akan diisikan ke dalam file Excel
    const data = [
      {
        id_siswa: "",
        id_admin: "",
        nis: "",
        nama_siswa: "",
        jenis_kelamin: "",
        id_tahun_pelajaran: "",
        id_kelas: "",
        id_rombel: "",
        // email: "",
        // pass: "",
        // foto: "",
        // barcode: "",
        nama_wali: "",
        nomor_wali: "",
      },
    ];

    // Definisikan header file Excel
    const headers = [
      "id_siswa",
      "id_admin",
      "nis",
      "nama_siswa",
      "jenis_kelamin",
      "id_tahun_pelajaran",
      "id_kelas",
      "id_rombel",
      // "email",
      // "pass",
      // "foto",
      // "barcode",
      "nama_wali",
      "nomor_wali",
    ];

    // Membuat worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    
 // Pastikan worksheet["F1"].c adalah array untuk menampung beberapa entri
// worksheet["F1"].c = tahunPelajaran.map((tahun) => ({
//   t: `Isi dengan Format ${tahun.tahun}`
// }));

// // Menggabungkan nilai `tahun` menjadi satu string dengan format yang diinginkan
// const tahunText = `Isi dengan Format:\n${tahunPelajaran.map(tahun => tahun.tahun).join('\n')}`;

// // Menambahkan ke komentar worksheet sebagai satu entri
// worksheet["F1"].c = [{ t: tahunText }];



    // Menggabungkan nilai tahun menjadi satu string dengan format yang diinginkan
    const tahunText = `Isi dengan Format:\n${tahunPelajaran
      .map((tahun) => tahun.tahun)
      .join("\n")}`;
    // Menambahkan ke komentar worksheet sebagai satu entri
    worksheet["F1"].c = [{ t: tahunText }];

    const kelasText = ` Isi dengan Format:\n${kelas
      .map((kelas) => kelas.kelas)
      .join("\n")}`;
    // Menambahkan ke komentar worksheet sebagai satu entri
    worksheet["G1"].c = [{ t: kelasText }];

    const rombelText = ` Isi dengan Format:\n${rombel
      .map((rombel) => rombel.nama_rombel)
      .join("\n")}`;
    // Menambahkan ke komentar worksheet sebagai satu entri
    worksheet["H1"].c = [{ t: rombelText }];


    // Membuat workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");

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
    link.download = "dasis.xlsx"; // Nama file yang diunduh
    link.click();
  };

  const handleUploadFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger input file secara manual
    }
  };

  // Fungsi untuk mendapatkan data admin dari API
  const getAdmins = async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/all-Admin`); // Ganti dengan endpoint API yang benar
      const data = await response.json();
      console.log("Data Admin:", data.data);
      setAdmins(data.data); // Menyimpan data admin ke state
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  // Panggil getAdmins saat pertama kali komponen dirender
  useEffect(() => {
    getAdmins();
  }, []);

  // const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();

  //     reader.onload = async (e) => {
  //       try {
  //         const data = new Uint8Array(e.target.result);
  //         const workbook = XLSX.read(data, { type: "array" });
  //         const sheetName = workbook.SheetNames[0];
  //         const sheet = workbook.Sheets[sheetName];
  //         const jsonData = XLSX.utils.sheet_to_json(sheet);

  //         // Mengambil data tahun ajaran dari API
  //         const tahunResponse = await fetch(
  //           `${baseUrl}/tahun-pelajaran/all-tahun-pelajaran`
  //         ); // Ganti dengan endpoint API yang benar
  //         const tahunData = await tahunResponse.json();
  //         console.log("Respons API tahunData:", tahunData);
  //         const tahunMap = new Map(
  //           tahunData.data.map((item: TahunAjaran) => [item.tahun, item.id_tahun_pelajaran])
  //         );
  //         // console.log("Mapping Tahun:", [...tahunMap]);

  //         // Mengambil data kelas dari API
  //         const kelasResponse = await fetch(`${baseUrl}/kelas/all-kelas`); // Ganti dengan endpoint API yang benar
  //         const kelasData = await kelasResponse.json();
  //         console.log("Respons API kelasData:", kelasData);
  //         const kelasMap = new Map(
  //           kelasData.data.map((item: Kelas) => [item.kelas, item.id_kelas])
  //         );
  //         // console.log("Mapping Kelas:", [...kelasMap]);

  //         // Mengambil data rombel dari API
  //         const rombelResponse = await fetch(`${baseUrl}/rombel/all-rombel`); // Ganti dengan endpoint API yang benar
  //         const rombelData = await rombelResponse.json();
  //         console.log("Respons API rombelData:", rombelData);
  //         const rombelMap = new Map(
  //           rombelData.data.map((item: Rombel) => [item.nama_rombel, item.id_rombel])
  //         );
  //         // console.log("Mapping Rombel:", [...rombelMap]);

  //         // Mapping data dari Excel dengan mengganti id_tahun_pelajaran yang sesuai
  //         const updatedData = jsonData.map((row) => {
  //           // console.log(`Mencari ID Tahun untuk: ${row.id_tahun_pelajaran}`);
  //           const cleanedTahun = String((row as { id_tahun_pelajaran: any }).id_tahun_pelajaran).trim();
  //           // console.log(`ID Tahun yang dibersihkan: ${cleanedTahun}`);
  //           const tahunAjaran = tahunMap.get(cleanedTahun);
  //           // console.log(`Tahun Ajaran ditemukan: ${tahunAjaran}`);

  //           // console.log(`Mencari ID Kelas untuk: ${row.id_kelas}`);
  //           const cleanedKelas = String((row as { id_kelas: any }).id_kelas).trim();
  //           // console.log(`ID Kelas yang dibersihkan: ${cleanedKelas}`);
  //           const kelas = kelasMap.get(cleanedKelas);
  //           // console.log(`Kelas ditemukan: ${kelas}`);

  //           // console.log(`Mencari ID Rombel untuk: ${row.id_rombel}`);
  //           const cleanedRombel = String((row as { id_rombel: any }).id_rombel).trim();
  //           // console.log(`ID Rombel yang dibersihkan: ${cleanedRombel}`);
  //           const rombel = rombelMap.get(cleanedRombel);
  //           // console.log(`Rombel ditemukan: ${rombel}`);

  //           return {
  //             id_siswa: (row as { id_siswa: string | number }).id_siswa || "-",
  //             id_admin: formData.id_admin || "-", // Menggunakan idAdmin dari formData
  //             nis: (row as { nis: string }).nis || "-",
  //             nama_siswa: (row as { nama_siswa: string }).nama_siswa || "-",
  //             jenis_kelamin: (row as { jenis_kelamin: string }).jenis_kelamin || "-",
  //             id_tahun_pelajaran: tahunAjaran || "-",
  //             id_kelas: kelas || "-",
  //             id_rombel: rombel || "-",
  //             nama_wali: (row as { nama_wali: string }).nama_wali || "-",
  //             nomor_wali: (row as { nomor_wali: string }).nomor_wali || "-",
  //           };
  //         });

  //         // Tampilkan data yang sudah dimodifikasi
  //         // console.log("Data dari Excel yang sudah dimodifikasi:", updatedData);

  //         setDataSiswa(updatedData as Siswa[]); // Simpan data ke state

  //         // Kirim data yang sudah dimodifikasi ke server
  //         const response = await fetch(`${baseUrl}/siswa/add-siswa`, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(updatedData), // Kirim data yang sudah dimodifikasi
  //         });

  //         const result = await response.json();
  //         if (response.ok) {
  //           console.log("Data berhasil dikirim", result);
  //           // Ambil data terbaru setelah sukses menyimpan
  //           const updatedSiswaResponse = await fetch(
  //             `${baseUrl}/siswa/all-siswa`
  //           );
  //           const updatedSiswaData = await updatedSiswaResponse.json();
  //           setDataSiswa(updatedSiswaData.data); // Update state dengan data terbaru
  //           toast.success("Data siswa berhasil ditambahkan!");
  //         } else {
  //           console.error(
  //             "Gagal mengirim data:",
  //             result.error || response.statusText
  //           );
  //           toast.error("Gagal menambahkan data siswa");
  //         }
  //       } catch (error) {
  //         console.error("Error membaca file Excel atau mengirim data:", error);
  //         toast.error("Terjadi kesalahan saat mengolah data");
  //       }
  //     };

  //     reader.readAsArrayBuffer(file); // Mulai membaca file Excel
  //   }
  // };
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return; // Jika tidak ada file, hentikan fungsi

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        // Validasi result dari FileReader
        const result = e.target?.result;
        if (!result || !(result instanceof ArrayBuffer)) {
          throw new Error(
            "FileReader.result bukan ArrayBuffer atau undefined."
          );
        }

        // Konversi data ke Uint8Array untuk dibaca oleh XLSX
        const data = new Uint8Array(result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Ambil data dari API secara paralel
        const [tahunResponse, kelasResponse, rombelResponse] =
          await Promise.all([
            fetch(`${baseUrl}/tahun-pelajaran/all-tahun-pelajaran`),
            fetch(`${baseUrl}/kelas/all-kelas`),
            fetch(`${baseUrl}/rombel/all-rombel`),
          ]);

        if (!tahunResponse.ok || !kelasResponse.ok || !rombelResponse.ok) {
          throw new Error("Gagal mengambil data dari API.");
        }

        // Parse response JSON
        const [tahunData, kelasData, rombelData] = await Promise.all([
          tahunResponse.json(),
          kelasResponse.json(),
          rombelResponse.json(),
        ]);

        // Buat mapping untuk tahun ajaran, kelas, dan rombel
        const tahunMap = new Map(
          tahunData.data.map((item: TahunAjaran) => [
            item.tahun,
            item.id_tahun_pelajaran,
          ])
        );
        const kelasMap = new Map(
          kelasData.data.map((item: Kelas) => [item.kelas, item.id_kelas])
        );
        const rombelMap = new Map(
          rombelData.data.map((item: Rombel) => [
            item.nama_rombel,
            item.id_rombel,
          ])
        );

        // Mapping data Excel dengan id dari API
        const updatedData = jsonData.map((row) => {
          const cleanedTahun = String(
            (row as { id_tahun_pelajaran: any }).id_tahun_pelajaran
          ).trim();
          const cleanedKelas = String(
            (row as { id_kelas: any }).id_kelas
          ).trim();
          const cleanedRombel = String(
            (row as { id_rombel: any }).id_rombel
          ).trim();

          return {
            id_siswa: (row as { id_siswa: string | number }).id_siswa || "-",
            id_admin: formData.id_admin || "-", // id_admin diambil dari state formData
            nis: (row as { nis: string }).nis || "-",
            nama_siswa: (row as { nama_siswa: string }).nama_siswa || "-",
            jenis_kelamin:
              (row as { jenis_kelamin: string }).jenis_kelamin || "-",
            id_tahun_pelajaran: tahunMap.get(cleanedTahun) || "-",
            id_kelas: kelasMap.get(cleanedKelas) || "-",
            id_rombel: rombelMap.get(cleanedRombel) || "-",
            nama_wali: (row as { nama_wali: string }).nama_wali || "-",
            nomor_wali: (row as { nomor_wali: string }).nomor_wali || "-",
          };
        });

        // Simpan data ke state
        setDataSiswa(updatedData as Siswa[]);

        // Kirim data ke server
        const response = await fetch(`${baseUrl}/siswa/add-siswa`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        const result1 = await response.json();
        if (response.ok) {
          console.log("Data berhasil dikirim", result1);

          // Ambil data terbaru dari server
          const updatedSiswaResponse = await fetch(
            `${baseUrl}/siswa/all-siswa`
          );
          if (updatedSiswaResponse.ok) {
            const updatedSiswaData = await updatedSiswaResponse.json();
            setDataSiswa(updatedSiswaData.data);
            toast.success("Data siswa berhasil ditambahkan!");
          } else {
            toast.error("Gagal memperbarui data siswa dari server.");
          }
        } else {
          console.error(
            "Gagal mengirim data:",
            result1.error || response.statusText
          );
          toast.error("Gagal menambahkan data siswa.");
        }
      } catch (error) {
        console.error("Error membaca file Excel atau mengirim data:", error);
        toast.error("Terjadi kesalahan saat mengolah data.");
      }
    };

    reader.readAsArrayBuffer(file); // Mulai membaca file
  };

  return (
    <>
      <div className="rounded-lg max-w-full bg-slate-100">
        <div className="pt-8 ml-7">
          <h1 className="text-2xl font-bold">Data Siswa</h1>
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
                  Siswa
                </a>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li className="text-gray-500">Data Siswa</li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Column 1: Input */}
          <div className="w-full lg:w-1/3 p-4 lg:p-6">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border relative">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form Input Fields */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="">
                    <label className="block text-sm font-medium">
                      ID Siswa
                    </label>
                    <input
                      type="text"
                      name="id_siswa"
                      value={formData.id_siswa}
                      onChange={handleChange}
                      className="mt-1 p-2 border rounded-md w-full "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">NIS</label>
                    <input
                      type="text"
                      id="nis-input"
                      name="nis"
                      value={formData.nis}
                      onChange={handleChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Nama Siswa
                    </label>
                    <input
                      type="text"
                      id="nama-siswa-input"
                      name="nama_siswa"
                      value={formData.nama_siswa}
                      onChange={handleChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Jenis Kelamin
                    </label>
                    <select
                      name="jenis_kelamin"
                      id="jenis-kelamin-input"
                      value={formData.jenis_kelamin}
                      onChange={handleChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    >
                      <option value="">Pilih</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="id_tahun_pelajaran"
                      className="block text-sm font-medium"
                    >
                      Tahun Pelajaran:
                    </label>
                    <select
                      name="id_tahun_pelajaran"
                      value={selectedTahun}
                      onChange={handleTahunChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    >
                      <option>Pilih Tahun Pelajaran</option>
                      {sortedTahunPelajaran.map((tahun) => (
                        <option
                          key={tahun.id_tahun_pelajaran}
                          value={tahun.id_tahun_pelajaran}
                        >
                          {tahun.tahun}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="id_kelas"
                      className="block text-sm font-medium"
                    >
                      Kelas:
                    </label>
                    <select
                      name="id_kelas"
                      value={selectedKelas}
                      onChange={handleKelasChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    >
                      <option>Pilih Kelas</option>
                      {sortedKelas.map((kelas) => (
                        <option key={kelas.id_kelas} value={kelas.id_kelas}>
                          {kelas.kelas}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="id_rombel"
                      className="block text-sm font-medium"
                    >
                      Jurusan:
                    </label>
                    <select
                      name="id_rombel"
                      value={selectedRombel}
                      onChange={handleRombelChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    >
                      <option>Pilih Jurusan</option>
                      {sortedRombel.map((rombel) => (
                        <option key={rombel.id_rombel} value={rombel.id_rombel}>
                          {rombel.nama_rombel}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    />
                  </div>
                  <div className="relative w-full">
                    <label className="block text-sm font-medium">
                      Password
                    </label>
                    <input
                      type={passwordVisible ? "text" : "password"} // Ubah tipe input berdasarkan state
                      name="pass"
                      value={formData.pass}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    />
                    <span
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-2 pt-3 flex items-center cursor-pointer text-gray-600"
                    >
                      {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Foto</label>
                    <input
                      type="file"
                      name="foto"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    />
                    {fotoPreview && (
                      <img
                        src={fotoPreview}
                        alt="Preview Foto"
                        className="mt-2 h-20 w-20"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Barcode</label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Nama Wali
                    </label>
                    <input
                      type="text"
                      name="nama_wali"
                      value={formData.nama_wali}
                      onChange={handleChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Nomor Wali
                    </label>
                    <input
                      type="text"
                      name="nomor_wali"
                      value={formData.nomor_wali}
                      onChange={handleChange}
                      className="mt-1 p-2 border rounded-md w-full"
                    />
                  </div>

                  {/* Sembunyikan bagian lainnya jika tidak diperlukan */}
                </div>

                {/* Tombol Simpan */}
                <div className=" flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="px-2 py-1 sm:px-4 sm:py-2 bg-teal-400 hover:bg-teal-500 text-white rounded text-sm md:text-sm sm:text-sm  sm:-mr-2 lg:py-2"
                  >
                    Simpan
                  </button>
                </div>
              </form>
              <div className="flex flex-col md:flex-row flex-wrap items-start md:-ml-2 md:-mt-10 lg:-mt-9 -mt-12  space-y-2 md:space-y-0 md:space-x-1.5">
                <button
                  onClick={handleDownloadFormatClick}
                  className="px-2 py-1 sm:px-3 sm:py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs sm:text-sm"
                >
                  Unduh Format
                </button>

                <button
                  onClick={handleUploadFileClick}
                  className="px-2 py-1 sm:px-3 sm:py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs sm:text-sm pr-6"
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
                      Tabel Siswa
                    </h2>
                  </div>
                </div>
                {/* Filter Dropdown */}
                <div className="flex flex-wrap justify-start items-center w-full mt-4">
                  {/* Div untuk Items per Page (sebelah kiri) */}
                  <div className="flex items-center">
                    <select
                      id="items-per-page"
                      value={itemsPerPage}
                      onChange={(e) =>
                        handleItemsPerPageChange(parseInt(e.target.value))
                      }
                      className="p-2 border border-gray-300 rounded text-sm sm:text-base"
                    >
                      <option value={1}>1</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>

                  {/* Div untuk Search (sebelah kanan) */}
                  <div className="flex items-center sm:mt-0 ml-3">
                    <input
                      id="search"
                      type="text"
                      placeholder="Search by Name"
                      value={searchQuery}
                      onChange={handleSearch}
                      className="p-2 border ml-3 border-gray-300 rounded text-sm sm:text-base w-36"
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
                      <p>Reset</p>
                    </button>
                  </div>

                  {/* Tombol Hapus Siswa Terpilih dengan margin kiri dan atas */}
                  <div className="ml-3 ">
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
                    columns={
                      siswaColumns as {
                        header: string;
                        accessor: keyof Siswa;
                        Cell?: ({ row }: { row: Siswa }) => JSX.Element;
                      }[]
                    }
                    data={paginatedData}
                    // onEdit={handleEdit}
                    // onDelete={handleDelete}
                  />
                  {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="bg-white rounded p-4 shadow-lg">
                        <h3 className="pb-2">Edit Data Siswa</h3>
                        <form onSubmit={handleEditSubmit}>
                          <input
                            type="text"
                            name="nis"
                            value={editData ? editData.nis : ""}
                            onChange={handleEditChange}
                            placeholder="NIS"
                            className="mt-1 p-2 border rounded-md w-full"
                          />
                          <input
                            type="text"
                            name="nama_siswa"
                            value={editData ? editData.nama_siswa : ""}
                            onChange={handleEditChange}
                            placeholder="Nama Siswa"
                            className="mt-1 p-2 border rounded-md w-full"
                          />
                          <select
                            name="jenis_kelamin"
                            value={editData ? editData.jenis_kelamin : ""}
                            onChange={handleEditChange}
                            className="mt-1 p-2 border rounded-md w-full"
                          >
                            <option value="">Pilih</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                          </select>
                          <select
                            name="id_tahun_pelajaran"
                            value={selectedEditTahun}
                            onChange={handleEditTahunChange}
                            className="mt-1 p-2 border rounded-md w-full"
                          >
                            <option>Pilih Tahun Pelajaran</option>
                            {tahunEditPelajaran.map((tahun) => (
                              <option
                                key={tahun.id_tahun_pelajaran}
                                value={tahun.id_tahun_pelajaran}
                              >
                                {tahun.tahun}
                              </option>
                            ))}
                          </select>
                          <select
                            name="id_kelas"
                            value={selectedEditKelas}
                            onChange={handleEditKelasChange}
                            className="mt-1 p-2 border rounded-md w-full"
                          >
                            <option>Pilih Kelas</option>
                            {kelas.map((kelas) => (
                              <option
                                key={kelas.id_kelas}
                                value={kelas.id_kelas}
                              >
                                {kelas.kelas}
                              </option>
                            ))}
                          </select>
                          <select
                            name="id_rombel"
                            value={selectedEditRombel}
                            onChange={handleEditRombelChange}
                            className="mt-1 p-2 border rounded-md w-full"
                          >
                            <option>Pilih Rombel</option>
                            {rombel.map((rombel) => (
                              <option
                                key={rombel.id_rombel}
                                value={rombel.id_rombel}
                              >
                                {rombel.nama_rombel}
                              </option>
                            ))}
                          </select>
                          <input
                            type="email"
                            name="email"
                            value={editData?.email || ""}
                            onChange={handleEditChange}
                            placeholder="Email (Opsional)"
                            className="mt-1 p-2 border rounded-md w-full"
                          />
                          <input
                            type="password"
                            name="pass"
                            value={editData ? editData.pass : ""}
                            onChange={handleEditChange}
                            placeholder="Password (Opsional)"
                            className="mt-1 p-2 border rounded-md w-full"
                          />
                          <input
                            type="text"
                            name="nama_wali"
                            value={editData ? editData.nama_wali : ""}
                            onChange={handleEditChange}
                            placeholder="Nama Wali"
                            className="mt-1 p-2 border rounded-md w-full"
                          />
                          <input
                            type="text"
                            name="nomor_wali"
                            value={editData ? editData.nomor_wali : ""}
                            onChange={handleEditChange}
                            placeholder="Nomor Wali"
                            className="mt-1 p-2 border rounded-md w-full"
                          />
                          <input
                            type="file"
                            name="foto"
                            onChange={handleEditChange}
                            placeholder="Foto (Opsional)"
                            className="mt-1 p-2 border rounded-md w-full"
                          />
                          <input
                            type="text"
                            name="barcode"
                            value={editData ? editData.barcode : ""}
                            onChange={handleEditChange}
                            placeholder="Barcode (Opsional)"
                            className="mt-1 p-2 border rounded-md w-full"
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

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-white">
                    Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}
                  </div>
                  <div className="flex m-4 space-x-2">
                    <button
                      disabled={currentPage === 1}
                      className={`px-2 py-1 border rounded ${
                        currentPage === 1
                          ? "bg-gray-300"
                          : "bg-teal-400 hover:bg-teal-600 text-white"
                      }  `}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage === totalPages || paginatedData.length === 0
                      }
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
//       if (typeof onClose === "function") {
//         onClose(); // Memanggil fungsi onClose untuk menutup dropdown
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
//         className="p-1 z-40 text-white text-xs sm:text-sm"
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
