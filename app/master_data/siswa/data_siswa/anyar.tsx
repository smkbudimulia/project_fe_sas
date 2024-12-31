// import React, { useState , useEffect, useRef } from 'react';
// import axios from 'axios';
// import DataTable from '../../../components/dataTabel';
// import {
//   addTes,
//   fetchTes,
//   deleteTes,
//   updateTes,
//   Tes,
// } from "../../../api/tes";


// const UploadForm = () => {
//   const [dataTes, setDataTes] = useState<Tes[]>([]);
//   const [nama, setNama] = useState('');
//   const [gambar, setGambar] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState('');

//   //stet untuk fecth siswa
//   useEffect(() => {
//     const loadTes = async () => {
//       const response = await fetchTes();
//       // console.log('API Tes:', response); // Debugging tambahan
//       const data = response.data; 
//       setDataTes(data);
//     };
//     loadTes();
//   }, []);

//   const tesColumns = [        
    
//     { header: 'Nama', accessor: 'nama' as keyof Tes },
//     { header: 'Foto', accessor: 'gambar' as keyof Tes }
    
//   ];

//   const handleNamaChange = (e) => setNama(e.target.value);

//   const handleGambarChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       setGambar(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsUploading(true);

//     try {
//       const formData = new FormData();
//       formData.append('nama', nama);
//       if (gambar) formData.append('gambar', gambar);

//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/tes/add-tes`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );

//       console.log('Data berhasil dikirim:', response.data);
//       setUploadStatus('Upload berhasil!');
//       setNama('');
//       setGambar(null);

//     } catch (error) {
//       console.error('Gagal mengirim data:', error);
//       setUploadStatus('Upload gagal.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="upload-form">
//       <h2 className="text-xl font-semibold mb-4">Unggah Data</h2>
//       <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
//         <label className="block">
//           <span>Nama:</span>
//           <input
//             type="text"
//             value={nama}
//             onChange={handleNamaChange}
//             className="w-full p-2 border border-gray-300 rounded mt-1"
//             required
//           />
//         </label>
//         <label className="block">
//           <span>Gambar:</span>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleGambarChange}
//             className="w-full mt-1"
//           />
//         </label>
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//           disabled={isUploading}
//         >
//           {isUploading ? 'Uploading...' : 'Unggah'}
//         </button>
//         {uploadStatus && <p className="text-sm text-gray-700">{uploadStatus}</p>}
//       </form>
//       <DataTable
//         columns ={tesColumns}
//         data={dataTes}
//       />
//     </div>
//   );
// };

// export default UploadForm;
