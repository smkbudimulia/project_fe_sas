"use client";
import React, { useState, useEffect, useRef } from "react";
import TimeDropdown from "./TImeDropdown"; // Pastikan nama file benar
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError } from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// const hal = ({ time, onChange }) => {

//   const timeOptions = [];

//   for (let hour = 0; hour < 24; hour++) {
//     for (let minute = 0; minute < 60; minute++) {
//       const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//       timeOptions.push(formattedTime);
//     }
//   }

//   return (

//     <select
//       value={`${time.hours}:${time.minutes}`}
//       onChange={(e) => {
//         const [hours, minutes] = e.target.value.split(':');
//         onChange('hours', hours);
//         onChange('minutes', minutes);
//       }}
//       className="p-1 border rounded-md h-10 w-24 text-sm bg-white border-slate-400"
//     >
//       {timeOptions.map((option) => (
//         <option key={option} value={option}>
//           {option}
//         </option>
//       ))}
//     </select>
//   );
// };
interface Item {
  jam_masuk: string;
  jam_pulang: string;
  jam_terlambat: string;
  id_setting: string;
  hari: string;
  tanggal_libur?: string; // Opsional, bisa ada atau tidak
}

const Schedule = () => {
  const [settings, setSettings] = useState<Item[]>([]);
  // const [settings, setSettings] = useState<any[]>([]);// State untuk menyimpan data settings
  console.log("Tabel Seting", settings);
  const hariUrutan = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${baseUrl}/setting/all-setting`);
        console.log("Data fetched:", response.data.data); // Debug: Cek data
        // Urutkan data berdasarkan 'hari' secara abjad (A-Z)
        const sortedData = response.data.data.sort((a: any, b: any) => {
          // Mengurutkan berdasarkan hari menggunakan index hari dalam urutan
          return hariUrutan.indexOf(a.hari) - hariUrutan.indexOf(b.hari);
        });
        setSettings(sortedData);
        setSettings(response.data.data); // Simpan data yang diterima dari API
      } catch (error) {
        console.error("Error fetching settings data:", error);
      }
    };

    fetchSettings();
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [arrivalTimes, setArrivalTimes] = useState({
    from: "",
    to: "",
  });
  const [departureTimes, setDepartureTimes] = useState({
    from: "",
    to: "",
  });
  const [latenessTimes, setLatenessTimes] = useState({
    from: "",
    to: "",
  });

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleTimeChange = (type: string, value: string, timeType: string) => {
    const newValue = value === "" ? "" : value; // Jika value kosong, simpan 'libur'

    if (type === "arrival") {
      setArrivalTimes((prevTimes) => ({
        ...prevTimes,
        [timeType]: newValue,
      }));
    } else if (type === "departure") {
      setDepartureTimes((prevTimes) => ({
        ...prevTimes,
        [timeType]: newValue,
      }));
    } else if (type === "lateness") {
      setLatenessTimes((prevTimes) => ({
        ...prevTimes,
        [timeType]: newValue,
      }));
    }

    // Simpan ke database (sesuaikan dengan cara Anda menyimpan data)
    saveToDatabase(type, timeType, newValue);
  };

  // Contoh fungsi untuk menyimpan ke database
  const saveToDatabase = (type: string, value: string, timeType: string) => {
    const tableName = `${type}Times`; // Misalnya 'arrivalTimes'
    const data = {
      [timeType]: value,
    };

    console.log(`Menyimpan ke tabel ${tableName}:`, data);
    // Ganti dengan API atau mekanisme penyimpanan yang sesuai
  };

  const handleDayChange = (day: string) => {
    setSelectedDays((prevDays) => {
      if (prevDays.includes(day)) {
        // Hapus hari dari array jika sudah ada
        return prevDays.filter((d) => d !== day);
      } else {
        // Tambahkan hari ke array jika belum ada
        return [...prevDays, day];
      }
    });
  };

  const formatTime = (time: string) => {
    return time.replace(":", "."); // Mengubah format dari HH:mm menjadi HH.mm
  };

  const [existingData, setExistingData] = useState([]);
  const [holidayDate, setHolidayDate] = useState(""); // Untuk menyimpan tanggal libur



  // Fungsi untuk mengambil data terbaru setelah simpan atau update
  
  const handleSaveClick = async () => {
    if (selectedDays.length === 0 && !holidayDate) {
      toast.error("Pilih setidaknya satu hari atau tanggal libur!");
      return;
    }
  
    try {
      const responseExistingData = await axios.get(`${baseUrl}/setting/all-setting`);
      const existingData = responseExistingData.data.data;
  
      // **LOGIKA BARU**: Memproses input berdasarkan apakah ada hari, tanggal, atau keduanya
      const scheduleArray = [];
  
      if (selectedDays.length > 0) {
        selectedDays.forEach((day) => {
          scheduleArray.push({
            hari: day,
            jam_masuk: [formatTime(arrivalTimes.from), formatTime(arrivalTimes.to)],
            jam_pulang: [formatTime(departureTimes.from), formatTime(departureTimes.to)],
            jam_terlambat: [formatTime(latenessTimes.from), formatTime(latenessTimes.to)],
            tanggal_libur: "", // Kosongkan tanggal jika hanya hari yang dipilih
          });
        });
      }
  
      if (holidayDate) {
        scheduleArray.push({
          hari: "", // Kosongkan hari jika hanya tanggal yang dipilih
          jam_masuk: ["libur", "libur"],
          jam_pulang: ["libur", "libur"],
          jam_terlambat: ["libur", "libur"],
          tanggal_libur: holidayDate,
        });
      }
  
      const toUpdate: any[] = [];
      const toInsert: any[] = [];
  
      scheduleArray.forEach((item) => {
        const existingItem = existingData.find((data: any) => 
          data.hari === item.hari && data.tanggal_libur === item.tanggal_libur
        );
  
        if (existingItem) {
          toUpdate.push(item);
        } else {
          toInsert.push(item);
        }
      });
  
      if (toUpdate.length > 0) {
        const updateResponse = await axios.put(`${baseUrl}/setting/setting-sistem`, toUpdate);
        if (updateResponse.data.success) {
          toast.success("Jadwal berhasil diperbarui!");
        } else {
          toast.error("Gagal memperbarui jadwal");
        }
      }
  
      if (toInsert.length > 0) {
        const insertResponse = await axios.post(`${baseUrl}/setting/setting-sistem`, toInsert);
        if (insertResponse.data.success) {
          toast.success("Jadwal berhasil disimpan!");
        } else {
          toast.error("Gagal menyimpan jadwal");
        }
      }
  
      await fetchUpdatedData();
  
      setArrivalTimes({ from: "", to: "" });
      setDepartureTimes({ from: "", to: "" });
      setLatenessTimes({ from: "", to: "" });
      setSelectedDays([]);
      setHolidayDate("");
    } catch (error) {
      // console.error("Error:", error);
      toast.error("Terjadi kesalahan saat menyimpan jadwal");
    }   
  };
  
  const fetchUpdatedData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/setting/all-setting`);
      const updatedData = response.data.data;
      // Update state dengan data terbaru yang diperoleh
      setExistingData(updatedData); // Misalnya menggunakan setExistingData untuk mengupdate state
    } catch (error) {
      // console.error("Error fetching updated data:", error);
      toast.error("Terjadi kesalahan saat memuat data terbaru");
    }
  };

  const [logo, setLogo] = useState<string | ArrayBuffer | null>(null);
  const [instansiName, setInstansiName] = useState("");
  const [instansi, setInstansi] = useState<{ nama_instansi: string; logo: string } | null>(null);
  useEffect(() => {
    const fetchInstansi = async () => {
      try {
        const response = await fetch(`${baseUrl}/setting/all-instansi`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // Ambil instansi pertama (atau sesuaikan jika lebih dari satu)
          setInstansi(data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching instansi:', error);
      }
    };

    fetchInstansi();
  }, []);
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result); // Save the logo data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInstansiNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInstansiName(event.target.value);
  };

  
  // Fungsi untuk menangani klik tombol Simpan
 const handleSave = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nama_instansi', instansiName);
    if (logo && logo instanceof Blob) {
      formData.append('logo', logo);  // Menambahkan file logo jika ada dan pastikan tipe nya adalah Blob
    }
    

    try {
      const response = await axios.post(`${baseUrl}/setting/instansi`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(response.data.message); // Pesan sukses dari backend
      setInstansiName("");
      setLogo("");
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim data');
    }
  };

  // Fungsi untuk mengonversi ArrayBuffer menjadi objek URL
  const arrayBufferToUrl = (buffer: ArrayBuffer): string => {
    const blob = new Blob([buffer]); // Membuat Blob dari ArrayBuffer
    return URL.createObjectURL(blob); // Membuat URL objek dari Blob
  };

  // Misalnya logo adalah ArrayBuffer
  const logo1: ArrayBuffer = new ArrayBuffer(8); // Contoh ArrayBuffer

  // Membuat URL objek dari ArrayBuffer
  const imageUrl = arrayBufferToUrl(logo1);

  return (
    <>
      <div className="bg-slate-100 min-h-screen">
        <div className="container mx-auto p-4">
          <div className="flex flex-col space-y-4">
            {/* Kolom 1 */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-slate-600 text-lg font-semibold mb-4">
                Setting Waktu Absensi
              </div>
              <div className="bg-white shadow-md rounded-lg border border-slate-300 p-4">
                <h2 className="text-lg font-semibold mb-4">
                  {" "}
                  Set Hari dan Waktu
                </h2>
                {/* Checkbox Rendering untuk Hari */}
                <div className="flex flex-wrap mb-4">
                  <div className="flex items-center mr-4 mb-2">
                    <input
                      type="checkbox"
                      id="Senin"
                      className="mr-2"
                      onChange={() => handleDayChange("Senin")}
                    />
                    <label htmlFor="Senin" className="text-sm text-slate-600">
                      Senin
                    </label>
                  </div>
                  <div className="flex items-center mr-4 mb-2">
                    <input
                      type="checkbox"
                      id="Selasa"
                      className="mr-2"
                      onChange={() => handleDayChange("Selasa")}
                    />
                    <label htmlFor="Selasa" className="text-sm text-slate-600">
                      Selasa
                    </label>
                  </div>
                  <div className="flex items-center mr-4 mb-2">
                    <input
                      type="checkbox"
                      id="Rabu"
                      className="mr-2"
                      onChange={() => handleDayChange("Rabu")}
                    />
                    <label htmlFor="Rabu" className="text-sm text-slate-600">
                      Rabu
                    </label>
                  </div>
                  <div className="flex items-center mr-4 mb-2">
                    <input
                      type="checkbox"
                      id="Kamis"
                      className="mr-2"
                      onChange={() => handleDayChange("Kamis")}
                    />
                    <label htmlFor="Kamis" className="text-sm text-slate-600">
                      Kamis
                    </label>
                  </div>
                  <div className="flex items-center mr-4 mb-2">
                    <input
                      type="checkbox"
                      id="Jumat"
                      className="mr-2"
                      onChange={() => handleDayChange("Jumat")}
                    />
                    <label htmlFor="Jumat" className="text-sm text-slate-600">
                      Jumat
                    </label>
                  </div>
                  <div className="flex items-center mr-4 mb-2">
                    <input
                      type="checkbox"
                      id="Sabtu"
                      className="mr-2"
                      onChange={() => handleDayChange("Sabtu")}
                    />
                    <label htmlFor="Sabtu" className="text-sm text-slate-600">
                      Sabtu
                    </label>
                  </div>
                  <div className="flex items-center mr-4 mb-2">
                    <input
                      type="checkbox"
                      id="Minggu"
                      className="mr-2"
                      onChange={() => handleDayChange("Minggu")}
                    />
                    <label htmlFor="Minggu" className="text-sm text-slate-600">
                      Minggu
                    </label>
                  </div>
                  <div className="flex flex-col mb-4">
                    <label
                      htmlFor="tanggal_libur"
                      className="text-sm text-slate-600 mb-2"
                    >
                      Tanggal Libur
                    </label>
                    <input
                      type="date"
                      id="tanggal_libur"
                      className="border border-slate-300 rounded-md p-2"
                      value={holidayDate}
                      onChange={(e) => setHolidayDate(e.target.value)} // Fungsi untuk update nilai tanggal libur
                    />
                  </div>
                </div>

                {/* Bagian waktu datang, pulang, dan keterlambatan */}
                <div className="flex flex-row flex-wrap gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-600 mb-2">
                      Jam Datang
                    </h2>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600 mb-1">
                            Dari
                          </span>
                          <input
                            type="time"
                            value={arrivalTimes.from}
                            onChange={(e) => {
                              const timeValue = e.target.value;
                              const [hours, minutes] = timeValue
                                .split(":")
                                .map(Number);

                              if (timeValue === "") {
                                handleTimeChange("arrival", "libur", "from"); // Simpan nilai 'libur' jika waktu kosong
                                return;
                              }

                              if (minutes > 59) {
                                alert("Menit tidak boleh lebih dari 59");
                                return; // Batalkan perubahan
                              }

                              handleTimeChange("arrival", timeValue, "from");
                            }}
                          />
                        </div>
                        <span className="mt-7">-</span>
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600 mb-1">
                            Sampai
                          </span>
                          <input
                            type="time"
                            value={arrivalTimes.to}
                            onChange={(e) => {
                              const timeValue = e.target.value;
                              const [hours, minutes] = timeValue
                                .split(":")
                                .map(Number);

                              if (timeValue === "") {
                                handleTimeChange("arrival", "libur", "to"); // Simpan nilai 'libur' jika waktu kosong
                                return;
                              }

                              if (minutes > 59) {
                                alert("Menit tidak boleh lebih dari 59");
                                return; // Batalkan perubahan
                              }

                              handleTimeChange("arrival", timeValue, "to");
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-600 mb-2">
                      Jam Terlambat
                    </h2>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600 mb-1">
                            Dari
                          </span>
                          <input
                            type="time"
                            value={latenessTimes.from}
                            onChange={(e) => {
                              const timeValue = e.target.value;
                              const [hours, minutes] = timeValue
                                .split(":")
                                .map(Number);

                              if (timeValue === "") {
                                handleTimeChange("lateness", "libur", "from"); // Simpan nilai 'libur' jika waktu kosong
                                return;
                              }

                              if (minutes > 59) {
                                alert("Menit tidak boleh lebih dari 59");
                                return; // Batalkan perubahan
                              }

                              handleTimeChange("lateness", timeValue, "from");
                            }}
                          />
                        </div>
                        <span className="mt-7">-</span>
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600 mb-1">
                            Sampai
                          </span>
                          <input
                            type="time"
                            value={latenessTimes.to}
                            onChange={(e) => {
                              const timeValue = e.target.value;
                              const [hours, minutes] = timeValue
                                .split(":")
                                .map(Number);

                              if (timeValue === "") {
                                handleTimeChange("lateness", "libur", "to"); // Simpan nilai 'libur' jika waktu kosong
                                return;
                              }

                              if (minutes > 59) {
                                alert("Menit tidak boleh lebih dari 59");
                                return; // Batalkan perubahan
                              }

                              handleTimeChange("lateness", timeValue, "to");
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-600 mb-2">
                      Jam Pulang
                    </h2>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600 mb-1">
                            Dari
                          </span>
                          <input
                            type="time"
                            value={departureTimes.from}
                            onChange={(e) => {
                              const timeValue = e.target.value;
                              const [hours, minutes] = timeValue
                                .split(":")
                                .map(Number);

                              if (timeValue === "") {
                                handleTimeChange("departure", "libur", "from"); // Simpan nilai 'libur' jika waktu kosong
                                return;
                              }

                              if (minutes > 59) {
                                alert("Menit tidak boleh lebih dari 59");
                                return; // Batalkan perubahan
                              }

                              handleTimeChange("departure", timeValue, "from");
                            }}
                          />
                        </div>
                        <span className="mt-7">-</span>
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600 mb-1">
                            Sampai
                          </span>
                          <input
                            type="time"
                            value={departureTimes.to}
                            onChange={(e) => {
                              const timeValue = e.target.value;
                              const [hours, minutes] = timeValue
                                .split(":")
                                .map(Number);

                              if (timeValue === "") {
                                handleTimeChange("departure", "libur", "to"); // Simpan nilai 'libur' jika waktu kosong
                                return;
                              }

                              if (minutes > 59) {
                                alert("Menit tidak boleh lebih dari 59");
                                return; // Batalkan perubahan
                              }

                              handleTimeChange("departure", timeValue, "to");
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-teal-400 text-white rounded-md hover:bg-teal-500"
                    onClick={handleSaveClick}
                  >
                    Simpan
                  </button>
                </div>
              </div>
              {/* Kolom 2 - Hasil Simpanan */}
              <div className="p-4 mt-4 border rounded-lg bg-slate-600 text-white">
                <h2 className="text-lg font-semibold mb-4">
                  Hari Aktif Sekolah
                </h2>
                <div className="p-4 border rounded-md bg-white text-slate-600">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {settings.length > 0 ? (
                      settings
                        .filter((item) => !item.tanggal_libur) // Filter data agar tidak menampilkan tanggal libur
                        .map((item) => {
                          // Memisahkan jam masuk
                          const [jamMasukAwal, jamMasukAkhir] =
                            item.jam_masuk.split(",");
                          const [jamPulangAwal, jamPulangAkhir] =
                            item.jam_pulang.split(",");
                          const [jamTerlambatAwal, jamTerlambatAkhir] =
                            item.jam_terlambat.split(",");
                          return (
                            <div
                              key={item.id_setting}
                              className="bg-white p-4 shadow-2xl rounded"
                            >
                              <h2 className="text-lg font-bold text-gray-700">
                                {item.hari}
                              </h2>
                              <p>
                                <strong>Jam Masuk :</strong> {jamMasukAwal}{" "}
                                <strong>-</strong> {jamMasukAkhir}
                              </p>
                              <p>
                                <strong>Jam Terlambat :</strong>{" "}
                                {jamTerlambatAwal} <strong>-</strong>{" "}
                                {jamTerlambatAkhir}
                              </p>
                              <p>
                                <strong>Jam Pulang :</strong> {jamPulangAwal}{" "}
                                <strong>-</strong> {jamPulangAkhir}
                              </p>
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-gray-500">Tidak ada data.</p>
                    )}
                  </div>
                </div>
              </div>

              
            </div>
            <ToastContainer className="mt-14" />
            {/* Kolom 2 - Hari dalam Seminggu */}
            <div className="p-4 border rounded-lg bg-white shadow-md">
              <div className="p-4 border rounded-lg bg-white shadow-md">
                <h2 className="text-lg font-semibold mb-4 text-slate-600">
                  Upload Logo dan Nama Instansi
                </h2>

                {/* Logo Upload */}
                <div className="flex items-center mb-4">
                  <label
                    htmlFor="logo"
                    className="mr-4 text-slate-600 font-semibold"
                  >
                    Pilih
                  </label>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    className="border rounded-lg p-2 w-full"
                    onChange={handleLogoChange}
                  />
                </div>

                {/* Instansi Name Input */}
                <div className="mb-4">
                  <label
                    htmlFor="instansiName"
                    className="block mb-2 text-slate-600 font-semibold"
                  >
                    Nama Instansi
                  </label>
                  <input
                    type="text"
                    id="instansiName"
                    value={instansiName}
                    onChange={handleInstansiNameChange}
                    className="border rounded-lg p-2 w-full"
                    placeholder="Masukkan Nama Instansi"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSave}
                    className="bg-teal-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-500"
                  >
                    Simpan
                  </button>
                </div>
              </div>

              {/* Kolom Hasil */}
              <div className="p-4 border rounded-lg bg-slate-600 shadow-md mt-4">
                <h2 className="text-lg font-semibold mb-4 text-white">
                  Logo dan Nama Instansi
                </h2>
                <div className="text-white">
                  {logo && (
                    <div className="mb-4">
                      <img
                        src={imageUrl}
                        alt="Logo"
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                  )}
                  {instansi?.nama_instansi ? (
                    <div>
                      <p className="text-white">
                        Nama Instansi: {instansi.nama_instansi} {/* Gunakan nama_instansi dari API */}
                      </p>
                    </div>
                  ) : (
                    <p className="text-white">Nama instansi belum diisi.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Schedule;
