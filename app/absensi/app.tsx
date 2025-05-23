import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataTable from "../components/dataTabel";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa"; // Menggunakan icon dari react-icons
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Pastikan ini diimpor

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
// Definisikan tipe untuk item yang sesuai dengan struktur data Anda
interface AbsensiItem {
  id_siswa: number;
  tanggal: string; // Format tanggal, misalnya "2024-12-10"
  keterangan: string; // Misalnya "H" (Hadir), "S" (Sakit), dsb
}
type SiswaItem = {
  id_siswa: number;
  nama_siswa: string;
  absensi: Record<string, { keterangan: string; pulang: boolean }>; // absensi adalah objek dengan string sebagai key dan value
  nomor_wali: string;
  jenis_kelamin: string;
  kelas:string;
  total_hadir:number;
  total_terlambat: number;
  total_alpa: number;
  total_sakit: number;
  total_izin:number;
  tanggal?: string;
  keterangan?: string;
  // pulang:string;
};
const Filters = () => {
  // const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [tableHeaders, setTableHeaders] = useState({
    headers: [],
    todayDate: null,
  });
  const [isPulangPagiOpen, setIsPulangPagiOpen] = useState(false);
  const [startTime, setStartTime] = useState("07:30");
  const [endTime, setEndTime] = useState("08:00");
  const [activeDay, setActiveDay] = useState(null);
  const [inactiveDays, setInactiveDays] = useState([]);

  // useEffect(() => {
  //   const today = new Date();
  //   console.log(today);
  //   const monthNames = [
  //     "Januari",
  //     "Februari",
  //     "Maret",
  //     "April",
  //     "Mei",
  //     "Juni",
  //     "Juli",
  //     "Agustus",
  //     "September",
  //     "Oktober",
  //     "November",
  //     "Desember",
  //   ];
  //   const currentMonthYear = `${
  //     monthNames[today.getMonth()]
  //   } ${today.getFullYear()}`;
  //   setSelectedMonthYear(currentMonthYear);

  //   const currentDay = today.getDate();
  //   setActiveDay(currentDay);
  //   // Set inactive days as the days before the current day
  //   const daysInMonth = new Date(
  //     today.getFullYear(),
  //     today.getMonth() + 1,
  //     0
  //   ).getDate();
  //   const inactiveDays = Array.from(
  //     { length: Math.min(currentDay - 1, 3) },
  //     (_, i) => i + 1
  //   );
  //   setInactiveDays(inactiveDays);

  //   generateTableHeaders(
  //     today.getMonth(),
  //     today.getFullYear(),
  //     today.getDate()
  //   );
  // }, []);

  // const handleMonthYearChange1 = (e) => {
  //   const [selectedMonth, selectedYear] = e.target.value.split(" ");
  //   const monthIndex = monthYearOptions.findIndex(
  //     (option) => option.month === selectedMonth
  //   );
  //   setSelectedMonthYear(e.target.value);
  //   generateTableHeaders(monthIndex, parseInt(selectedYear));
  // };

  const handleKelasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKelas(e.target.value);
  };

  // const monthYearOptions = getMonthYearOptions();

  // const generateTableHeaders = (monthIndex, year, todayDate = null) => {
  //   const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  //   const headers = [];
  //   for (let i = 1; i <= daysInMonth; i++) {
  //     headers.push(i);
  //   }
  //   setTableHeaders({ headers, todayDate });
  // };

  const handlePulangPagiClick = () => {
    setIsPulangPagiOpen(true);
  };

  const handlePulangPagiClose = () => {
    setIsPulangPagiOpen(false);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };

  const savePulangPagiTime = () => {
    // Simpan waktu pulang pagi sesuai logika bisnismu
    setIsPulangPagiOpen(false);
  };

  // const getStatusClass = (status) => {
  //   switch (status) {
  //     case "H":
  //       return "bg-green-500 text-white";
  //     case "I":
  //       return "bg-orange-500 text-white";
  //     case "A":
  //       return "bg-red-500 text-white";
  //     case "S":
  //       return "bg-sky-500 text-white";
  //     case "T":
  //       return "bg-gray-500 text-white";
  //     default:
  //       return "";
  //   }
  // };

  // const getAttendanceStatus = (student, day) => {
  //   return student.attendance[day] || "-";
  // };
  
  const handleExportExcel = () => {
    // Membuat worksheet dari data siswa
    const wsData = groupedData.map((item, index) => {
        const rowData = [
            index + 1, // Nomor urut
            item.nama_siswa, // Nama Siswa
            ...datesArray1.map((date) => {
                const isLibur = liburDays.includes(
                    new Date(date).toLocaleDateString("id-ID", { weekday: "long" })
                );

                const absensi = item.absensi[date] || {}; // Ambil data absensi berdasarkan tanggal
                const hadir = absensi.keterangan; // Status hadir
                const pulang = absensi.pulang; // Status pulang

                // Tentukan status berdasarkan hadir dan pulang
                if (isLibur) return "Libur";
                if (hadir === "Datang") return pulang ? "H✔" : "H";
                if (hadir === "Sakit") return "S";
                if (hadir === "Izin") return "I";
                if (hadir === "Alpa") return "A";
                if (hadir === "Terlambat") return pulang ? "T✔" : "T";
                return "-"; // Jika tidak ada status
            }),
            item.total_hadir || 0, // Total Hadir
            item.total_sakit || 0, // Total Sakit
            item.total_izin || 0, // Total Izin
            item.total_alpa || 0, // Total Alpa
            item.total_terlambat || 0, // Total Terlambat
            item.nomor_wali || "-", // Nomor Wali
        ];
        return rowData;
    });

    // Membuat worksheet dan workbook
    const ws = XLSX.utils.aoa_to_sheet([
        [
            "No", // Header kolom pertama
            "Nama Siswa", // Header kolom kedua
            ...datesArray1.map((date) => `${date}`), // Header untuk tanggal
            "H", // Jumlah hadir
            "S", // Jumlah alpa
            "I", // Jumlah sakit
            "A", // Jumlah izin
            "T", // Jumlah terlambat
            "Nomor Wali", // Nomor Wali
        ],
        ...wsData, // Data siswa
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi Siswa");

    // Mengekspor file Excel
    XLSX.writeFile(wb, "Absensi_Siswa.xlsx");
};


  const handleExportJPG = () => {
    // Logika untuk ekspor JPG
  };
  const [siswaData, setSiswaData] = useState([]);
  //   const headers = Object.keys(siswaData[0]);
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
  // // Mendapatkan tanggal sekarang
  // const currentDate = new Date();
  // const currentDay = currentDate.getDate();
  // const currentMonth = currentDate.getMonth() + 1;
  // const currentYear = currentDate.getFullYear();

  // // Membuat array bulan dan tahun
  // const monthsArray = [
  //   "Januari",
  //   "Februari",
  //   "Maret",
  //   "April",
  //   "Mei",
  //   "Juni",
  //   "Juli",
  //   "Agustus",
  //   "September",
  //   "Oktober",
  //   "November",
  //   "Desember",
  // ];

  // Menyusun opsi bulan untuk tahun sekarang
  // const monthYearOptions = monthsArray.map((month, index) => ({
  //   label: `${month} ${currentYear}`,
  //   value: `${currentYear}-${index + 1}`, // Format nilai: "YYYY-MM"
  // }));

  // // State untuk menyimpan bulan dan tahun yang dipilih
  // const [selectedMonthYear, setSelectedMonthYear] = useState(
  //   `${currentYear}-${currentMonth}`
  // );

  // // Mendapatkan bulan dan tahun dari pilihan
  // const [selectedYear, selectedMonth] = selectedMonthYear
  //   .split("-")
  //   .map(Number);

  // // Membuat array tanggal sesuai bulan dan tahun yang dipilih
  // const datesArray = Array.from(
  //   {
  //     length:
  //       selectedYear === currentYear && selectedMonth === currentMonth
  //         ? currentDay // Hanya hingga tanggal hari ini untuk bulan & tahun saat ini
  //         : new Date(selectedYear, selectedMonth, 0).getDate(), // Semua tanggal untuk bulan lainnya
  //   },
  //   (_, i) => i + 1
  // );


  
  

    const [absensi, setAbsensi] = useState([]);
    const [mappedData, setMappedData] = useState({});

    // useEffect(() => {
    //   // Ambil data absensi dari API
    //   axios.get(`${baseUrl}/absensi/all-absensi`)
    //     .then((response) => {
    //       const data = response.data.data;  // Data absensi yang didapatkan dari API
          
    //       // Mapping data absensi berdasarkan id_siswa dan tanggal
    //       const mapped = data.reduce((acc, item) => {
    //         const dateKey = new Date(item.tanggal).getDate(); // Mendapatkan tanggal dari '2024-12-10' menjadi 10
    //         if (!acc[item.id_siswa]) {
    //           acc[item.id_siswa] = {};
    //         }
    //         acc[item.id_siswa][dateKey] = item.keterangan; // Menyimpan keterangan berdasarkan tanggal
    //         return acc;
    //       }, {});
          
    //       setAbsensi(data);
    //       setMappedData(mapped);
    //     })
    //     .catch((error) => {
    //       console.error("Error fetching absensi data:", error);
    //     });
    // }, []);
    const [absensiData, setAbsensiData] = useState<SiswaItem[]>([]);
    const [todayDate, setTodayDate] = useState(null);
    const [datesArray1, setDatesArray1] = useState<string[]>([]);
    const [monthYearOptions, setMonthYearOptions] = useState<{ value: string; label: string }[]>([]);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const initialSelectedMonthYear = `${currentYear}-${currentMonth}`;
    const [selectedMonthYear, setSelectedMonthYear] = useState(initialSelectedMonthYear);
    const [isCurrentMonth, setIsCurrentMonth] = useState(false);
    useEffect(() => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      const selectedYearMonth = selectedMonthYear;
    
      if (selectedYearMonth === `${currentYear}-${currentMonth}`) {
        setIsCurrentMonth(true);
      } else {
        setIsCurrentMonth(false);
      }
    }, [selectedMonthYear]);

    useEffect(() => {
      const generateMonthYearOptions = () => {
        const options = [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
  
        // // Tambahkan bulan dari tahun-tahun sebelumnya yang sudah ada
        // const minYear = monthYearOptions.length
        //   ? parseInt(monthYearOptions[0].value.split("-")[0], 10)
        //   : currentYear;

        const minYear = currentYear - 3;
  
        for (let year = minYear; year <= currentYear; year++) {
          const maxMonth = year === currentYear ? currentMonth : 12;
          for (let month = 1; month <= maxMonth; month++) {
            const optionValue = `${year}-${String(month).padStart(2, "0")}`;
            options.push({
              value: optionValue,
              label: `${getMonthName(month)} ${year}`,
            });
          }
        }
  
        // Sortir opsi berdasarkan tahun dan bulan
        options.sort((a, b) => {
          const dateA = typeof a.value === "string" ? new Date(a.value).getTime() : a.value;
          const dateB = typeof b.value === "string" ? new Date(b.value).getTime() : b.value;
        
          return dateA - dateB;
        });
        
  
        setMonthYearOptions(options);
      };
  
      // Panggil fungsi untuk menghasilkan opsi awal
      generateMonthYearOptions();
  
      // Buat interval untuk memeriksa perubahan tahun secara dinamis
      const interval = setInterval(() => {
        generateMonthYearOptions();
      }, 1000 * 60 * 60 * 24); // Jalankan setiap hari
  
      // Bersihkan interval ketika komponen dilepas
      return () => clearInterval(interval);
    }, []);
  
    useEffect(() => {
      const generateDatesArray1 = () => {
        if (!selectedMonthYear) return;
        const [year, month] = selectedMonthYear.split('-').map((value) => parseInt(value, 10)); // Konversi ke number
        const dates = [];
        const firstDay = new Date(year, month - 1, 1);
        const today = new Date();
        // Pastikan currentMonth adalah angka
        const currentMonthNumber = parseInt(String(currentMonth), 10);
        const lastDay =
          selectedMonthYear === `${currentYear}-${String(currentMonthNumber + 1).padStart(2, '0')}`
          ? new Date()
          : new Date(currentYear, currentMonthNumber + 1, 0); // Gunakan currentMonthNumber yang sudah dikonversi ke number
        
        for (let i = firstDay.getDate(); i <= lastDay.getDate(); i++) {
          const date = new Date(year, month - 1, i);
          dates.push(formatDate(date));
        }
        setDatesArray1(dates);
      };
    
      generateDatesArray1();
    }, [selectedMonthYear]);
  
    const getMonthName = (month: number): string => {
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return monthNames[month - 1];
    };
  
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
  

    // useEffect(() => {
    //   // Mendapatkan tanggal hari ini dan 6 hari sebelumnya
    //   const today = new Date();
    //   const dates = [];
      
    //   // Loop untuk mendapatkan tanggal hari ini dan 6 hari sebelumnya
    //   for (let i = 0; i < 10; i++) {
    //     const date = new Date(today);
    //     date.setDate(today.getDate() - i); // Mengurangi tanggal untuk mendapatkan tanggal sebelumnya
    //     const formattedDate = date.toISOString().split("T")[0]; // Format YYYY-MM-DD
    //     dates.push(formattedDate);
    //   }
      
    //   setDatesArray1(dates); // Simpan array tanggal dalam state
  
    //   // Ambil data absensi dari API
    //   axios.get(`${baseUrl}/absensi/all-absensi`)
    //     .then((response) => {
    //       setAbsensiData(response.data.data); // Simpan data absensi ke dalam state
    //     })
    //     .catch((error) => {
    //       console.error("Error fetching absensi data:", error);
    //     });
    // }, []);

  // Filter siswa berdasarkan kelas yang dipilih
  useEffect(() => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Mendapatkan tanggal 1 bulan ini
  const dates = [];

  // Loop untuk mendapatkan tanggal 1 sampai hari ini
  let currentDate = firstDayOfMonth;
  while (currentDate <= today) {
    // Format tanggal menjadi YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Tambahkan 1 karena bulan dimulai dari 0
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; // Format YYYY-MM-DD
    dates.push(formattedDate);

    currentDate.setDate(currentDate.getDate() + 1); // Menambah satu hari
  }

  setDatesArray1(dates); // Menyimpan array tanggal dalam state

  // Ambil data absensi dari API
  axios
    .get(`${baseUrl}/absensi/all-absensi`)
    .then((response) => {
      setAbsensiData(response.data.data); // Simpan data absensi ke dalam state
      console.log('siswaa', response);
    })
    .catch((error) => {
      console.error("Error fetching absensi data:", error);
    });
}, []);
  
  const filteredSiswaData = selectedKelas
    ? absensiData.filter((siswa) => siswa.kelas === selectedKelas)
    : absensiData;

    // Contoh data siswa dengan absensi
    // const groupedData = filteredSiswaData.reduce<SiswaItem[]>((acc, item) => {
    //   // Cari siswa berdasarkan id_siswa
    //   let existingStudent = acc.find((siswa) => siswa.id_siswa === item.id_siswa);
      
    //   if (!existingStudent) {
    //     // Jika siswa belum ada di grup, tambahkan siswa baru
    //     existingStudent = {
    //       id_siswa: item.id_siswa,
    //       nama_siswa: item.nama_siswa,
    //       kelas: item.kelas,
    //       total_hadir: 0,
    //       total_terlambat: 0,
    //       total_alpa: 0,
    //       total_sakit: 0,
    //       total_izin: 0,
    //       pulang:item.pulang,
    //       absensi: {}, // Object untuk menyimpan absensi berdasarkan tanggal
    //       nomor_wali: item.nomor_wali,
    //       tanggal: new Date().toISOString(),
    //     };
    //     acc.push(existingStudent);
    //   }
      
    //   // Isi data absensi berdasarkan tanggal
    //   if (item.tanggal && item.tanggal.startsWith(selectedMonthYear)) {
    //     existingStudent.absensi[item.tanggal] = item.keterangan ?? "";
        
    //     // Hitung total berdasarkan keterangan
    //     if (item.keterangan === "Datang") {
    //       existingStudent.total_hadir++;
    //     } else if (item.keterangan === "Alpa") {
    //       existingStudent.total_alpa++;
    //     } else if (item.keterangan === "Terlambat") {
    //       existingStudent.total_terlambat++;
    //     } else if (item.keterangan === "Sakit") {
    //       existingStudent.total_sakit++;
    //     } else if (item.keterangan === "Izin") {
    //       existingStudent.total_izin++;
    //     }
    //   }
      
    //   return acc;
    // }, []);
    const groupedData = filteredSiswaData.reduce<SiswaItem[]>((acc, item) => {
      let existingStudent = acc.find((siswa) => siswa.id_siswa === item.id_siswa);
  
      if (!existingStudent) {
        existingStudent = {
          id_siswa: item.id_siswa,
          nama_siswa: item.nama_siswa,
          jenis_kelamin: item.jenis_kelamin,
          kelas: item.kelas,
          total_hadir: 0,
          total_terlambat: 0,
          total_alpa: 0,
          total_sakit: 0,      
          total_izin: 0,
          absensi: {}, // Menyimpan absensi berdasarkan tanggal
          nomor_wali: item.nomor_wali,
        };
        acc.push(existingStudent);
      }
  
      if (item.tanggal && item.tanggal.startsWith(selectedMonthYear)) {
        existingStudent.absensi[item.tanggal] = {
          keterangan: item.keterangan ?? "",
          pulang: (item as any).pulang ?? false,
 // Simpan status pulang per hari
        };
  
        // Hitung total berdasarkan keterangan
        if (item.keterangan === "Datang") {
          existingStudent.total_hadir++;
        } else if (item.keterangan === "Alpa") {
          existingStudent.total_alpa++;
        } else if (item.keterangan === "Terlambat") {
          existingStudent.total_terlambat++;
        } else if (item.keterangan === "Sakit") {
          existingStudent.total_sakit++;
        } else if (item.keterangan === "Izin") {
          existingStudent.total_izin++;
        }
      }
  
      return acc;
  }, []);
    
const [kelas, setKelas] = useState([]);
  const fetchKelasSiswaTotal = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/absensi/all-absensi`
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

   // State untuk menyimpan hari libur
   const [liburDays, setLiburDays] = useState<string[]>([]);
   const [tanggalLibur, setTanggalLibur] = useState<string[]>([]); // Tambahkan state untuk tanggal libur

  useEffect(() => {
    const fetchLiburDays = async () => {
      try {
        const response = await fetch(`${baseUrl}/setting/all-setting`);
        const data = await response.json();

        if (data.Status === 200) {
          setLiburDays(data.liburDays as string[]); // Simpan daftar hari libur
          setTanggalLibur(data.tanggalLibur as string[]); // Simpan daftar tanggal libur
        }
      } catch (error) {
        console.error("Error fetching liburDays:", error);
      }
    };

    fetchLiburDays();
  }, []);

  const [nomorwali, setnomorwali] = useState<SiswaItem[]>([]);
  //   const headers = Object.keys(nomorwali[0]);
  const fetchNomorWali = async () => {
    try {
      const response = await axios.get(`${baseUrl}/siswa/all-siswa`);
      setnomorwali(response.data.data); // Simpan data ke state nomorwali
      console.log('siswa iki', response);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  
  useEffect(() => {
    fetchNomorWali();
  }, []);


  // const [isOn, setIsOn] = useState(false);
  // useEffect(() => {
  //   // Ambil status dari backend saat komponen dimuat
  //   fetch(`${baseUrl}/api/toggle-status`)
  //     .then((res) => res.json())
  //     .then((data) => setIsOn(data.status))
  //     .catch((err) => console.error("Gagal mengambil status toggle:", err));
  // }, []);

  // const toggleSwitch = async () => {
  //   const newStatus = !isOn;
  //   setIsOn(newStatus);

  //   // Kirim status ke backend
  //   try {
  //     await fetch(`${baseUrl}/api/toggle-status`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ status: newStatus }),
  //     });
  //   } catch (error) {
  //     console.error("Gagal memperbarui status toggle:", error);
  //   }
  // };

  const [isOn, setIsOn] = useState(false);
  const [pkl, setPkl] = useState<Array<{ id_kelas: number; id_rombel: number; kelas: string; rombel: string }>>([]);
  const [selectedKelass, setSelectedKelass] = useState<{ id_kelas: number; id_rombel: number }[]>([]);
  const [isPklOpen, setIsPklOpen] = useState<boolean>(false);

useEffect(() => {
  const loadKelas = async () => {
    const response = await axios.get<{ data: { id_kelas: number; id_rombel: number; kelas: string; rombel: string }[] }>(`${baseUrl}/joinNonMaster/total-kelas-siswa`);
    setPkl(response.data.data);
  };
  loadKelas();
}, []);


const handlePklClick = () => {
  setIsPklOpen(true);
};

const handlePklClose = () => {
  setIsPklOpen(false);
};
const handleCheckboxChange = (id_kelas: number, id_rombel: number) => {
  setSelectedKelass((prevSelected) => {
    const isSelected = prevSelected.some(item => item.id_kelas === id_kelas && item.id_rombel === id_rombel);

    return isSelected
      ? prevSelected.filter(item => !(item.id_kelas === id_kelas && item.id_rombel === id_rombel))
      : [...prevSelected, { id_kelas, id_rombel }];
  });
};



const handleSavePkl = async () => {
  try {
    await axios.post(`${baseUrl}/absensi/update-absensi-pkl`, {
      kelasTerpilih: selectedKelass.length > 0 ? selectedKelass : [],
    });

    toast.success("Kelas PKL berhasil disimpan ke absensi!");
    setIsPklOpen(false);
  } catch (error) {
    console.error("Gagal menyimpan absensi PKL:", error);
    toast.error("Terjadi kesalahan saat menyimpan absensi PKL.");
  }
};



useEffect(() => {
  const loadSelectedPkl = async () => {
    try {
      const response = await axios.get<{ data: { id_kelas: number; id_rombel: number }[] }>(`${baseUrl}/absensi/get-absensi-pkl`);
      console.log("Data dari API:", response.data.data); // Debugging

      setSelectedKelass(response.data.data);
      setIsOn(response.data.data.length > 0);
    } catch (error) {
      console.error("Gagal mengambil kelas PKL:", error);
    }
  };

  loadSelectedPkl();
}, []);





  return (
    <div className="rounded-lg max-w-full p-3 bg-slate-100">
      <div className="pt-7 ml-7">
        <h1 className="text-2xl font-bold">Absensi</h1>
        <nav>
          <ol className="flex space-x-2 text-sm text-gray-700">
            <li>
              <a href="index.html" className="text-teal-500 hover:underline">
                Home
              </a>
            </li>
            <li>
              <span className="text-gray-500 ">/</span>
            </li>
            <li className="text-gray-500">Absensi</li>
          </ol>
        </nav>
      </div>
      <div className="filters-container bg-white rounded-lg shadow-md p-3 m-4 lg:p-6 border">
        <div className="bg-slate-600  px-2 rounded-xl">
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 my-4 items-center">
              <div className="lg:flex-row justify-between items-center">
                <div className="items-center lg:mb-0 space-x-2 lg:order-1">
                  <select
                    value={selectedMonthYear}
                    onChange={(e) => setSelectedMonthYear(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm sm:text-xs"
                  >
                    {monthYearOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <select
                  value={selectedKelas}
                  onChange={handleKelasChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm sm:text-xs"
                >
                  <option value="">Pilih Kelas</option>
                  {Array.isArray(absensiData) &&
                    Array.from(new Set(absensiData.map((siswa) => siswa.kelas))).map(
                      (kelasOption) => (
                        <option key={kelasOption} value={kelasOption}>
                          {kelasOption}
                        </option>
                      )
                    )}
                </select>
              </div>

              <div className="w-full md:w-auto flex items-center">
                <button
                  onClick={handleExportExcel}
                  className="w-full p-2 border bg-emerald-500 rounded text-xs text-white sm:text-sm"
                >
                  Excel
                </button>
              </div>

              {/* <div className="w-full md:w-auto flex items-center">
                <button
                  onClick={handlePrint}
                  className="w-full p-2 border bg-blue-500 rounded text-xs text-white sm:text-sm"
                >
                  Print
                </button>
              </div> */}
              <div className="w-full md:w-auto flex items-center">
                <button
                  onClick={handlePulangPagiClick}
                  className="w-full p-2 border bg-teal-400 rounded text-xs text-white sm:text-sm"
                >
                  Pulang Pagi
                </button>
              </div>
              {/* <button
                onClick={toggleSwitch}
                className={`w-16 h-8 flex items-center bg-gray-300 rounded-full p-1 transition duration-300 ${isOn ? "bg-green-500" : "bg-gray-400"}`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-300 ${isOn ? "translate-x-8" : "translate-x-0"}`}
                ></div>
              </button> */}
              <div>
              <div className="w-full md:w-auto flex items-center">
                <button
                  onClick={handlePklClick}
                  className="w-full p-2 border bg-purple-400 rounded text-xs text-white sm:text-sm"
                >
                  PKL
                </button>  
                {isPklOpen && (
                  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-md shadow-md w-80">
                      <h2 className="text-xl text-center font-semibold mb-4">PKL</h2>
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left">Kelas</th>
                            <th>Pilih</th>
                          </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(pkl) &&
  pkl.map((item) => (
    <tr key={item.id_kelas}> {/* Gunakan id_kelas sebagai key */}
      <td className="text-left">{item.kelas}</td>
      <td>
      <input
  type="checkbox"
  checked={selectedKelass.some(sel => sel.id_kelas === item.id_kelas && sel.id_rombel === item.id_rombel)}
  onChange={() => handleCheckboxChange(item.id_kelas, item.id_rombel)}
/>


      </td>
    </tr>
  ))}

                        </tbody>
                      </table>
                      {!isOn && <p className="text-red-500 text-sm mt-2"></p>}
                      <div className="flex justify-end mt-4 gap-2">
                      <div className="flex justify-end mt-4 gap-2">
                          <button onClick={handlePklClose} className="p-2 bg-gray-300 text-gray-700 rounded">
                            Tutup
                          </button>
                          <button onClick={handleSavePkl} className="p-2 bg-blue-500 text-white rounded">
                            Simpan
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>
            <ToastContainer className="mt-14" />
            {/* Tabel */}
            <div className="overflow-x-auto">
              <table className="w-full text-left mt-4 border-collapse">
                <thead>
                  <tr className="ml-2">
                    <th className="rounded-l-lg text-white text-xs sm:text-xs p-2 bg-slate-500">
                      No
                    </th>
                    <th className="text-white text-xs sm:text-xs p-2 bg-slate-500">
                      Nama
                    </th>
                    
                    {datesArray1.map((date, index) => (
                      <th key={index}
                      className="text-white text-xs sm:text-xs p-2 text-center bg-slate-500">{`${date}`}
                      </th>
                    ))}
                    <th className="text-white text-xs sm:text-xs p-2 text-center bg-slate-500">
                      H
                    </th>
                    <th className="text-white text-xs sm:text-xs p-2 text-center bg-slate-500">
                      S
                    </th>
                    <th className="text-white text-xs sm:text-xs p-2 text-center bg-slate-500">
                      I
                    </th>
                    <th className="text-white text-xs sm:text-xs p-2 text-center bg-slate-500">
                      A
                    </th>
                    <th className="text-white text-xs sm:text-xs p-2 text-center bg-slate-500">
                      T
                    </th>
                    <th className="text-white text-xs sm:text-xs p-2 text-center bg-slate-500 rounded-r-lg">
                      No Wali
                    </th>
                  </tr>
                </thead>
                <tbody>
                    {Array.isArray(groupedData) && groupedData.map((item, index) => (
                      <tr key={item.id_siswa || index}>
                        <td className="border-b text-white bg- text-xs sm:text-xs p-2"> {index + 1} </td>
                        <td className="border-b text-white text-xs sm:text-xs p-2"> {item.nama_siswa} </td>
                        {datesArray1.map((date) => {
                            //Cek apakah hari tersebut adalah libur berdasarkan hari
                            const isLiburByDay = liburDays.includes(
                              new Date(date).toLocaleDateString("id-ID", {
                                weekday: "long",
                              })
                            );

                            // Cek apakah tanggal tersebut adalah libur berdasarkan tanggal
                            const isLiburByDate = tanggalLibur.some(liburDate =>
                              new Date(date).toLocaleDateString("id-ID") === new Date(liburDate).toLocaleDateString("id-ID")
                            );
                            

                            const isLibur = isLiburByDay || isLiburByDate; // Gabungkan keduanya

                            const absensi = item.absensi[date] || {}; // Ambil data absensi berdasarkan tanggal
                            const hadir = absensi.keterangan; // Status hadir
                            const pulang = absensi.pulang; // Status pulang

                            let statusClass = "";
                            let statusLabel = "-"; // Default jika tidak ada absensi

                            if (isLibur) {
                              statusLabel = "Libur";
                              statusClass = "";
                            } else if (hadir === "Datang") {
                              statusLabel = pulang ? "H✔" : "H";
                              statusClass = pulang
                                ? "bg-green-700 text-white"
                                : "bg-green-500 text-white opacity-50";
                            } else if (hadir === "Terlambat") {
                              statusLabel = pulang ? "T✔" : "T";
                              statusClass = pulang
                                ? "bg-gray-700 text-white"
                                : "bg-gray-500 text-white opacity-50";
                            } else if (hadir === "Ketinggalan") {
                              statusLabel = pulang ? "K✔" : "K";
                              statusClass = pulang
                                ? " bg-neutral-600 text-black"
                                : " bg-neutral-400 text-white opacity-50";
                            } else if (hadir === "Izin") {
                              statusLabel = "I";
                              statusClass = "bg-orange-500 text-";
                            } else if (hadir === "Sakit") {
                              statusLabel = "S";
                              statusClass = "bg-blue-500 text-white";
                            } else if (hadir === "Alpa") {
                              statusLabel = "A";
                              statusClass = "bg-red-500 text-white";
                            } else if (hadir === "PKL") {
                              statusLabel = "PKL";
                              statusClass = "bg-purple-500 text-white";
                            }

                            return (
                              <td key={`${item.id_siswa}-${date}`}
                                  className={`border-b text-white text-xs text-center p-2 ${statusClass}`}>
                                {statusLabel}
                              </td>
                            );
                        })}
                        <td className="border-b text-white text-center text-xs sm:text-xs p-2 font-bold"> {item.total_hadir} </td>
                        <td className="border-b text-white text-center text-xs sm:text-xs p-2 font-bold"> {item.total_sakit} </td>
                        <td className="border-b text-white text-center text-xs sm:text-xs p-2 font-bold"> {item.total_izin} </td>
                        <td className="border-b text-white text-center text-xs sm:text-xs p-2 font-bold"> {item.total_alpa} </td>
                        <td className="border-b text-white text-center text-xs sm:text-xs p-2 font-bold"> {item.total_terlambat} </td>
                        <td className="border-b text-white text-center text-xs sm:text-xs p-2 font-bold">
                          {(() => {
                            const wali = nomorwali.find((n) => n.id_siswa === item.id_siswa);
                            if (wali?.nomor_wali) {
                              const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD (sesuai format data absensi)
                              const sebutan = item.jenis_kelamin === "P" ? "siswi" : "siswa"; // Cek jenis kelamin
                              const todayFormatted = new Date().toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }); // Format: Senin, 19 Februari 2024

                              const absensiHariIni = item.absensi[today]?.keterangan || "Tidak Diketahui"; // Ambil status absensi

                              const message = encodeURIComponent(
                                `Assalamualaikum Wr. Wb. Selamat pagi, SMK Budi Mulia Pakisaji mengabarkan bahwa ${sebutan} ${item.nama_siswa} pada hari ini, ${todayFormatted}, tercatat: ${absensiHariIni}.`
                              );

                              return (
                                <a
                                  href={`https://wa.me/${wali.nomor_wali.replace(/[^0-9]/g, "")}?text=${message}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-white hover:text-green-500"
                                >
                                  <FaWhatsapp className="text-green-500 text-xl lg:ml-4 md:ml-2" />
                                </a>
                              );
                            }
                            return "-"; // Jika tidak ada nomor, tampilkan "-"
                          })()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Modal Pulang Pagi */}
            {isPulangPagiOpen && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-md shadow-md">
                  <h2 className="text-xl font-semibold mb-4">
                    Atur Waktu Pulang Pagi
                  </h2>
                  <div className="mb-4">
                    <label className="block mb-2">Dari</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={handleStartTimeChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Sampai</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={handleEndTimeChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={savePulangPagiTime}
                      className="mr-2 p-2 bg-teal-500 text-white rounded"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={handlePulangPagiClose}
                      className="p-2 bg-gray-300 text-gray-700 rounded"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white p-4 ml-4 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Keterangan Absen</h2>

        <div className="grid gap-2 text-gray-600">
          <div><span className="font-bold text-green-500">H</span> = Siswa hadir tepat waktu dan belum pulang</div>
          <div><span className="font-bold text-blue-500">S</span> = Sakit</div>
          <div><span className="font-bold text-orange-500">I</span> = Izin</div>
          <div><span className="font-bold text-red-500">A</span> = Alpa</div>
          <div><span className="font-bold text-gray-500">T</span> = Siswa terlambat dan belum pulang</div>
          <div><span className="font-bold text-purple-500">PKL</span> = Siswa yang tengah menjalani PKL</div>
          <div>
            <span className="font-bold text-green-500">H✔</span>, 
            <span className="font-bold text-gray-500"> T✔</span>, 
            <span className="font-bold text-gray-600"> K✔</span>, = Siswa sudah pulang
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
