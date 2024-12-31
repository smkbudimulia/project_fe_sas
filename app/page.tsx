"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "./header";
import DataTable from "./components/dataTabel";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addSiswa,
  fetchSiswa,
  deleteSiswa,
  updateSiswa,
  // Siswa,
} from "./api/siswa";
import {
  addKelas,
  fetchKelas,
  deleteKelas,
  updateKelas,
  // Kelas,
} from "./api/kelas";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
import dynamic from "next/dynamic";
import { Noto_Serif_Georgian } from "next/font/google";
type Item = {
  id: string;
  nama_siswa: string;
  kelas: string;
  name: string;
};

interface Sakit {
  id: number;
  name: string;
}
type Kelas = { i: number }; // Tipe data untuk item dalam kelas
interface AbsensiItem {
  id_siswa: string;
  absensi: { [key: string]: string | undefined }; // Waktu bisa undefined jika tidak ada
}
interface Siswa {
  id_siswa: string;
  // Properti lain yang ada dalam data siswa, seperti nama atau umur, bisa ditambahkan di sini
}

const Page = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const handleDropdownToggle = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const [siswaData, setSiswaData] = useState<Item[]>([]);
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

  const [kelas, setKelas] = useState<Kelas[]>([]);
  const fetchKelasSiswaTotal = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/joinNonMaster/total-kelas-siswa`
      );
      setKelas(response.data.data); // Menyimpan data ke state kelas
      console.log("total", response.data);
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

  const [clickedRowIndex, setClickedRowIndex] = useState(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null); // Ref untuk tombol "Kirim"
  const handleRowClick = (row: any, index: any) => {
    // Set indeks baris yang diklik untuk mengubah latar belakang
    setClickedRowIndex(index);
    console.log("Baris diklik:", row);
  };
  // Menghapus highlight saat pengguna mengklik di luar tabel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Memeriksa apakah klik terjadi di luar elemen tabel dan tombol "Kirim"
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setClickedRowIndex(null); // Reset indeks baris yang diklik
        console.log("Klik terdeteksi di luar tabel dan tombol Kirim");
      }
    };

    // Menambahkan event listener untuk klik di luar
    document.addEventListener("mousedown", handleClickOutside);

    // Membersihkan event listener saat komponen unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // State untuk kontrol popup Sakit
  const [isPopupVisibleSakit, setIsPopupVisibleSakit] = useState(false);
  // State untuk menyimpan data sakit yang dipilih
  const [selectedSakit, setSelectedSakit] = useState<Sakit[]>([]);
  const [tableData, setTableData] = useState([]);

  // // Data contoh untuk item Sakit
  // const sakitItems = [
  //   { name: "Aldi", kelas: "1A" },
  //   { name: "Budi", kelas: "1B" },
  //   { name: "Citra", kelas: "1C" },
  //   { name: "Diana", kelas: "1A" },
  //   { name: "Eko", kelas: "1B" },
  //   { name: "Fani", kelas: "1C" },
  //   { name: "Gita", kelas: "2A" },
  //   { name: "Hendra", kelas: "2B" },
  //   { name: "Ika", kelas: "2C" },
  //   { name: "Joko", kelas: "2A" },
  //   { name: "Kiki", kelas: "2B" },
  //   { name: "Lina", kelas: "2C" },
  //   { name: "Maya", kelas: "3A" },
  //   { name: "Nia", kelas: "3B" },
  //   { name: "Omar", kelas: "3C" },
  //   { name: "Maya", kelas: "4A" },
  //   { name: "Nia", kelas: "4B" },
  //   { name: "Omar", kelas: "4C" },
  // ];
  const [siswaSakitData, setSiswaSakitData] = useState([]);
  useEffect(() => {
    fetch(`${baseUrl}/siswa/all-siswa`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Data dari API:", data); // Cek seluruh data yang diterima
        if (Array.isArray(data.data)) {
          console.log("Data yang diterima adalah array sakit:", data.data); // Cek data yang ada dalam array
          setSiswaSakitData(data.data); // Set data jika array
        } else {
          console.error("Data yang diterima bukan array:", data); // Tampilkan error jika data tidak berupa array
        }
      })
      .catch((error) => {
        console.error("Error saat mengambil data:", error); // Tangani error jika fetch gagal
      });
  }, []);

  // Memeriksa nilai state siswaSakitData setelah diperbarui
  useEffect(() => {
    console.log("Siswa Sakit Data updated:", siswaSakitData); // Pastikan state terupdate
  }, [siswaSakitData]);

  //function untuk search
  const [searchTermSakit, setSearchTermSakit] = useState("");
  const handleSearchSakitChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTermSakit(event.target.value);
  };

  // State untuk pengaturan item per halaman dan halaman saat ini
  const [sakitItemsPerPage, setSakitItemsPerPage] = useState(5);
  const [sakitCurrentPage, setSakitCurrentPage] = useState(1);

  // Mengurutkan data siswa berdasarkan nama dari A-Z
  const filteredSiswaSakit = siswaData
    .filter((row) =>
      row.nama_siswa.toLowerCase().includes(searchTermSakit.toLowerCase())
    )
    .sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa)); // Mengurutkan A-Z

  // Menghitung total halaman setelah data diterima
  const sakitTotalPages = Math.ceil(
    filteredSiswaSakit.length / sakitItemsPerPage
  );

  // Fungsi untuk mengubah item per halaman
  const handleSakitItemsPerPageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSakitItemsPerPage(parseInt(e.target.value));
  };

  // // Mengambil item Sakit yang ditampilkan berdasarkan halaman saat ini
  // const currentItemsSakit = sakitItems.slice(
  //   (sakitCurrentPage - 1) * sakitItemsPerPage,
  //   sakitCurrentPage * sakitItemsPerPage
  // );

  const [id_siswa, setIdSiswa] = useState<string | null>(null);
  //Handle untuk ngirim sakit
  const handleSakitSubmit = async () => {
    try {
      const data = {
        id_siswa: id_siswa, // Ganti dengan state atau variabel yang memuat ID siswa
        keterangan: "Sakit",
      };

      const response = await axios.post(`${baseUrl}/siswa-absensi-sakit`, data);
      console.log("sakit bisa", response);
      if (!response) {
        toast.error(`Error: ${response}`);
        return;
      }

      toast.success("Absensi sakit berhasil dicatat!");
      console.log(response.data);
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      toast("Gagal mencatat absensi sakit. Coba lagi nanti.");
    }
  };

  // Fungsi untuk menambahkan siswa yang dipilih ke selectedSakit
  // const handleSakitSelect = (item) => {
  //   setSelectedSakit(item); // Menyimpan item yang dipilih
  //   setSearchTermSakit(item.name);
  // };

  // Fungsi untuk toggle popup Sakit
  const togglePopupSakit = () => {
    if (isPopupVisibleSakit) {
      // Jika popup ditutup, reset kembali items per page, halaman, dan search ke default
      setSakitItemsPerPage(5); // Kembali ke default 5 item per halaman
      setSakitCurrentPage(1); // Kembali ke halaman 1
      setSearchTermSakit(""); // Kosongkan search input
    }
    setIsPopupVisibleSakit(!isPopupVisibleSakit); // Tampilkan atau sembunyikan popup
  };

  // State untuk kontrol popup keterangan lain
  const [isPopupVisibleKeteranganLain, setIsPopupVisibleKeteranganLain] =
    useState(false);

  // State untuk menyimpan data keterangan lain yang dipilih
  const [selectedKeteranganLain, setSelectedKeteranganLain] = useState<Item[]>([]);

  // Data contoh untuk item keterangan lain bisa diganti secara dinamis
  const keteranganItems = [
    { name: "Aldi", kelas: "1A" },
    { name: "Budi", kelas: "1B" },
    { name: "Citra", kelas: "1C" },
    { name: "Diana", kelas: "1A" },
    { name: "Eko", kelas: "1B" },
    { name: "Fani", kelas: "1C" },
    { name: "Gita", kelas: "2A" },
    { name: "Hendra", kelas: "2B" },
    { name: "Ika", kelas: "2C" },
    { name: "Joko", kelas: "2A" },
    { name: "Kiki", kelas: "2B" },
    { name: "Lina", kelas: "2C" },
    { name: "Maya", kelas: "3A" },
    { name: "Nia", kelas: "3B" },
    { name: "Omar", kelas: "3C" },
    { name: "Maya", kelas: "4A" },
    { name: "Nia", kelas: "4B" },
    { name: "Omar", kelas: "4C" },
  ];

  const [siswaKeteranganLainData, setSiswaKeteranganLainData] = useState<
    Siswa[]
  >([]);

  useEffect(() => {
    fetch(`${baseUrl}/siswa/all-siswa`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Data dari API:", data); // Cek seluruh data yang diterima
        if (Array.isArray(data.data)) {
          console.log("Data yang diterima adalah array keterangan:", data.data); // Cek data yang ada dalam array
          setSiswaKeteranganLainData(data.data); // Set data jika array
        } else {
          console.error("Data yang diterima bukan array:", data); // Tampilkan error jika data tidak berupa array
        }
      })
      .catch((error) => {
        console.error("Error saat mengambil data:", error); // Tangani error jika fetch gagal
      });
  }, []);

  // Memeriksa nilai state siswaKeteranganLainData setelah diperbarui
  useEffect(() => {
    console.log("Siswa KeteranganLain Data updated:", siswaKeteranganLainData); // Pastikan state terupdate
  }, [siswaKeteranganLainData]);

  //function untuk search
  const [searchTermKeterangan, setSearchTermKeterangan] = useState("");
  const handleKeteranganSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTermKeterangan(event.target.value);
  };

  // State untuk pengaturan item per halaman dan halaman saat ini
  const [keteranganItemsPerPage, setKeteranganItemsPerPage] = useState(5);
  const [keteranganCurrentPage, setKeteranganCurrentPage] = useState(1);

  const filteredSiswaKeterangan = siswaData
    .filter((row) =>
      row.nama_siswa.toLowerCase().includes(searchTermKeterangan.toLowerCase())
    )
    .sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa)); // Mengurutkan A-Z

  // Contoh data
  const keteranganTotalPages = Math.ceil(
    filteredSiswaKeterangan.length / keteranganItemsPerPage
  );

  //Handle untuk ngirim keterangan lain
  const handleKeteranganSubmit = () => {
    // Perbarui data `kelas` dengan menambah `s` untuk semua item
    const updatedKelas = kelas.map((item) => {
      // Pastikan item memiliki properti `s` yang akan ditingkatkan
      if (item.i !== undefined) {
        return {
          ...item,
          i: item.i + 1, // Tambahkan 1 ke nilai `s`
        };
      }
      return item;
    });

    setKelas(updatedKelas);
  };
  // Fungsi untuk menambahkan siswa yang dipilih ke selectedKeteranganLain
  const handleKeteranganLainSelect = (item: Item) => {
    setSelectedKeteranganLain([...selectedKeteranganLain, item]); // Menyimpan item yang dipilih
    setSearchTermKeterangan(item.name);
  };

  //state input keterangan lain
  const [inputketeranganLain, setInputKeteranganLain] = useState("");
  // Fungsi untuk toggle popup Keterangan Lain
  const togglePopupKeteranganLain = () => {
    if (isPopupVisibleKeteranganLain) {
      // Jika popup ditutup, reset kembali items per page, halaman, dan search ke default
      setKeteranganItemsPerPage(5); // Kembali ke default 5 item per halaman
      setKeteranganCurrentPage(1); // Kembali ke halaman 1
      setSearchTermKeterangan(""); // Kosongkan search input
    }
    setIsPopupVisibleKeteranganLain(!isPopupVisibleKeteranganLain); // Tampilkan atau sembunyikan popup
  };

  // Fungsi untuk mengubah item per halaman
  const handleKeteranganItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setKeteranganItemsPerPage(parseInt(e.target.value));
  };

  //function untuk pulang
  const [isOpen, setIsOpen] = useState(false);
  // State untuk kontrol popup pulang
  const [isPopupVisiblePulang, setIsPopupVisiblePulang] = useState(false);
  // State untuk menyimpan data pulang yang dipilih
  const [selectedPulang, setSelectedPulang] = useState<Item[]>([]);

  // Data contoh untuk item pulang bisa diganti secara dinamis
  const pulangItems = [
    { name: "Aldi", kelas: "1A" },
    { name: "Budi", kelas: "1B" },
    { name: "Citra", kelas: "1C" },
    { name: "Diana", kelas: "1A" },
    { name: "Eko", kelas: "1B" },
    { name: "Fani", kelas: "1C" },
    { name: "Gita", kelas: "2A" },
    { name: "Hendra", kelas: "2B" },
    { name: "Ika", kelas: "2C" },
    { name: "Joko", kelas: "2A" },
    { name: "Kiki", kelas: "2B" },
    { name: "Lina", kelas: "2C" },
    { name: "Maya", kelas: "3A" },
    { name: "Nia", kelas: "3B" },
    { name: "Omar", kelas: "3C" },
  ];

  const [siswaPulangData, setSiswaPulangData] = useState<Siswa[]>([]);

  useEffect(() => {
    fetch(`${baseUrl}/siswa/all-siswa`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Data dari API:", data); // Cek seluruh data yang diterima
        if (Array.isArray(data.data)) {
          console.log("Data yang diterima adalah array keterangan:", data.data); // Cek data yang ada dalam array
          setSiswaPulangData(data.data); // Set data jika array
        } else {
          console.error("Data yang diterima bukan array:", data); // Tampilkan error jika data tidak berupa array
        }
      })
      .catch((error) => {
        console.error("Error saat mengambil data:", error); // Tangani error jika fetch gagal
      });
  }, []);

  // Memeriksa nilai state siswaKeteranganLainData setelah diperbarui
  useEffect(() => {
    console.log("Siswa Pulang updated:", siswaPulangData); // Pastikan state terupdate
  }, [siswaPulangData]);

  //function untuk search
  const [searchTermPulang, setSearchTermPulang] = useState("");
  const handlePulangSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTermPulang(event.target.value);
  };

  // State untuk pengaturan item per halaman dan halaman saat ini
  const [pulangItemsPerPage, setPulangItemsPerPage] = useState(5);
  const [pulangCurrentPage, setPulangCurrentPage] = useState(1);

  const filteredSiswaPulang = siswaData
    .filter((row) =>
      row.nama_siswa.toLowerCase().includes(searchTermSakit.toLowerCase())
    )
    .sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa)); // Mengurutkan A-Z

  // Contoh data
  const pulangTotalPages = Math.ceil(
    filteredSiswaPulang.length / pulangItemsPerPage
  );

  //Handle untuk ngirim pulang
  const handlePulangSubmit = () => {
    // Perbarui data `kelas` dengan menambah `s` untuk semua item
    const updatedKelas = kelas.map((item) => {
      // Pastikan item memiliki properti `s` yang akan ditingkatkan
      if (item.i !== undefined) {
        return {
          ...item,
          i: item.i + 1, // Tambahkan 1 ke nilai `s`
        };
      }
      return item;
    });

    setKelas(updatedKelas);
  };

  // Fungsi untuk menambahkan siswa yang dipilih ke selectedPulang
  const handlePulangSelect = (item: Item) => {
    setSelectedPulang([...selectedPulang, item]); // Menyimpan item yang dipilih
    setSearchTermPulang(item.name);
  };

  //state input keterangan lain
  const [inputPulang, setInputPulang] = useState("");

  // Handler untuk membuka/tutup dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  // Fungsi untuk toggle popup pulang
  const togglePopupPulang = () => {
    if (isPopupVisiblePulang) {
      // Jika popup ditutup, reset kembali items per page, halaman, dan search ke default
      setPulangItemsPerPage(5); // Kembali ke default 5 item per halaman
      setPulangCurrentPage(1); // Kembali ke halaman 1
      setSearchTermPulang(""); // Kosongkan search input
    }
    setIsPopupVisiblePulang(!isPopupVisiblePulang); // Tampilkan atau sembunyikan popup
  };

  // Fungsi untuk mengubah item per halaman
  const handlePulangItemsPerPageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSakitItemsPerPage(parseInt(e.target.value));
  };

  // data untuk tabel absensi
  //   const [tableData, setTableData] = useState([
  //     { no: 1, kelas: '1 A', jumlah: 30, h: 0, s: 0, i: 0, a: 0, t: 0, walas: 'Mr. A', barcode: ['(242)501013', '(242)501069'] },
  //     { no: 2, kelas: '1 B', jumlah: 28, h: 0, s: 0, i: 0, a: 0, t: 0, walas: 'Ms. B', barcode: ['(242)501006', '(242)501084'] },
  //     { no: 3, kelas: '11 D', jumlah: 25, h: 0, s: 0, i: 0, a: 0, t: 0, walas: 'Dimaz', barcode: ['(K242501029)', '(242)501039'] }
  // ]);

  //variabel  dan function untuk barcode
  const [barcode, setBarcode] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const pulangInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const handleSearchClick = (event: React.MouseEvent) => {
    // Mencegah fokus kembali ke barcode saat klik di search
    event.stopPropagation();
  };
  // Fungsi untuk mengirim data ke endpoint
  // const handleSubmit = async () => {
  //   if (!barcode) return;

  //   try {
  //     const response = await axios.post(`${baseUrl}/absensi/siswa-abseni`, {
  //       id_siswa: barcode, // Sesuaikan payload dengan kebutuhan endpoint
  //     });
  //     console.log("Response:", response.data);
  //     alert("Data berhasil dikirim");
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("Terjadi kesalahan saat mengirim data");
  //   }

  //   // Bersihkan input setelah pengiriman
  //   setBarcode("");
  //   if (barcodeInputRef.current) {
  //     barcodeInputRef.current.focus();
  //   }
  // };
  // Fungsi untuk menangani tombol Enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit1(event);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hapus tanda kurung dari input
    const cleanValue = e.target.value.replace(/[()]/g, "");

    // Perbarui state barcode dengan nilai yang sudah dibersihkan
    setBarcode(cleanValue);
  };

  useEffect(() => {
    const handleFocus = (event: MouseEvent) => {
      // Mengecek jika klik terjadi di luar input barcode dan input search
      if (
        barcodeInputRef.current &&
        !barcodeInputRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        // Fokus ke input barcode jika klik terjadi di luar kedua input tersebut
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }
    };

    // Fokus pada input barcode saat komponen dimuat
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }

    // Menambahkan event listener untuk klik di seluruh dokumen
    document.addEventListener("click", handleFocus);

    // Bersihkan event listener saat komponen di-unmount
    return () => {
      document.removeEventListener("click", handleFocus);
    };
  }, []);

  //state untuk dropdown aksi
  const [openDropdown, setOpenDropdown] = useState<string | number | null>(
    null
  );
  const handleDropdownClick = (id: string | number) => {
    setOpenDropdown((prevDrop) => (prevDrop === id ? null : id));
  };
  //state jam digital
  const DigitalClock = dynamic(() => import("./components/DIgitalClock"), {
    ssr: false, // Matikan SSR
  });
  const [message, setMessage] = useState("");

  const getAbsensiStatus = () => {
    const currentTime = new Date(); // Ambil waktu komputer
    const hour = currentTime.getHours(); // Jam saat ini
    const minute = currentTime.getMinutes(); // Menit saat ini

    let keterangan = "";
    let datang = "";
    let pulang = "";

    // Tentukan status berdasarkan waktu komputer
    if (hour >= 6 && hour < 7) {
      keterangan = "Datang";
      datang = `${hour}:${minute < 10 ? "0" + minute : minute}`;
    } else if (hour >= 7 && hour < 9) {
      keterangan = "Terlambat";
      datang = `${hour}:${minute < 10 ? "0" + minute : minute}`;
    } else if (hour >= 9 && hour < 14) {
      keterangan = "Alpa";
    } else if (hour >= 14 && hour < 16) {
      keterangan = "Pulang";
      pulang = `${hour}:${minute < 10 ? "0" + minute : minute}`;
    } else {
      return "Waktu absensi tidak valid";
    }
    return { keterangan, datang, pulang };
  };
  const [absensi, setAbsensi] = useState<AbsensiItem[]>([]);

  // const handleSubmit1 = async (e: React.SyntheticEvent) => {
  //   e.preventDefault();

  //   // Ambil status absensi berdasarkan waktu komputer
  //   const { keterangan, datang, pulang, tanggal } = getAbsensiStatus();
  //   const formattedBarcode = barcode.trim(); // Menghapus spasi

  //   // Kosongkan barcode setelah beberapa detik
  //   setTimeout(() => {
  //     setBarcode("");
  //   }, 500);

  //   if (keterangan === "") {
  //     toast.error("Waktu absensi tidak valid");
  //     return;
  //   }

  //   try {
  //     // Cek apakah ID siswa ada
  //     const checkResponse = await axios.get(`${baseUrl}/siswa/all-siswa`);

  //     // Pastikan ID siswa ada dalam respons
  //     const siswaList = checkResponse.data?.data || [];
  //     const isSiswaValid = siswaList.some(
  //       (siswa) => siswa.id_siswa === formattedBarcode
  //     );

  //     if (!isSiswaValid) {
  //       toast.error("ID siswa tidak ditemukan");
  //       return;
  //     }

  //     // Kirim data absensi ke backend
  //     const response = await axios.post(`${baseUrl}/absensi/siswa-abseni`, {
  //       id_siswa: formattedBarcode,
  //       datang,
  //       tanggal,
  //       pulang,
  //       keterangan,
  //     });

  //     // Perbarui state absensi di frontend
  //     setAbsensi((prevDrop) =>
  //       prevDrop.map((item) =>
  //         item.id_siswa === formattedBarcode && item.absensi[tanggal]
  //           ? {
  //               ...item,
  //               absensi: {
  //                 ...item.absensi,
  //                 [`${tanggal}_pulang`]: pulang, // Tambahkan waktu pulang
  //               },
  //             }
  //           : item
  //       )
  //     );
  //     // Jika absensi tidak tercatat atau tidak ada waktu datang
  //     if (response.data.keterangan === "Alpa") {
  //       toast.success(`${response.data.message} (Alpa)`);
  //     } else {
  //       toast.success(response.data.message);
  //     }
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       console.log(error.message);
  //     } else {
  //       console.log("Unknown error");
  //     }
  //   }
  // };
  const handleSubmit1 = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const absensiStatus = getAbsensiStatus();

    if (typeof absensiStatus !== "string") {
      const { keterangan, datang, pulang } = absensiStatus;
      const tanggal = new Date().toISOString().split("T")[0]; // Atur tanggal di sini

      if (keterangan === "") {
        toast.error("Waktu absensi tidak valid");
        return;
      }

      const formattedBarcode = barcode.trim(); // Menghapus spasi

      // Kosongkan barcode setelah beberapa detik
      setTimeout(() => {
        setBarcode("");
      }, 500);

      try {
        // Cek apakah ID siswa ada
        const checkResponse = await axios.get(`${baseUrl}/siswa/all-siswa`);

        // Pastikan ID siswa ada dalam respons
        const siswaList: Siswa[] = checkResponse.data?.data || [];
        const isSiswaValid = siswaList.some(
          (siswa) => siswa.id_siswa === formattedBarcode
        );

        if (!isSiswaValid) {
          toast.error("ID siswa tidak ditemukan");
          return;
        }

        // Kirim data absensi ke backend
        const response = await axios.post(`${baseUrl}/absensi/siswa-abseni`, {
          id_siswa: formattedBarcode,
          datang,
          tanggal,
          pulang,
          keterangan,
        });

        // Perbarui state absensi di frontend
        setAbsensi((prevDrop) =>
          prevDrop.map((item) =>
            item.id_siswa === formattedBarcode && item.absensi[tanggal]
              ? {
                  ...item,
                  absensi: {
                    ...item.absensi,
                    [`${tanggal}_pulang`]: pulang, // Tambahkan waktu pulang
                  },
                }
              : item
          )
        );

        // Jika absensi tidak tercatat atau tidak ada waktu datang
        if (response.data.keterangan === "Alpa") {
          toast.success(`${response.data.message} (Alpa)`);
        } else {
          toast.success(response.data.message);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log("Unknown error");
        }
      }
    } else {
      toast.error(absensiStatus); // Menampilkan pesan error jika absensiStatus adalah string
    }
  };

  return (
    <>
      <div>
        <Navbar />
        <ToastContainer className="mt-14" />
      </div>

      <div
        className="text-center mt-14 text-7xl font-bold"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        SMK BUDI MULIA
      </div>

      {/* Column 1: Input */}
      <div className="relative ">
        <div className="text-white px-4 py-2 rounded flex items-center">
          <span
            onClick={handleDropdownToggle}
            className="cursor-pointer flex items-end text-gray-200 text-3xl"
          >
            {isDropdownVisible ? "▾" : "▸"}
          </span>
        </div>
        {isDropdownVisible && (
          <div className="lg:absolute lg:w-1/3 md:w-1/4 p-4 lg:p-6 top-full mt-2">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border">
              <div className="flex flex-col items-center justify-center">
                <h1 className="font-bold text-xl text-center lg:text-2xl">
                  Tombol untuk siswa
                </h1>
                <div>
                  <div className="flex space-x-4 lg:mt-4">
                    <button
                      className="bg-blue-500 w-32 lg:w-32 lg:text-base md:w-32 md:text-xl text-white px-4 py-2 mr-2 rounded "
                      onClick={togglePopupSakit}
                    >
                      Sakit
                    </button>
                    {isPopupVisibleSakit && (
                      <div className="fixed inset-0 scroll-pl-1 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
                        <div className="bg-white p-3 rounded shadow-md">
                          <div className="bg-slate-600 p-2 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <select
                                className="border border-gray-300 rounded px-2 py-1"
                                value={sakitItemsPerPage}
                                onChange={handleSakitItemsPerPageChange}
                              >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="12">12</option>
                              </select>
                              <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search"
                                className="pointer-events-auto border border-gray-300 rounded px-2 py-1"
                                onClick={handleSearchClick} // Menghentikan propagasi klik untuk input search
                                onChange={handleSearchSakitChange}
                              />
                            </div>

                            <div className="mt-4">
                              <table
                                ref={tableRef}
                                className="min-w-full  border-gray-300"
                              >
                                <thead>
                                  <tr className="bg-slate-500 text-left">
                                    <th className=" rounded-l-lg text-white px-4 py-2">
                                      Nama
                                    </th>
                                    <th className=" rounded-r-lg text-white px-4 py-2">
                                      Kelas
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredSiswaSakit
                                    .slice(
                                      (sakitCurrentPage - 1) *
                                        sakitItemsPerPage,
                                      sakitCurrentPage * sakitItemsPerPage
                                    )
                                    .map((row, index) => (
                                      <tr
                                        key={index}
                                        className={`cursor-pointer ${
                                          clickedRowIndex === index
                                            ? "bg-gray-100"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          handleRowClick(row, index)
                                        }
                                      >
                                        <td className="px-4 py-2 border-b">
                                          {row.nama_siswa}
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                          {row.kelas}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="flex justify-between mt-4">
                              <button
                                className={`px-2 py-1 rounded ${
                                  sakitTotalPages === 0 ||
                                  sakitCurrentPage === 1
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-teal-400 hover:bg-teal-500 text-white"
                                }`}
                                disabled={
                                  sakitTotalPages === 0 ||
                                  sakitCurrentPage === 1
                                }
                                onClick={() =>
                                  setSakitCurrentPage(sakitCurrentPage - 1)
                                }
                              >
                                Kembali
                              </button>
                              <span className="text-gray-950 px-2">
                                Page{" "}
                                {filteredSiswaSakit.length > 0
                                  ? sakitCurrentPage
                                  : 0}{" "}
                                of {sakitTotalPages}
                              </span>
                              <button
                                className={`px-2 py-1 rounded ${
                                  sakitTotalPages === 0 ||
                                  sakitCurrentPage === sakitTotalPages
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-teal-400 hover:bg-teal-500 text-white"
                                }`}
                                disabled={
                                  sakitTotalPages === 0 ||
                                  sakitCurrentPage === sakitTotalPages
                                }
                                onClick={() =>
                                  setSakitCurrentPage(sakitCurrentPage + 1)
                                }
                              >
                                Selanjutnya
                              </button>
                            </div>

                            <div className="flex justify-between">
                              <button
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={togglePopupSakit}
                              >
                                Close
                              </button>
                              <button
                                ref={buttonRef}
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={handleSakitSubmit}
                              >
                                Kirim
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <button
                      className="bg-orange-500 lg:w-44 lg:text-base md:w-44 md:text-xl text-white px-4 py-2 mr-2 rounded"
                      onClick={togglePopupKeteranganLain} // Panggil fungsi untuk toggle pop-up
                    >
                      Keterangan Lain
                    </button>
                    {isPopupVisibleKeteranganLain && (
                      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
                        <div className="bg-white p-3 rounded shadow-md">
                          <div className="bg-slate-600 p-2 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <select
                                className="border border-gray-300 rounded px-2 py-1"
                                value={keteranganItemsPerPage} // Ganti dengan state yang sesuai
                                onChange={handleKeteranganItemsPerPageChange} // Ganti dengan handler yang sesuai
                              >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="12">12</option>
                              </select>
                              <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search..."
                                className="border border-gray-300 rounded px-2 py-1"
                                onChange={handleKeteranganSearchChange} // Handler pencarian untuk keterangan
                              />
                            </div>

                            {/* Input untuk mengisi keterangan lain */}
                            <div className="mt-4">
                              <input
                                type="text"
                                placeholder="Alasannya..."
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                                value={inputketeranganLain} // State untuk menyimpan nilai input keterangan lain
                                onChange={(e) =>
                                  setInputKeteranganLain(e.target.value)
                                } // Handler untuk mengubah state keterangan lain
                              />
                            </div>

                            <div className="mt-4">
                              <table ref={tableRef} className="min-w-full">
                                <thead>
                                  <tr
                                    className="bg-slate-500"
                                    // onClick={() =>
                                    //   handleKeteranganLainSelect(item)
                                    // }
                                  >
                                    <th className="text-white text-left rounded-l-lg px-4 py-2">
                                      Nama
                                    </th>
                                    <th className="text-white text-left rounded-r-lg px-4 py-2">
                                      Kelas
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredSiswaKeterangan
                                    .slice(
                                      (keteranganCurrentPage - 1) *
                                        keteranganItemsPerPage,
                                      keteranganCurrentPage *
                                        keteranganItemsPerPage
                                    )
                                    .map((row, index) => (
                                      <tr
                                        key={index}
                                        className={`cursor-pointer ${
                                          clickedRowIndex === index
                                            ? "bg-gray-100"
                                            : ""
                                        }`} // Latar belakang berubah saat baris diklik
                                        onClick={() =>
                                          handleRowClick(row, index)
                                        }
                                      >
                                        <td className="px-4 py-2 border-b">
                                          {row.nama_siswa}
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                          {row.kelas}
                                        </td>
                                        {/* Tambahkan sel data lain jika ada kolom tambahan */}
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="flex justify-between mt-4">
                              <button
                                className={`px-2 py-1 rounded ${
                                  keteranganTotalPages === 0 ||
                                  keteranganCurrentPage === 1
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-teal-400 hover:bg-teal-500 text-white"
                                }`}
                                disabled={
                                  keteranganTotalPages === 0 ||
                                  keteranganCurrentPage === 1
                                }
                                onClick={() =>
                                  setKeteranganCurrentPage(
                                    keteranganCurrentPage - 1
                                  )
                                }
                              >
                                Kembali
                              </button>
                              <span className="text-gray-900 px-2">
                                Page{" "}
                                {filteredSiswaKeterangan.length > 0
                                  ? keteranganCurrentPage
                                  : 0}{" "}
                                of {keteranganTotalPages}
                              </span>
                              <button
                                className={`px-2 py-1 rounded ${
                                  keteranganTotalPages === 0 ||
                                  keteranganCurrentPage === keteranganTotalPages
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-teal-400 hover:bg-teal-500 text-white"
                                }`}
                                disabled={
                                  keteranganTotalPages === 0 ||
                                  keteranganCurrentPage === keteranganTotalPages
                                }
                                onClick={() =>
                                  setKeteranganCurrentPage(
                                    keteranganCurrentPage + 1
                                  )
                                }
                              >
                                Selanjutnya
                              </button>
                            </div>

                            <div className="flex justify-between">
                              <button
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={togglePopupKeteranganLain} // Fungsi untuk menutup pop-up
                              >
                                Close
                              </button>
                              <button
                                ref={buttonRef}
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={handleKeteranganSubmit} // Fungsi untuk kirim jika diperlukan
                              >
                                Kirim
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative inline-block text-left">
                <div
                  onClick={toggleDropdown}
                  className="text-white px-4 py-2 rounded flex items-center"
                >
                  <span className="flex items-end lg:mt-2 lg:text-xl text-gray-200">
                    {isOpen ? "«" : "»"}
                    {isOpen && (
                      <div className="absolute left-8 border rounded shadow-lg -mb-2">
                        <button
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-left"
                          onClick={togglePopupPulang} // Ketika tombol "Pulang" diklik, buka pop-up
                        >
                          Pulang
                        </button>
                      </div>
                    )}
                  </span>
                </div>
              </div>
              {isPopupVisiblePulang && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                  <div className="bg-white p-3 rounded shadow-md">
                    <div className="bg-slate-600 p-2 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <select
                          className="border border-gray-300 rounded px-2 py-1"
                          value={pulangItemsPerPage} // Ganti dengan state yang sesuai
                          onChange={handlePulangItemsPerPageChange} // Ganti dengan handler yang sesuai
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="12">12</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Search..."
                          className="border border-gray-300 rounded px-2 py-1"
                          onChange={handlePulangSearchChange} // Handler pencarian untuk pulang
                        />
                      </div>

                      {/* Input untuk mengisi alasan pulang */}
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Alasan pulang..."
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                          value={inputPulang} // State untuk menyimpan nilai input alasan pulang
                          onChange={(e) => setInputPulang(e.target.value)} // Handler untuk mengubah state alasan pulang
                        />
                      </div>

                      <div className="mt-4">
                        <table ref={tableRef} className="min-w-full">
                          <thead>
                            <tr
                              className="bg-slate-500"
                              // onClick={() => handlePulangSelect(item)}
                            >
                              <th className="text-white text-left rounded-l-lg px-4 py-2">
                                Nama
                              </th>
                              <th className="text-white text-left rounded-r-lg px-4 py-2">
                                Kelas
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSiswaPulang
                              .slice(
                                (pulangCurrentPage - 1) * pulangItemsPerPage,
                                pulangCurrentPage * pulangItemsPerPage
                              )
                              .map((row, index) => (
                                <tr
                                  key={index}
                                  className={`cursor-pointer ${
                                    clickedRowIndex === index
                                      ? "bg-gray-100"
                                      : ""
                                  }`} // Latar belakang berubah saat baris diklik
                                  onClick={() => handleRowClick(row, index)}
                                >
                                  <td className="px-4 py-2 border-b">
                                    {row.nama_siswa}
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {row.kelas}
                                  </td>
                                  {/* Tambahkan sel data lain jika ada kolom tambahan */}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-between mt-4">
                        <button
                          className={`px-2 py-1 rounded ${
                            pulangTotalPages === 0 || pulangCurrentPage === 1
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-teal-400 hover:bg-teal-500 text-white"
                          }`}
                          disabled={
                            pulangTotalPages === 0 || pulangCurrentPage === 1
                          }
                          onClick={() =>
                            setPulangCurrentPage(pulangCurrentPage - 1)
                          }
                        >
                          Kembali
                        </button>
                        <span className="text-gray-900 px-2">
                          Page{" "}
                          {filteredSiswaSakit.length > 0
                            ? pulangCurrentPage
                            : 0}{" "}
                          of {pulangTotalPages}
                        </span>
                        <button
                          className={`px-2 py-1 rounded ${
                            pulangTotalPages === 0 ||
                            pulangCurrentPage === pulangTotalPages
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-teal-400 hover:bg-teal-500 text-white"
                          }`}
                          disabled={
                            pulangTotalPages === 0 ||
                            pulangCurrentPage === pulangTotalPages
                          }
                          onClick={() =>
                            setPulangCurrentPage(pulangCurrentPage + 1)
                          }
                        >
                          Selanjutnya
                        </button>
                      </div>

                      <div className="flex justify-between">
                        <button
                          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          onClick={togglePopupPulang} // Fungsi untuk menutup pop-up
                        >
                          Tutup
                        </button>
                        <button
                          ref={buttonRef}
                          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          onClick={handlePulangSubmit} // Fungsi untuk kirim jika diperlukan
                        >
                          Kirim
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-stretch justify-between p-4">
        {/* Column 1: Digital Clock */}
        <div
          className={`flex items-center justify-center p-4 w-full lg:w-auto h-full ${
            isDropdownVisible ? "md:mt-40 lg:mt-60" : "md:mt-0 lg:mt-0"
          }`}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 text-center h-full lg:ml-5">
            <DigitalClock /> {/* Menambahkan ukuran font */}
          </div>
        </div>

        {/* Column 2: Table */}
        <div className="w-full lg:w-2/3 p-4 h-full">
          <div className="bg-white p-3 rounded shadow-md h-full">
            <div className="bg-slate-600 p-2 rounded-lg h-full">
              <div className="p-2">
                <h2 className="text-sm pt-3 sm:text-2xl text-white font-bold">
                  Absensi Global
                </h2>
              </div>
              <div className="overflow-x-auto h-full">
                <DataTable
                  columns={
                    tableColumns as {
                      header: string;
                      accessor: keyof Kelas;
                      Cell?: ({ row }: { row: Kelas }) => JSX.Element;
                    }[]
                  }
                  data={kelas}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* scan barcode */}
      <div className="p-4 text-white">
        {/* <input
          ref={barcodeInputRef}
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scan Barcode"
          className="pointer-events-auto"
        />         */}
        <input
          ref={barcodeInputRef}
          type="text"
          value={barcode}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder=""
          className="pointer-events-auto"
        />
      </div>
      {/* <div>
            <h3>Absensi Siswa</h3>
            <form onSubmit={handleSubmit1}>
                <input
                    type="text"
                    placeholder="Masukkan ID Siswa"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    required
                />
                <button type="submit">Absen</button>
            </form>
            <p>{message}</p>
        </div> */}
    </>
  );
};
export default Page;
