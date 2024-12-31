// "use client";
// import { useState, useEffect } from 'react';
// import TimeDropdown from './TimeDropdown'; // Pastikan nama file benar

// const Schedule = () => {
//   const [selectedDays, setSelectedDays] = useState([]);
//   const [arrivalTime1, setArrivalTime1] = useState({ hours: '00', minutes: '00' });
//   const [arrivalTime2, setArrivalTime2] = useState({ hours: '', minutes: '' });
//   const [departureTime1, setDepartureTime1] = useState({ hours: '', minutes: '' });
//   const [departureTime2, setDepartureTime2] = useState({ hours: '', minutes: '' });
//   const [latenessTime1, setLatenessTime1] = useState({ hours: '', minutes: '' });
//   const [latenessTime2, setLatenessTime2] = useState({ hours: '', minutes: '' });
//   const [savedData, setSavedData] = useState({});
//   const [isEditing, setIsEditing] = useState(false);

//   useEffect(() => {
//     const storedData = localStorage.getItem('yourDataKey');
//     if (storedData) {
//       const parsedData = JSON.parse(storedData);
//       console.log('Stored Data:', parsedData); // Debug log
//       // Set state if needed
//     }
//   }, []);

//   useEffect(() => {
//     console.log('Saved Data Updated:', savedData); // Debug log
//   }, [savedData]);
  
  

//   const handleDayChange = (day) => {
//     setSelectedDays((prev) =>
//       prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
//     );
//   };

//   const handleTimeChange = (type, unit, value, index) => {
//     const setter = {
//       arrival: index === 1 ? setArrivalTime1 : setArrivalTime2,
//       departure: index === 1 ? setDepartureTime1 : setDepartureTime2,
//       lateness: index === 1 ? setLatenessTime1 : setLatenessTime2,
//     }[type];
  
//     setter((prev) => {
//       const newTime = { ...prev, [unit]: value };
//       console.log(`Updated ${type} Time`, newTime); // Debug log
//       return newTime;
//     });
//   };
  
  
//   const handleSaveClick = () => {
//     const newData = {
//       arrival: { from: arrivalTime1, to: arrivalTime2 },
//       departure: { from: departureTime1, to: departureTime2 },
//       lateness: { from: latenessTime1, to: latenessTime2 },
//     };
  
//     const updatedData = { ...savedData };
  
//     selectedDays.forEach((day) => {
//       updatedData[day] = newData;
//     });
  
//     console.log('Data yang disimpan:', updatedData); // Tambahkan log di sini
  
//     setSavedData(updatedData);
//     setIsEditing(false); // Exit edit mode
//     resetForm();
//   };
  
  
  
  
  

//   const resetForm = () => {
//     setArrivalTime1({ hours: '', minutes: '' });
//     setArrivalTime2({ hours: '', minutes: '' });
//     setDepartureTime1({ hours: '', minutes: '' });
//     setDepartureTime2({ hours: '', minutes: '' });
//     setLatenessTime1({ hours: '', minutes: '' });
//     setLatenessTime2({ hours: '', minutes: '' });
  
//     console.log('Form reset'); // Debug log
//   };
  

//   console.log('Arrival Time 1:', arrivalTime1); // Debug log
//   console.log('Arrival Time 2:', arrivalTime2); // Debug log
//   console.log('Departure Time 1:', departureTime1); // Debug log
//   console.log('Departure Time 2:', departureTime2); // Debug log
//   console.log('Lateness Time 1:', latenessTime1); // Debug log
//   console.log('Lateness Time 2:', latenessTime2); // Debug log


//   return (
//     <div className="bg-white shadow-md rounded-lg border border-slate-300 p-4">
//       <h2 className="text-lg font-semibold mb-4">Hari dan Atur Waktu</h2>
//       <div className="flex flex-wrap mb-4">
//         {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((day) => (
//           <div key={day} className="flex items-center mr-4 mb-2">
//             <input
//               type="checkbox"
//               id={day}
//               className="mr-2"
//               checked={selectedDays.includes(day)}
//               onChange={() => handleDayChange(day)}
//             />
//             <label htmlFor={day} className="text-sm text-slate-600">{day}</label>
//           </div>
//         ))}
//       </div>

//       {/* Bagian waktu datang, pulang, dan keterlambatan */}
//       <div className="flex flex-row flex-wrap gap-4">
//         {/* Waktu Datang */}
//         <div className="flex-1">
//           <h2 className="text-lg font-semibold text-slate-600 mb-2">Waktu Datang</h2>
//           <div className="flex flex-col">
//             <div className="flex items-center space-x-4">
//               <div className="flex flex-col">
//                 <span className="text-sm text-slate-600 mb-1">Dari</span>
//                 <TimeDropdown
//                   time={arrivalTime1}
//                   onChange={(unit, value) => handleTimeChange('arrival', unit, value, 1)}
//                 />
//               </div>
//               <span className='mt-7'>-</span>
//               <div className="flex flex-col">
//                 <span className="text-sm text-slate-600 mb-1">Sampai</span>
//                 <TimeDropdown
//                   time={arrivalTime2}
//                   onChange={(unit, value) => handleTimeChange('arrival', unit, value, 2)}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Waktu Pulang */}
//         <div className="flex-1">
//           <h2 className="text-lg font-semibold text-slate-600 mb-2">Waktu Pulang</h2>
//           <div className="flex flex-col">
//             <div className="flex items-center space-x-4">
//               <div className="flex flex-col">
//                 <span className="text-sm text-slate-600 mb-1">Dari</span>
//                 <TimeDropdown
//                   time={departureTime1}
//                   onChange={(unit, value) => handleTimeChange('departure', unit, value, 1)}
//                 />
//               </div>
//               <span className='mt-7'>-</span>
//               <div className="flex flex-col">
//                 <span className="text-sm text-slate-600 mb-1">Sampai</span>
//                 <TimeDropdown
//                   time={departureTime2}
//                   onChange={(unit, value) => handleTimeChange('departure', unit, value, 2)}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Keterlambatan */}
//         <div className="flex-1">
//           <h2 className="text-lg font-semibold text-slate-600 mb-2">Keterlambatan</h2>
//           <div className="flex flex-col">
//             <div className="flex items-center space-x-4">
//               <div className="flex flex-col">
//                 <span className="text-sm text-slate-600 mb-1">Dari</span>
//                 <TimeDropdown
//                   time={latenessTime1}
//                   onChange={(unit, value) => handleTimeChange('lateness', unit, value, 1)}
//                 />
//               </div>
//               <span className='mt-7'>-</span>
//               <div className="flex flex-col">
//                 <span className="text-sm text-slate-600 mb-1">Sampai</span>
//                 <TimeDropdown
//                   time={latenessTime2}
//                   onChange={(unit, value) => handleTimeChange('lateness', unit, value, 2)}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-end mt-4">
//         <button
//           className="px-4 py-2 bg-teal-400 text-white rounded-md hover:bg-teal-500"
//           onClick={handleSaveClick}
//         >
//           Simpan
//         </button>
//       </div>

//       {/* Menampilkan hasil di bawah */}
//       <div className="mt-4">
//   <h2 className="text-lg font-semibold mb-2">Hasil</h2>
//   {Object.keys(savedData).length > 0 ? (
//     <div className="result">
//       {Object.keys(savedData).map((day) => (
//         <div key={day} className="mb-4">
//           <h3 className="text-lg font-semibold">{day}</h3>
//           <p>Datang dari jam {savedData[day].arrival.from.hours}:{savedData[day].arrival.from.minutes} sampai {savedData[day].arrival.to.hours}:{savedData[day].arrival.to.minutes}</p>
//           <p>Pulang dari jam {savedData[day].departure.from.hours}:{savedData[day].departure.from.minutes} sampai {savedData[day].departure.to.hours}:{savedData[day].departure.to.minutes}</p>
//           <p>Batas Terlambat dari jam {savedData[day].lateness.from.hours}:{savedData[day].lateness.from.minutes} sampai {savedData[day].lateness.to.hours}:{savedData[day].lateness.to.minutes}</p>
//         </div>
//       ))}
//     </div>
//   ) : (
//     <p>Belum ada data yang disimpan.</p>
//   )}
// </div>

//     </div>
//   );
// };

// export default Schedule;
