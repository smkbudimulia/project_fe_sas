// import { useState } from 'react';
// import UploadExcel from './UploadExcel';

// const FormSiswa = () => {
//   const [siswaData, setSiswaData] = useState([]);

//   const handleUpload = (data) => {
//     setSiswaData(data); // Simpan data yang di-upload ke state
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:3005/siswa/add-siswa', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(siswaData),
//       });
  
//       const result = await response.json(); // Ambil respons JSON dari backend
      
//       if (response.ok) {
//         console.log('Data berhasil dikirim', result);
//       } else {
//         console.error('Gagal mengirim data:', result.error || response.statusText);
//       }
//     } catch (error) {
//       console.error('Error uploading data:', error);
//     }
//   };
  
//   return (
//     <form onSubmit={handleSubmit}>
//       {/* Inputan lain seperti id_rpmbel, i_admin, nama_rombel */}
//       <UploadExcel onUpload={handleUpload} />
//       <button type="submit">Simpan</button>
//     </form>
//   );
// };

// export default FormSiswa;
