"use client";
import React, { useState, useEffect, useRef } from "react";
import DataTable from "@/app/components/dataTabel";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import { useRouter } from "next/navigation";
import {
  addGuru,
  fetchGuru,
  deleteGuru,
  updateGuru,
  // Guru,
} from "@/app/api/guru";
import useUserInfo from "@/app/components/useUserInfo";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { json } from "stream/consumers";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface GuruRow {
  id_guru: string;
  id_admin: string;
  nip: string | number;
  nama_guru: string;
  jenis_kelamin: string;
  no_telp: string | number;
  email: string;
  pas: string;
  walas: string;
  staf: string;
  barcode:string;
  foto: string| File | null;
  // Tambahkan properti lain sesuai dengan struktur data yang Anda miliki
}
interface Kelas {
  id_siswa: string;
  id_kelas: string;
  kelas: string;
}

interface Guru {
  id_guru: string;
  foto: string| File | null;
  id_admin: string;
  nama_guru: string;
  nip: string;
  jenis_kelamin: string;
  email: string;
  walas: string;
  staf: string;
  barcode: string;
  no_telp: string;
  pas: string;
}

export default function DataGuru() {
  const [kelas, setKelas] = useState([]);
  const [rombel, setRombel] = useState([]);
  const [mapel, setMapel] = useState([]);
  const [kelas1, setKelas1] = useState<Kelas[]>([]);
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
  useEffect(() => {
    const fetchRombel = async () => {
      try {
        const response = await axios.get(`${baseUrl}/rombel/all-rombel`); // Sesuaikan dengan URL API Anda
        setRombel(response.data.data);
        console.log("data berhasil di fetch", response);
      } catch (error) {
        console.error("Error fetching jurusan:", error);
      }
    };

    fetchRombel();
  }, []);
  useEffect(() => {
    const fetchMapel = async () => {
      try {
        const response = await axios.get(`${baseUrl}/mapel/all-mapel`); // Sesuaikan dengan URL API Anda
        setMapel(response.data.data);
        console.log("data berhasil di fetch", response);
      } catch (error) {
        console.error("Error fetching jurusan:", error);
      }
    };

    fetchMapel();
  }, []);
  const fetchKelasSiswaTotal = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/joinNonMaster/total-kelas-siswa`
      );
      setKelas1(response.data.data);
      console.log("ini siswa", response.data);
    } catch (error) {
      console.error("Fetch error:", error); // Menangani kesalahan
    }
  };
  useEffect(() => {
    fetchKelasSiswaTotal(); // Panggil fungsi fetch saat komponen di-mount
  }, []);
  const handleDownloadFormatClick = () => {
    // Data yang akan diisikan ke dalam file Excel untuk Mapel
    const data = [
      {
        id_guru: "",
        id_admin: idAdmin || "",
        nip: "",
        nama_guru: "",
        jenis_kelamin: "",
        no_telp: "",
        email: "",
        pas: "",
        walas: "",
        staf: "",
        barcode: "",
        foto: "",
      },
    ];

    // Definisikan header file Excel
    const headers = [
      "id_guru",
      "id_admin",
      "nip",
      "nama_guru",
      "jenis_kelamin",
      "no_telp",
      "email",
      "pas",
      "walas",
      "staf",
      "barcode",
      "foto",
    ];
    console.log("ini format", headers);
    // Membuat worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    // const kelasText = ` Isi dengan Format:\n${kelas
    //   .map((kelas) => kelas.kelas)
    //   .join("\n")}`;
    // // Menambahkan ke komentar worksheet sebagai satu entri
    // worksheet["I1"].c = [{ t: kelasText }];
    // const rombelText = ` Isi dengan Format:\n${rombel
    //   .map((rombel) => rombel.nama_rombel)
    //   .join("\n")}`;
    // // Menambahkan ke komentar worksheet sebagai satu entri
    // worksheet["J1"].c = [{ t: rombelText }];
    // const mapelText = ` Isi dengan Format:\n${mapel
    //   .map((mapel) => mapel.nama_mapel)
    //   .join("\n")}`;
    // // Menambahkan ke komentar worksheet sebagai satu entri
    // worksheet["H1"].c = [{ t: mapelText }];

    // Membuat workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guru");

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
    link.download = "format_guru.xlsx"; // Nama file yang diunduh
    link.click();
  };
  const handleUploadFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger input file secara manual
    }
  };
  const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet) as GuruRow[]; // Memberikan tipe array dengan objek SiswaRow
          const formattedData = jsonData.map((row) => ({
            id_guru: row.id_guru || "-",
            id_admin: row.id_admin || "-",
            nip: String(row.nip), // Pastikan nip dikonversi menjadi string
            nama_guru: row.nama_guru || "-",
            jenis_kelamin: row.jenis_kelamin || "-",
            no_telp: String(row.no_telp), // Pastikan no_telp juga dikonversi jika perlu
            email: row.email || "-",
            pas: row.pas || "-",
            walas: row.walas || "-",
            staf: row.staf || "-",
            barcode: row.barcode || "-",
            foto: row.foto || "-",
          }));

          console.log("Data dari Excel:", jsonData); // Log data dari Excel
          setDataGuru(formattedData); // Simpan data ke state

          // Lakukan pengiriman data ke server setelah file diproses
          const response = await fetch(`${baseUrl}/guru/add-guru`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedData),
          });

          const result = await response.json();

          if (response.ok) {
            console.log("Data berhasil dikirim", result);
          } else {
            console.error(
              "Gagal mengirim data:",
              result.error || response.statusText
            );
          }
        } catch (error) {
          console.error("Error membaca file Excel atau mengirim data:", error);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const [guru, setGuru] = useState<Guru[]>([]);
  const [editData, setEditData] = useState<Guru | null>(null);
  const [isModalEdit, setIsModalEdit] = useState(false); // State untuk mengontrol modal
  const [selectedRow, setSelectedRow] = useState<Guru | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isGuruValid, setIsGuruValid] = useState(true);
  const [dataGuru, setDataGuru] = useState<Guru[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // Menyimpan ID baris yang dropdown-nya terbuka
  const handleToggleDropdown = (id_guru: string) => {
    setOpenDropdownId((prev) => (prev === id_guru ? null : id_guru)); // Toggle dropdown
  };
  const [rombelList, setRombelList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [isWalasEnabled, setIsWalasEnabled] = useState(false); // State untuk kontrol on/off
  const [isStaffEnabled, setIsStaffEnabled] = useState(false);
  const [isWalasEditEnabled, setIsWalasEditEnabled] = useState(false);
  const [isStaffEditEnabled, setIsStaffEditEnabled] = useState(false);
  const { idAdmin } = useUserInfo();
  const [admins, setAdmins] = useState<
    { id_admin: string; nama_admin: string }[]
  >([]);
  const handleToggle = () => {
    setIsWalasEnabled((prevState) => {
      const newState = !prevState;

      // Jika toggle dimatikan (isWalasEnabled false), kosongkan nilai walas
      if (!newState) {
        setGuruData((prevData) => ({
          ...prevData,
          walas: "", // Kosongkan input walas
        }));
      }

      return newState;
    });
  };
  const handleToggleWalasEdit = () => {
    setIsWalasEditEnabled((prevState) => {
      const newState = !prevState;

      // Jika toggle dimatikan (isWalasEnabled false), kosongkan nilai walas
      if (!newState) {
        setEditData((prevData) => {
          if (!prevData) return null; // Mengembalikan null jika prevData null
          return {
            ...prevData,
            walas: newState ? prevData?.walas || "" : "",
          };
        });
      }

      return newState;
    });
  };
  const handleToggleStaff = () => {
    setIsStaffEnabled((prevState) => {
      const newState = !prevState;

      // Jika toggle dimatikan (isWalasEnabled false), kosongkan nilai walas
      if (!newState) {
        setGuruData((prevData) => ({
          ...prevData,
          staf: "", // Kosongkan input walas
        }));
      }

      return newState;
    });
  };
  const handleToggleStaffEdit = () => {
    setIsStaffEditEnabled((prevState) => {
      const newState = !prevState;

      // Jika toggle dimatikan (isWalasEnabled false), kosongkan nilai walas
      if (!newState) {
        setEditData((prevData) => {
          if (!prevData) return null; // Mengembalikan null jika prevData null
          return {
            ...prevData,
            staf: newState ? prevData?.staf || "" : "",
          };
        });
      }

      return newState;
    });
  }
  const fetchGuru = async (): Promise<AxiosResponse<{ data: Guru[] }>> => {
    const response = await axios.get(`${baseUrl}/guru/all-guru`);
    return response; // respons ini memiliki properti data
  };
  
  useEffect(() => {
    const loadGuru = async () => {
      const response = await fetchGuru();
      const data = response.data; // Mengakses data di dalam response
      setGuru(data.data); // Menyimpan data yang diperoleh ke dalam state
    };
    loadGuru();
  }, []);
  
  
  // useEffect(() => {
  //   //   const token = Cookies.get('token');
  //   //   console.log(token)
  //   // if (!token) {
  //   //   router.push('../../../login');
  //   //   return;
  //   // }

  //   // axios.defaults.headers.common['Authorization'] = token;
  //   const loadGuru = async () => {
  //     try {
  //       const response = await fetchGuru();
  //       console.log("Data guru yang diterima:", response); // Lihat data yang diterima

  //       // Pastikan data adalah array, jika bukan maka jadikan array
  //       const guruData = Array.isArray(response.data)
  //         ? response.data
  //         : [response.data];

  //       setGuru(guruData); // Menggunakan data dalam bentuk array
  //     } catch (error) {
  //       console.error("Error fetching guru data:", error);
  //     }
  //   };
  //   loadGuru();
  // }, []);
  // Ambil data rombel dari backend saat komponen dimuat
  useEffect(() => {
    const fetchRombel = async () => {
      try {
        const response = await axios.get(`${baseUrl}/rombel/all-rombel`);
        console.log("Data rombel yang diterima:", response.data); // Lihat data yang diterima
        if (Array.isArray(response.data.data)) {
          setRombelList(response.data.data); // Pastikan data adalah array
        } else {
          console.error("Data tidak dalam format array");
        }
      } catch (error) {
        console.error("Error fetching rombel data:", error);
      }
    };
    fetchRombel();
  }, []);
  // Ambil data Kelas dari backend saat komponen dimuat
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const response = await axios.get(`${baseUrl}/kelas/all-kelas`);
        console.log("Data Kelas yang diterima:", response.data); // Lihat data yang diterima
        if (Array.isArray(response.data.data)) {
          setKelasList(response.data.data); // Pastikan data adalah array
        } else {
          console.error("Data tidak dalam format array");
        }
      } catch (error) {
        console.error("Error fetching Kelas data:", error);
      }
    };
    fetchKelas();
  }, []);
  // Ambil data Mapel dari backend saat komponen dimuat
  useEffect(() => {
    const fetchMapel = async () => {
      try {
        const response = await axios.get(`${baseUrl}/mapel/all-mapel`);
        console.log("Data Mapel yang diterima:", response.data); // Lihat data yang diterima
        if (Array.isArray(response.data.data)) {
          setMapelList(response.data.data); // Pastikan data adalah array
        } else {
          console.error("Data tidak dalam format array");
        }
      } catch (error) {
        console.error("Error fetching Mapel data:", error);
      }
    };
    fetchMapel();
  }, []);
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
      setGuruData((prevData) => ({
        ...prevData,
        id_admin: idAdmin,
      }));
    }
  }, [idAdmin]);

  const handleDetailClick = (row: Guru) => {
    const admin = admins.find((admin) => admin.id_admin === row.id_admin); // Cari admin berdasarkan id_admin
    console.log("id admin", admin);
    const namaAdmin = admin ? admin.nama_admin : "Tidak ada"; // Jika ditemukan, ambil nama_admin
    console.log("iki admin", namaAdmin);
    Swal.fire({
      html: `
        <div style="text-align: center;">
          <p>${JSON.stringify(row.nama_guru) || "Tidak ada"}</p>
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
  
  const guruColumns = [
    {
      header: "Admin",
      accessor: "id_admin" as keyof Guru,
      Cell: ({ row }: { row: Guru }) => {
        const admin = admins.find((admin) => admin.id_admin === row.id_admin);
        return admin ? admin.nama_admin : "Tidak Diketahui";
      },
    },
    { header: "Guru", accessor: "nama_guru" as keyof Guru },
    { header: "Nip", accessor: "nip" as keyof Guru },
    { header: "Jk", accessor: "jenis_kelamin" as keyof Guru },
    { header: "Email", accessor: "email" as keyof Guru },
    { header: "Walas", accessor: "walas" as keyof Guru },
    { header: "Staff", accessor: "staf" as keyof Guru },
    { header: "Barcode", accessor: "barcode" as keyof Guru },
    { header: "No", accessor: "no_telp" as keyof Guru },
    // Kolom Aksi tidak membutuhkan accessor
    {
      header: "Aksi",
      Cell: ({ row }: { row: Guru }) => {
        return (
          <div>
            <button
              className="px-4 py-2 rounded"
              onClick={() => handleToggleDropdown(row.id_guru)}
            >
              &#8942; {/* Simbol menu */}
            </button>
            {openDropdownId === row.id_guru && (
              <div
                className="absolute mt-2 bg-white border rounded shadow-md lg:-ml-2"
                style={{ marginLeft: "-450px" }}
              >
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
                  className="block w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-200"
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
  
  
  const [guruData, setGuruData] = useState<Guru>({
    id_guru: "",
    id_admin: idAdmin || "",
    nip: "",
    nama_guru: "",
    jenis_kelamin: "",
    no_telp: "",
    email: "",
    pas: "",
    foto: "",
    walas: "",
    staf: "",
    barcode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGuruData({
      ...guruData,
      [name]: value,
    });
  };
  // const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value, checked } = e.target;
  //   setGuruData((prevData) => {
  //     if (checked) {
  //       // Tambahkan mapel yang dipilih
  //       return {
  //         ...prevData,
  //         id_kelas: [...prevData.id_kelas, value],
  //       };
  //     } else {
  //       // Hapus id_kelas yang tidak dipilih
  //       return {
  //         ...prevData,
  //         id_kelas: prevData.id_kelas.filter((kelas) => kelas !== value),
  //       };
  //     }
  //   });
  // };
  // const handleJurusanChange = (e) => {
  //   const { value, checked } = e.target;
  //   setGuruData((prevData) => {
  //     if (checked) {
  //       // Tambahkan rombel yang dipilih
  //       return {
  //         ...prevData,
  //         id_rombel: [...prevData.id_rombel, value],
  //       };
  //     } else {
  //       // Hapus rombel yang tidak dipilih
  //       return {
  //         ...prevData,
  //         id_rombel: prevData.id_rombel.filter((rombel) => rombel !== value),
  //       };
  //     }
  //   });
  // };
  // // Fungsi untuk menangani perubahan checkbox
  // const handleMapelChange = (e) => {
  //   const { value, checked } = e.target;
  //   setGuruData((prevData) => {
  //     if (checked) {
  //       // Tambahkan mapel yang dipilih
  //       return {
  //         ...prevData,
  //         id_mapel: [...prevData.id_mapel, value],
  //       };
  //     } else {
  //       // Hapus id_mapel yang tidak dipilih
  //       return {
  //         ...prevData,
  //         id_mapel: prevData.id_mapel.filter((mapel) => mapel !== value),
  //       };
  //     }
  //   });
  // };
  // const handleEditRombel = (e) => {
  //   const { value, checked } = e.target;
  //   setEditData((prevData) => {
  //     // Pastikan prevData.id_kelas adalah array
  //     const currentRombel = Array.isArray(prevData.id_rombel)
  //       ? prevData.id_rombel
  //       : [];
  //     const updatedRombel = checked
  //       ? [...currentRombel, value] // Tambahkan kelas jika checked
  //       : currentRombel.filter((rombel) => rombel !== value); // Hapus kelas jika unchecked
  //     return {
  //       ...prevData,
  //       id_rombel: updatedRombel,
  //     };
  //   });
  // };
  // const handleEditCheckboxChange = (e) => {
  //   const { value, checked } = e.target;
  //   setEditData((prevData) => {
  //     // Pastikan prevData.id_kelas adalah array
  //     const currentKelas = Array.isArray(prevData.id_kelas)
  //       ? prevData.id_kelas
  //       : [];
  //     const updatedKelas = checked
  //       ? [...currentKelas, value] // Tambahkan kelas jika checked
  //       : currentKelas.filter((kelas) => kelas !== value); // Hapus kelas jika unchecked
  //     return {
  //       ...prevData,
  //       id_kelas: updatedKelas,
  //     };
  //   });
  // };
  // const handleMapelCheckboxChange = (e) => {
  //   const { value, checked } = e.target;
  //   setEditData((prevData) => {
  //     // Pastikan prevData.id_kelas adalah array
  //     const currentMapel = Array.isArray(prevData.id_mapel)
  //       ? prevData.id_mapel
  //       : [];
  //     const updatedMapel = checked
  //       ? [...currentMapel, value] // Tambahkan kelas jika checked
  //       : currentMapel.filter((mapel) => mapel !== value); // Hapus kelas jika unchecked
  //     return {
  //       ...prevData,
  //       id_mapel: updatedMapel,
  //     };
  //   });
  // };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null; // Ambil file pertama yang dipilih

    // Perbarui `editData` dengan file tersebut
    setEditData((prevData) => {
      if (!prevData) {
        // Jika prevData null, kembalikan objek dengan semua properti default
        return {
          id_guru: "", // atau nilai default lainnya yang sesuai
          id_admin: "",
          nip: "",
          nama_guru: "",
          jenis_kelamin: "",
          email: "",
          pas: "",
          walas: "",
          staf: "",
          barcode: "",
          no_telp: "",
          foto: file, // Menambahkan foto yang diunggah
        };
      }
      // Jika prevData ada, hanya update foto
      return {
        ...prevData,
        foto: file, // Update hanya foto
      };
    });
    
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Validasi: Pastikan semua field tidak kosong
    if (!guruData.nama_guru) {
      toast.error("Data guru tidak boleh kosong");
      return;
    }
  
    try {
      const response = await addGuru([guruData]); // Menggunakan addGuru yang mengembalikan AddGuruResponse
      console.log("API response:", response);
      console.log("Data yang dikirim ke backend:", [guruData]);
      
      // Cek status respon
      if (response?.results?.some((result) => result.status === "Gagal")) {
        toast.error("Data sudah ada!");
        return;
      } else {
        toast.success("Guru berhasil ditambahkan!");
  
        // Update GuruList dengan data baru tanpa refresh
        setGuru((prevGuruList) => [
          ...prevGuruList,
          {
            id_guru: guruData.id_guru || "-",
            id_admin: guruData.id_admin || "-",
            nip: guruData.nip || "-",
            nama_guru: guruData.nama_guru || "-",
            jenis_kelamin: guruData.jenis_kelamin || "-",
            no_telp: guruData.no_telp || "-",
            email: guruData.email || "-",
            pas: guruData.pas || "-",
            foto: guruData.foto || "-",
            walas: guruData.walas || "-",
            staf: guruData.staf || "-",
            barcode: guruData.barcode || "-",
          },
        ]);
  
        // Reset form
        setGuruData({
          id_guru: "",
          id_admin: idAdmin || "",
          nip: "",
          nama_guru: "",
          jenis_kelamin: "",
          no_telp: "",
          email: "",
          pas: "",
          foto: "",
          walas: "",
          staf: "",
          barcode: "",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        toast.error("Terjadi kesalahan saat menambah guru: " + error.response?.data.message);
      } else {
        console.error("Unknown error:", error);
        toast.error("Terjadi kesalahan saat menambah guru");
      }
    }
  };
  
  
  // Fungsi untuk handle klik edit
  const handleEditClick = (row: Guru) => {
    setEditData(row); // Set data yang dipilih ke form edit
    setIsModalEdit(true); // Buka modal saat tombol edit diklik
  };
  // Handle perubahan input pada form edit
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update hanya field yang diedit dalam `editData`
    setEditData((prevData) => {
      if (prevData) {
        return {
          ...prevData,
          [name]: value || "", // Jika value kosong, set ke string kosong
        };
      }
      return prevData;
    });
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editData) {
      const formData = new FormData();
      formData.append("id_guru", editData.id_guru);
      formData.append("id_admin", editData.id_admin);
      formData.append("nip", editData.nip);
      formData.append("nama_guru", editData.nama_guru);
      formData.append("jenis_kelamin", editData.jenis_kelamin);
      formData.append("email", editData.email);
      formData.append("pas", editData.pas);
      formData.append("walas", editData.walas);
      formData.append("barcode", editData.barcode);
      formData.append("no_telp", editData.no_telp);

      // Tambahkan file foto jika ada
      if (editData.foto) {
        formData.append("foto", editData.foto);
      }

      try {
        // Lakukan PUT request ke endpoint '/edit-guru'
        const response = await axios.put(`${baseUrl}/guru/edit-guru`, [
          editData,
        ]);

        // Cek respons dari server
        if (response.data.success) {
          // Update data guru di state utama jika berhasil
          setGuru((prev) =>
            prev.map((guru) =>
              guru.id_guru === editData.id_guru
                ? { ...guru, ...editData }
                : guru
            )
          );
          toast.success("Data berhasil diperbarui!");
          setIsModalEdit(false);
          setOpenDropdownId(null);
        } else {
          toast.error("Terjadi kesalahan: " + response.data.message);
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat mengedit data");
        console.error(error);
      }
    }
  };
  //handle hapus
  const handleDeleteClick = (row: Guru) => {
    setSelectedRow(row); // Simpan data yang ingin dihapus
    setIsConfirmOpen(true); // Buka modal
  };
  const handleConfirmDelete = async () => {
    try {
      if (selectedRow) {
        // Panggil fungsi delete kelas untuk menghapus di backend
        await deleteGuru(selectedRow.id_guru);
  
        // Setelah berhasil menghapus, langsung perbarui state di frontend
        setGuru((prevGuru) =>
          prevGuru.filter((guru) => guru.id_guru !== selectedRow.id_guru)
        );
  
        toast.success(`Guru ${selectedRow.nama_guru} berhasil dihapus`);
        setIsConfirmOpen(false); // Tutup modal
        setSelectedRow(null); // Reset selectedRow
      } else {
        toast.error("Tidak ada data yang dipilih");
      }
    } catch (error) {
      console.error("Error deleting guru:", error);
      toast.error("Gagal menghapus guru");
    }
  };
  
  
  const handleCancel = () => {
    setIsConfirmOpen(false); // Tutup modal tanpa hapus
    setSelectedRow(null); // Reset selectedRow
  };
  //tombol untuk filter, pindah halaman, search dan reset
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default value is 5
  const [currentPage, setCurrentPage] = useState(1);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); //  Reset ke halaman pertama saat jumlah item per halaman berubah
  };
  const validSearchTerm = searchTerm ? searchTerm.toLowerCase() : "";
  // Memfilter data berdasarkan searchTerm
  const filteredData = guru.filter((item) => {
    // Asumsikan 'kelas' memiliki properti 'kelas' untuk dicari
    return (
      item?.nip?.toLowerCase().includes(validSearchTerm) ||
      item?.nama_guru?.toLowerCase().includes(validSearchTerm) ||
      item?.jenis_kelamin?.toLowerCase().includes(validSearchTerm) ||
      item?.no_telp?.toLowerCase().includes(validSearchTerm) ||
      item?.email?.toLowerCase().includes(validSearchTerm) ||
      item?.walas?.toLowerCase().includes(validSearchTerm)
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
  const [isMapelVisible, setIsMapelVisible] = useState(false);
  const toggleMapelVisibility = () => {
    setIsMapelVisible(!isMapelVisible);
  };
  const [isKelasVisible, setIsKelasVisible] = useState(false);
  const toggleKelasVisibility = () => {
    setIsKelasVisible(!isKelasVisible);
  };
  const [isRombelVisible, setIsRombelVisible] = useState(false);
  const toggleRombelVisibility = () => {
    setIsRombelVisible(!isRombelVisible);
  };
  const [dropdowns, setDropdowns] = useState([
    { id: Date.now(), value: "1" }, // Contoh nilai awal
  ]);
  // Fungsi untuk menambah dropdown baru
  // const addDropdown = () => {
  //   setDropdowns([...dropdowns, { id: Date.now(), value: "" }]); // Tambahkan dropdown baru dengan ID unik
  // };
  // // Fungsi untuk menghapus dropdown berdasarkan indeks
  // const removeDropdown = (index) => {
  //   setDropdowns(dropdowns.filter((_, i) => i !== index));
  // };
  // // Fungsi untuk mengubah nilai dropdown
  // const handleDropdownChange = (index, value) => {
  //   const updatedDropdowns = dropdowns.map((dropdown, i) =>
  //     i === index ? { ...dropdown, value } : dropdown
  //   );
  //   setDropdowns(updatedDropdowns);
  // };

  // const [editDropdowns, setEditDropdowns] = useState([
  //   { id: Date.now(), value: "" },
  // ]);
  // Fungsi untuk menambah dropdown (Edit)
  // const addEditDropdown = () => {
  //   setEditDropdowns([...editDropdowns, { id: Date.now(), value: "" }]);
  // };

  // // Fungsi untuk menghapus dropdown (Edit)
  // const removeEditDropdown = (index) => {
  //   setEditDropdowns(editDropdowns.filter((_, i) => i !== index));
  // };
  // // Fungsi untuk mengubah value dropdown (Edit)
  // const handleEditCheck = (index, value) => {
  //   const updated = [...editDropdowns];
  //   updated[index].value = value;
  //   setEditDropdowns(updated);
  // };
  return (
    <>
      <div className="rounded-lg max-w-full bg-slate-100">
        <div className="pt-8 ml-7">
          <h1 className="text-2xl font-bold">Data Guru</h1>
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
              <li className="text-gray-500">Data Guru</li>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                  name="id_guru"
                  value={guruData.id_guru}
                  onChange={handleChange}
                  hidden={true}
                />
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                  name="id_admin"
                  value={guruData.id_admin}
                  onChange={handleChange}
                  hidden={true}
                />
                <div>
                  <h2 className="block text-sm mb-2 sm:text-sm font-bold">
                    NIP
                  </h2>
                  <input
                    type="text"
                    className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    name="nip"
                    value={guruData.nip}
                    onChange={handleChange}
                    placeholder="Nip..."
                    pattern="\d*" // Hanya menerima angka
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault(); // Mencegah input selain angka
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 className="block text-sm mb-2 sm:text-sm font-bold">
                    Nama Guru
                  </h2>
                  <input
                    type="text"
                    className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    name="nama_guru"
                    value={guruData.nama_guru}
                    onChange={handleChange}
                    placeholder="Nama Guru..."
                  />
                </div>
                <div>
                  <h2 className="text-sm mb-2 sm:text-sm font-bold">
                    Jenis Kelamin
                  </h2>
                  <select
                    className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    name="jenis_kelamin"
                    value={guruData.jenis_kelamin}
                    onChange={handleChange}
                  >
                    <option value="">Pilih Jenis Kelamin...</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <h2 className="text-sm mb-2 sm:text-sm font-bold">Email</h2>
                  <input
                    type="email"
                    className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    name="email"
                    value={guruData.email}
                    onChange={handleChange}
                    placeholder="Email..."
                  />
                </div>
                <div>
                  <h2 className="text-sm mb-2 sm:text-sm font-bold">
                    Password
                  </h2>
                  <input
                    type="password"
                    className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    name="pas"
                    value={guruData.pas}
                    onChange={handleChange}
                    placeholder="Password..."
                  />
                </div>
                {/* <div>
                  <h2 className="text-sm mb-2 sm:text-sm font-bold">
                    Mengampu
                  </h2>
                  {/* <div
                  onClick={toggleMapelVisibility}
                  className="flex cursor-pointer text-black py-2 rounded-t"
                >
                  <span>
                    {isMapelVisible
                      ? "Klick Untuk Menutup Mata Pelajaran"
                      : "Klick Untuk Melihat Mata Pelajaran"}
                  </span>
                  <span>{isMapelVisible ? "" : ""}</span>
                </div>
                <AnimatePresence>
                  {isMapelVisible && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="mb-2 lg:flex lg:flex-wrap md:flex md:flex-wrap"
                    >
                      {" "}
                      {mapelList.length > 0 ? (
                        mapelList.map((mapel) => (
                          <label
                            key={mapel.id_mapel} // Pastikan id_mapel ada di data mapel
                            className="flex items-center space-x-2 md:w-1/2 mb-2"
                          >
                            <input
                              type="checkbox"
                              name="mapel"
                              value={mapel.id_mapel} // Ganti dengan nama kolom yang sesuai dari database
                              checked={guruData.id_mapel.includes(
                                mapel.id_mapel
                              )} // Cek apakah mapel sudah dipilih
                              onChange={handleMapelChange} // Panggil fungsi untuk mengubah state
                              className="form-checkbox text-blue-600"
                            />
                            <span className="text-sm sm:text-base">
                              {mapel.nama_mapel}
                            </span>
                          </label>
                        ))
                      ) : (
                        <p>Tidak ada data mata pelajaran.</p> // Tampilkan pesan jika tidak ada data
                      )}
                    </motion.div>
                  )}
                </AnimatePresence> */}
                {/* <div>
                    {dropdowns.map((_, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <select className="w-full p-2 border rounded text-sm sm:text-base mr-2">
                          <option value="-">Pilih Opsi</option>
                          <option value="1">Opsi 1</option>
                          <option value="2">Opsi 2</option>
                          <option value="3">Opsi 3</option>
                        </select>

                        {dropdowns.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDropdown(index)}
                            className="p-2 bg-red-500 hover:bg-red-700 text-white rounded mr-2"
                          >
                            -
                          </button>
                        )}

                        {index === dropdowns.length - 1 && (
                          <button
                            type="button"
                            onClick={addDropdown}
                            className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
                          >
                            +
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div> */}
                {/* <div>
                  <h2 className="text-sm mb-2 sm:text-sm font-bold">Kelas</h2>
                  <div
                    onClick={toggleKelasVisibility}
                    className="flex cursor-pointer text-black py-2 rounded-t"
                  >
                    <span>
                      {isKelasVisible
                        ? "Klick Untuk Menutup Kelas"
                        : "Klick Untuk Melihat Kelas"}
                    </span>
                    <span>{isKelasVisible ? "" : ""}</span>
                  </div>
                  <AnimatePresence>
                    {isKelasVisible && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="mb-2 lg:flex lg:flex-wrap md:flex md:flex-wrap"
                      >
                        {kelasList.map((kelas) => (
                          <label
                            key={kelas.id_kelas} // Pastikan id_kelas ada di data kelas
                            className="flex items-center space-x-2 md:w-16 mb-2"
                          >
                            <input
                              type="checkbox"
                              name="kelas"
                              value={kelas.id_kelas} // Ganti dengan nama kolom yang sesuai dari database
                              checked={guruData.id_kelas.includes(
                                kelas.id_kelas
                              )} // Cek apakah kelas sudah dipilih
                              onChange={handleCheckboxChange} // Panggil fungsi untuk mengubah state
                              className="form-checkbox text-blue-600"
                            />
                            <span className="text-sm sm:text-base">
                              {kelas.kelas}
                            </span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <h2 className="text-sm mb-2 sm:text-sm font-bold">Jurusan</h2>
                  <div
                    onClick={toggleRombelVisibility}
                    className="flex cursor-pointer text-black py-2 rounded-t"
                  >
                    <span>
                      {isRombelVisible
                        ? "Klick Untuk Menutup Rombel"
                        : "Klick Untuk Melihat Rombel"}
                    </span>
                    <span>{isRombelVisible ? "" : ""}</span>
                  </div>
                  <AnimatePresence>
                    {isRombelVisible && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="flex flex-wrap space-x-4 mb-2"
                      >
                        {rombelList.length > 0 ? (
                          rombelList.map((rombel) => (
                            <label
                              key={rombel.id_rombel}
                              className="flex items-center space-x-2 mb-1"
                            >
                              <input
                                type="checkbox"
                                name="rombel"
                                value={rombel.id_rombel}
                                checked={guruData.id_rombel.includes(
                                  rombel.id_rombel
                                )}
                                onChange={handleJurusanChange}
                                className="form-checkbox text-blue-600"
                              />
                              <span className="text-sm sm:text-base">
                                {rombel.nama_rombel}
                              </span>
                            </label>
                          ))
                        ) : (
                          <p>Tidak ada data rombel.</p> // Tampilkan pesan jika tidak ada data
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div> */}
                <div>
                  <label className="inline-flex items-center">
                    <h2 className="text-sm mb-2 sm:text-sm font-bold pr-2 pt-1">
                      Walas
                    </h2>
                    <input
                      type="checkbox"
                      checked={isWalasEnabled}
                      onChange={handleToggle}
                      className="hidden"
                    />
                    <span
                      className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                        isWalasEnabled ? "bg-teal-400" : ""
                      }`}
                    >
                      <span
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                          isWalasEnabled ? "translate-x-5" : ""
                        }`}
                      />
                    </span>
                    <span className="ml-2 text-sm"></span>
                  </label>
                  <select
                    className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    name="walas"
                    value={guruData.walas}
                    onChange={handleChange}
                    disabled={!isWalasEnabled} // Disable dropdown jika isWalasEnabled false
                  >
                    <option value="" disabled>
                      Pilih Kelas...
                    </option>
                    {kelas1.map((item) => (
                      <option key={item.id_siswa} value={item.id_kelas}>
                        {item.kelas}{" "}
                        {/* Sesuaikan dengan field yang diinginkan dari respons */}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="inline-flex items-center">
                    <h2 className="text-sm mb-2 sm:text-sm font-bold pr-2 pt-1">
                      Staff
                    </h2>
                    <input
                      type="checkbox"
                      checked={isStaffEnabled}
                      onChange={handleToggleStaff} // Ganti fungsi untuk mengatur state
                      className="hidden"
                    />
                    <span
                      className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                        isStaffEnabled ? "bg-teal-400" : ""
                      }`}
                    >
                      <span
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                          isStaffEnabled ? "translate-x-5" : ""
                        }`}
                      />
                    </span>
                    <span className="ml-2 text-sm"></span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    name="staf"
                    value={guruData.staf} // Sesuaikan dengan state yang Anda gunakan
                    onChange={handleChange} // Fungsi untuk menangani perubahan nilai input
                    placeholder="Staff bagian..."
                    disabled={!isStaffEnabled} // Disable input jika isStaffEnabled false
                  />
                </div>

                <div>
                  <h2 className="text-sm mb-2 sm:text-sm font-bold">
                    No. Telepon
                  </h2>
                  <input
                    type="text"
                    className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    name="no_telp"
                    value={guruData.no_telp}
                    onChange={handleChange}
                    placeholder="Nomor telepon..."
                    pattern="\d*" // Hanya menerima angka
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault(); // Mencegah input selain angka
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-sm mb-2 sm:text-sm font-bold">Barcode</h2>
                  <input
                    type="text"
                    className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    name="barcode"
                    value={guruData.barcode}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <h2 className="text-sm mb-2 sm:text-sm font-bold">Foto</h2>
                  <input
                    type="file"
                    name="foto"
                    onChange={handleFileChange} // Ganti event handler khusus untuk file
                    className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                    placeholder="Pilih file foto..."
                  />
                </div>
                <div></div>
                <div className="mt-4">
                  {/* Tombol Simpan */}
                  <div className="flex justify-end m-4 space-x-2 lg:mt-0 md:mt-0 md:z-50">
                    <button
                      type="submit"
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-teal-400 hover:bg-teal-500 text-white items-end rounded text-sm sm:text-base lg:w-24 md:w-24"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </form>
            {/* Tombol Unduh Format dan Upload File */}
            <div className="absolute -mt-20 ml-6">
              <button
                onClick={handleDownloadFormatClick}
                className="flex-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 border-slate-500 text-white rounded text-sm sm:text-base mb-2 lg:mb-0 lg:mr-2 md:mr-2"
              >
                Unduh Format
              </button>
              <button
                onClick={handleUploadFileClick}
                className="flex-2 lg:inline-block md:inline-block block px-4 py-2 bg-rose-600 hover:bg-rose-700 border-teal-400 text-white rounded text-sm sm:text-base mb-2 lg:mb-0"
              >
                Upload File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                style={{ display: "none" }}
                onChange={handleFileUploadChange}
              />
            </div>
          </div>

          {/* Column 2: Table */}
          <div className="w-full lg:mt-0 md:mt-0 mt-16 lg:w-2/3 p-4 lg:p-6">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border">
              <div className="bg-slate-600 px-2 rounded-xl">
                <div className="flex flex-col lg:flex-row justify-between mb-4">
                  <div className="p-2">
                    <h2 className="text-sm pt-3 sm:text-2xl text-white font-bold">
                      Tabel Guru
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
                        <option value={1}>1</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                  </div>
                  {/* <div className="">
                    <label
                      htmlFor="filterKelas"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                    <label
                      htmlFor="filterJurusan"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                  columns={guruColumns as { header: string; accessor: keyof Guru; Cell?: ({ row }: { row: Guru }) => JSX.Element; }[]}
                  data={paginatedData} />
                  <ToastContainer className="mt-14" />
                  {/* Column 2: Edit */}
                  {isModalEdit && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="bg-white rounded p-4 shadow-lg space-y-4  max-h-screen overflow-y-auto">
                        <h3 className="pb-2 text-lg font-semibold">
                          Edit Data Guru
                        </h3>
                        <form onSubmit={handleEditSubmit} className="space-y-3">
                          <input
                            type="text"
                            name="id_guru"
                            value={editData ? editData.id_guru : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="ID Guru..."
                            hidden={true}
                          />
                          <input
                            type="text"
                            name="id_admin"
                            value={editData ? editData.id_admin : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="id_admin..."
                            hidden={true}
                          />
                          <h2 className="text-sm mb-2 sm:text-sm font-bold">
                            Nip
                          </h2>
                          <input
                            type="text"
                            name="nip"
                            value={editData ? editData.nip : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="nip..."
                            pattern="\d*" // Hanya menerima angka
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault(); // Mencegah input selain angka
                              }
                            }}
                          />

                          <h2 className="text-sm mb-2 sm:text-sm font-bold">
                            Nama Guru
                          </h2>
                          <input
                            type="text"
                            name="nama_guru"
                            value={editData ? editData.nama_guru : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="Nama Guru..."
                          />

                          <h2 className="text-sm mb-2 sm:text-sm font-bold">
                            Jenis Kelamin
                          </h2>
                          <select
                            name="jenis_kelamin"
                            value={editData ? editData.jenis_kelamin : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                          >
                            <option value="">Pilih Jenis Kelamin...</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                          </select>
                          <h2 className="text-sm mb-2 sm:text-sm font-bold">
                            Email
                          </h2>
                          <input
                            type="email"
                            name="email"
                            value={editData ? editData.email : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="Email..."
                          />

                          <h2 className="text-sm mb-2 sm:text-sm font-bold">
                            Password
                          </h2>
                          <input
                            type="pass"
                            name="pass"
                            value={editData ? editData.pas : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="pass..."
                          />

                          <div>
                            <label className="inline-flex items-center">
                              <h2 className="text-sm mb-2 sm:text-sm font-bold pr-2 pt-1">
                                Walas
                              </h2>
                              <input
                                type="checkbox"
                                checked={isWalasEditEnabled}
                                onChange={handleToggleWalasEdit}
                                className="hidden"
                              />
                              <span
                                className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                                  isWalasEditEnabled ? "bg-teal-400" : ""
                                }`}
                              >
                                <span
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                                    isWalasEditEnabled ? "translate-x-5" : ""
                                  }`}
                                />
                              </span>
                              <span className="ml-2 text-sm"></span>
                            </label>
                            <select
                              className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                              name="walas"
                              value={editData ? editData.walas : ""}
                              onChange={handleEditChange}
                              disabled={!isWalasEditEnabled} // Disable dropdown jika isWalasEditEnabled false
                            >
                              <option value="" disabled>
                                Pilih Kelas...
                              </option>
                              {kelas1.map((item) => (
                                <option
                                  key={item.id_siswa}
                                  value={item.kelas}
                                >
                                  {item.kelas}{" "}
                                  {/* Sesuaikan dengan field yang diinginkan dari respons */}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="inline-flex items-center">
                              <h2 className="text-sm mb-2 sm:text-sm font-bold pr-2 pt-1">
                                Staff
                              </h2>
                              <input
                                type="checkbox"
                                checked={isStaffEditEnabled}
                                onChange={handleToggleStaffEdit} // Ganti fungsi untuk mengatur state
                                className="hidden"
                              />
                              <span
                                className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                                  isStaffEditEnabled ? "bg-teal-400" : ""
                                }`}
                              >
                                <span
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                                    isStaffEditEnabled ? "translate-x-5" : ""
                                  }`}
                                />
                              </span>
                              <span className="ml-2 text-sm"></span>
                            </label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                              name="staf"
                              value={editData ? editData.staf : ""}
                              onChange={handleEditChange} // Fungsi untuk menangani perubahan nilai input
                              placeholder="Staff bagian..."
                              disabled={!isStaffEditEnabled} // Disable input jika isStaffEditEnabled false
                            />
                          </div>

                          <h2 className="text-sm mb-2 sm:text-sm font-bold">
                            No. Telepon
                          </h2>
                          <input
                            type="text"
                            name="no_telp"
                            value={editData ? editData.no_telp : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="No. Telepon..."
                            pattern="\d*" // Hanya menerima angka
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault(); // Mencegah input selain angka
                              }
                            }}
                          />

                          <h2 className="text-sm mb-2 sm:text-sm font-bold">
                            Barcode
                          </h2>
                          <input
                            type="text"
                            name="barcode"
                            value={editData ? editData.barcode : ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="Barcode..."
                          />

                          <h2 className="text-sm mb-2 sm:text-sm font-bold">
                            Foto
                          </h2>
                          <input
                            type="file"
                            name="foto"
                            onChange={handleFileChange} // Handler untuk menangani file
                            className="w-full p-2 border rounded text-sm sm:text-base mb-2"
                            placeholder="Pilih file foto..."
                          />

                          <div className="flex justify-end space-x-2">
                            <button
                              type="submit"
                              className="py-2 px-4 bg-teal-400 hover:bg-teal-500 text-white rounded text-sm sm:text-base"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsModalEdit(false); // Tutup modal
                                setOpenDropdownId(null); // Tutup dropdown juga
                              }}
                              className="py-2 px-4 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm sm:text-base"
                            >
                              Tutup
                            </button>
                          </div>
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
        </div>
      </div>
    </>
  );
}
