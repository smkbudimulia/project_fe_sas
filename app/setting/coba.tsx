// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import TimeDropdown from "./TImeDropdown";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// interface Item {
//   jam_masuk: string;
//   jam_pulang: string;
//   jam_terlambat: string;
//   id_setting: string;
//   hari: string;
//   tanggal_libur?: string;
// }

// const Schedule = () => {
//   const [settings, setSettings] = useState<Item[]>([]);

//   const hariUrutan = [
//     "Senin", "Selasa", "Rabu", "Kamis",
//     "Jumat", "Sabtu", "Minggu",
//   ];

//   // GET ALL SETTING
//   useEffect(() => {
//     const fetchSettings = async () => {
//       try {
//         const response = await axios.get(`${baseUrl}/setting/all-setting`);
//         const sortedData = response.data.data.sort(
//           (a: any, b: any) =>
//             hariUrutan.indexOf(a.hari) - hariUrutan.indexOf(b.hari)
//         );
//         setSettings(sortedData);
//       } catch (error) {
//         console.error("Error fetching settings:", error);
//       }
//     };

//     fetchSettings();
//   }, []);

//   // ===============================
//   //         BATAS ABSEN FIX
//   // ===============================
  
//   const [batasAbsen, setBatasAbsen] = useState("");
//   const [existingBatasAbsen, setExistingBatasAbsen] = useState(false);

//   // FIX: Aman kalau data belum ada (null)
//   useEffect(() => {
//     const fetchBatasAbsen = async () => {
//       try {
//         const res = await axios.get(`${baseUrl}/setting/get-batas-absen`);

//         if (res.data?.data?.batas_absen) {
//           const cron = res.data.data.batas_absen.split(" ");

//           if (cron.length >= 2) {
//             const minute = cron[0];
//             const hour = cron[1];

//             setBatasAbsen(
//               `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
//             );
//             setExistingBatasAbsen(true);
//           }
//         } else {
//           setExistingBatasAbsen(false);
//         }
//       } catch (err) {
//         console.log("Belum ada batas absen, mode insert");
//         setExistingBatasAbsen(false);
//       }
//     };

//     fetchBatasAbsen();
//   }, []);

//   //2
//     // fungsi convert HH:mm → cron
//   const convertToCron = (time: string) => {
//     const [hour, minute] = time.split(":").map(Number);
//     return `${minute} ${hour} * * *`;
//   };

//   const handleSaveBatasAbsen = async () => {
//     if (!batasAbsen) {
//       toast.error("Jam batas absen belum diisi!");
//       return;
//     }

//     const cronTime = convertToCron(batasAbsen);

//     try {
//       if (existingBatasAbsen) {
//         // UPDATE
//         await axios.put(`${baseUrl}/setting/update-batas-absen`, {
//           batas_absen: cronTime,
//         });
//         toast.success("Batas absen berhasil diperbarui!");
//       } else {
//         // INSERT
//         await axios.post(`${baseUrl}/setting/update-batas-absen`, {
//           batas_absen: cronTime,
//         });
//         toast.success("Batas absen berhasil ditambahkan!");
//         setExistingBatasAbsen(true);
//       }
//     } catch (error) {
//   if (axios.isAxiosError(error)) {
//     console.log("ERROR RESPONSE:", error.response?.data);
//     toast.error(error.response?.data?.message || "Gagal menyimpan batas absen!");
//   } else {
//     console.log("UNKNOWN ERROR:", error);
//     toast.error("Terjadi kesalahan!");
//   }
// }
//   };

//   // ===============================
//   //      Setting Jam Datang dsb
//   // ===============================

//   const [arrivalTimes, setArrivalTimes] = useState({ from: "", to: "" });
//   const [departureTimes, setDepartureTimes] = useState({ from: "", to: "" });
//   const [latenessTimes, setLatenessTimes] = useState({ from: "", to: "" });
//   const [selectedDays, setSelectedDays] = useState<string[]>([]);
//   const [holidayDate, setHolidayDate] = useState("");

//   const formatTime = (time: string) => {
//     return time.replace(":", ".");
//   };

//   const handleTimeChange = (type: string, value: string, timeType: string) => {
//     const newValue = value === "" ? "" : value;

//     if (type === "arrival") {
//       setArrivalTimes((prev) => ({ ...prev, [timeType]: newValue }));
//     } else if (type === "departure") {
//       setDepartureTimes((prev) => ({ ...prev, [timeType]: newValue }));
//     } else if (type === "lateness") {
//       setLatenessTimes((prev) => ({ ...prev, [timeType]: newValue }));
//     }
//   };

//   const handleDayChange = (day: string) => {
//     setSelectedDays((prevDays) =>
//       prevDays.includes(day)
//         ? prevDays.filter((d) => d !== day)
//         : [...prevDays, day]
//     );
//   };

//   // SIMPAN SETTING JAM HARI!!!
//   const handleSaveClick = async () => {
//     if (selectedDays.length === 0 && !holidayDate) {
//       toast.error("Pilih hari atau pilih tanggal libur!");
//       return;
//     }

//     try {
//       const responseExistingData = await axios.get(`${baseUrl}/setting/all-setting`);
//       const existingData = responseExistingData.data.data;

//       const scheduleArray = [];

//       if (selectedDays.length > 0) {
//         selectedDays.forEach((day) => {
//           scheduleArray.push({
//             hari: day,
//             jam_masuk: [formatTime(arrivalTimes.from), formatTime(arrivalTimes.to)],
//             jam_pulang: [formatTime(departureTimes.from), formatTime(departureTimes.to)],
//             jam_terlambat: [formatTime(latenessTimes.from), formatTime(latenessTimes.to)],
//             tanggal_libur: "",
//           });
//         });
//       }

//       if (holidayDate) {
//         scheduleArray.push({
//           hari: "",
//           jam_masuk: ["libur", "libur"],
//           jam_pulang: ["libur", "libur"],
//           jam_terlambat: ["libur", "libur"],
//           tanggal_libur: holidayDate,
//         });
//       }

//       const toUpdate: any[] = [];
//       const toInsert: any[] = [];

//       scheduleArray.forEach((item) => {
//         const exists = existingData.find(
//           (data: any) =>
//             data.hari === item.hari &&
//             data.tanggal_libur === item.tanggal_libur
//         );

//         if (exists) toUpdate.push(item);
//         else toInsert.push(item);
//       });

//       if (toUpdate.length > 0) {
//         await axios.put(`${baseUrl}/setting/setting-sistem`, toUpdate);
//         toast.success("Jadwal berhasil diperbarui!");
//       }

//       if (toInsert.length > 0) {
//         await axios.post(`${baseUrl}/setting/setting-sistem`, toInsert);
//         toast.success("Jadwal berhasil ditambahkan!");
//       }

//       setArrivalTimes({ from: "", to: "" });
//       setDepartureTimes({ from: "", to: "" });
//       setLatenessTimes({ from: "", to: "" });
//       setSelectedDays([]);
//       setHolidayDate("");

//     } catch (error) {
//       toast.error("Terjadi kesalahan saat menyimpan jadwal");
//     }
//   };

// //3
//   return (
//     <>
//       <div className="bg-slate-100 min-h-screen">
//         <div className="container mx-auto p-4">
//           <div className="flex flex-col space-y-4">

//             {/* Kolom 1 */}
//             <div className="bg-white p-4 rounded-lg shadow-md">
//               <div className="text-slate-600 text-lg font-semibold mb-4">
//                 Setting Waktu Absensi
//               </div>

//               <div className="bg-white shadow-md rounded-lg border border-slate-300 p-4">
//                 <h2 className="text-lg font-semibold mb-4">
//                   Set Hari dan Waktu
//                 </h2>

//                 {/* Checkbox Hari */}
//                 <div className="flex flex-wrap mb-4">
//                   {hariUrutan.map((day) => (
//                     <div key={day} className="flex items-center mr-4 mb-2">
//                       <input
//                         type="checkbox"
//                         id={day}
//                         className="mr-2"
//                         onChange={() => handleDayChange(day)}
//                       />
//                       <label htmlFor={day} className="text-sm text-slate-600">
//                         {day}
//                       </label>
//                     </div>
//                   ))}

//                   <div className="flex flex-col mb-4">
//                     <label
//                       htmlFor="tanggal_libur"
//                       className="text-sm text-slate-600 mb-2"
//                     >
//                       Tanggal Libur
//                     </label>
//                     <input
//                       type="date"
//                       id="tanggal_libur"
//                       className="border border-slate-300 rounded-md p-2"
//                       value={holidayDate}
//                       onChange={(e) => setHolidayDate(e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 {/* Input Jam Datang, Pulang, Terlambat */}
//                 <div className="flex flex-row flex-wrap gap-4">

//                   {/* Jam Datang */}
//                   <div className="flex-1">
//                     <h2 className="text-lg font-semibold text-slate-600 mb-2">
//                       Jam Datang
//                     </h2>
//                     <div className="flex flex-col">
//                       <div className="flex items-center space-x-4">
//                         <div className="flex flex-col">
//                           <span className="text-sm text-slate-600 mb-1">Dari</span>
//                           <input
//                             type="time"
//                             value={arrivalTimes.from}
//                             onChange={(e) =>
//                               handleTimeChange("arrival", e.target.value, "from")
//                             }
//                           />
//                         </div>

//                         <span className="mt-7">-</span>

//                         <div className="flex flex-col">
//                           <span className="text-sm text-slate-600 mb-1">Sampai</span>
//                           <input
//                             type="time"
//                             value={arrivalTimes.to}
//                             onChange={(e) =>
//                               handleTimeChange("arrival", e.target.value, "to")
//                             }
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Jam Terlambat */}
//                   <div className="flex-1">
//                     <h2 className="text-lg font-semibold text-slate-600 mb-2">
//                       Jam Terlambat
//                     </h2>
//                     <div className="flex flex-col">
//                       <div className="flex items-center space-x-4">
//                         <div className="flex flex-col">
//                           <span className="text-sm text-slate-600 mb-1">Dari</span>
//                           <input
//                             type="time"
//                             value={latenessTimes.from}
//                             onChange={(e) =>
//                               handleTimeChange("lateness", e.target.value, "from")
//                             }
//                           />
//                         </div>

//                         <span className="mt-7">-</span>

//                         <div className="flex flex-col">
//                           <span className="text-sm text-slate-600 mb-1">Sampai</span>
//                           <input
//                             type="time"
//                             value={latenessTimes.to}
//                             onChange={(e) =>
//                               handleTimeChange("lateness", e.target.value, "to")
//                             }
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Jam Pulang */}
//                   <div className="flex-1">
//                     <h2 className="text-lg font-semibold text-slate-600 mb-2">
//                       Jam Pulang
//                     </h2>
//                     <div className="flex flex-col">
//                       <div className="flex items-center space-x-4">
//                         <div className="flex flex-col">
//                           <span className="text-sm text-slate-600 mb-1">Dari</span>
//                           <input
//                             type="time"
//                             value={departureTimes.from}
//                             onChange={(e) =>
//                               handleTimeChange("departure", e.target.value, "from")
//                             }
//                           />
//                         </div>

//                         <span className="mt-7">-</span>

//                         <div className="flex flex-col">
//                           <span className="text-sm text-slate-600 mb-1">Sampai</span>
//                           <input
//                             type="time"
//                             value={departureTimes.to}
//                             onChange={(e) =>
//                               handleTimeChange("departure", e.target.value, "to")
//                             }
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* ===================== */}
//                 {/*      BATAS ABSEN      */}
//                 {/* ===================== */}

//                 <div className="mt-4">
//                   <label className="text-sm text-slate-600">Batas Absen</label>

//                   <input
//                     type="time"
//                     className="border border-slate-300 rounded-md p-2 ml-2"
//                     value={batasAbsen}
//                     onChange={(e) => setBatasAbsen(e.target.value)}
//                   />

//                   <button
//                     onClick={handleSaveBatasAbsen}
//                     className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
//                   >
//                     Simpan
//                   </button>
//                 </div>

//                 <div className="flex justify-end mt-4">
//                   <button
//                     className="px-4 py-2 bg-teal-400 text-white rounded-md hover:bg-teal-500"
//                     onClick={handleSaveClick}
//                   >
//                     Simpan
//                   </button>
//                 </div>
//               </div>

//               {/* Kolom 2 — Data Hari */}
//               <div className="p-4 mt-4 border rounded-lg bg-slate-600 text-white">
//                 <h2 className="text-lg font-semibold mb-4">Hari Aktif Sekolah</h2>

//                 <div className="p-4 border rounded-md bg-white text-slate-600">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                     {settings.length > 0 ? (
//                       settings
//                         .filter((item) => !item.tanggal_libur)
//                         .map((item) => {
//                           const [jamMasukAwal, jamMasukAkhir] =
//                             item.jam_masuk.split(",");
//                           const [jamPulangAwal, jamPulangAkhir] =
//                             item.jam_pulang.split(",");
//                           const [jamTerlambatAwal, jamTerlambatAkhir] =
//                             item.jam_terlambat.split(",");

//                           return (
//                             <div key={item.id_setting} className="bg-white p-4 shadow-2xl rounded">
//                               <h2 className="text-lg font-bold text-gray-700">
//                                 {item.hari}
//                               </h2>
//                               <p>
//                                 <strong>Jam Masuk :</strong> {jamMasukAwal} -
//                                 {jamMasukAkhir}
//                               </p>
//                               <p>
//                                 <strong>Jam Terlambat :</strong> {jamTerlambatAwal} -
//                                 {jamTerlambatAkhir}
//                               </p>
//                               <p>
//                                 <strong>Jam Pulang :</strong> {jamPulangAwal} -
//                                 {jamPulangAkhir}
//                               </p>
//                             </div>
//                           );
//                         })
//                     ) : (
//                       <p className="text-gray-500">Tidak ada data.</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//             </div>

//             {/* Toast */}
//             <ToastContainer className="mt-14" />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Schedule;

