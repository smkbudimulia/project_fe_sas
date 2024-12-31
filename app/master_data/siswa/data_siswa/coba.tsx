// "use client"
// import axios, { AxiosError } from 'axios';
// import React, { useState, useEffect } from 'react';
// import { addSiswa, fetchSiswa, Siswa  } from '../../../api/siswa';
// import { updateSiswa, deleteSiswa } from '../../../api/siswa';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import DataTable from '../../../components/dataTabel';

// type SiswaFormProps = {
//   onSubmit: (data: any) => void;
// };

// const SiswaForm: React.FC<SiswaFormProps> = ({ onSubmit }) => {
//   const [dataSiswa, setDataSiswa] = useState<Siswa[]>([]);
//   const [formData, setFormData] = useState({
//     id_siswa: '',
//     id_admin: '',
//     nis: '',
//     nama_siswa: '',
//     jenis_kelamin: '',
//     id_tahun_pelajaran: '',
//     id_kelas: '',
//     id_rombel: '',
//     email: '',
//     pass: '',
//     foto: null,
//     barcode: '',
//     nama_wali: '',
//     nomor_wali: '',
//   });

//   const [fotoPreview, setFotoPreview] = useState(null);


//   //stet untuk fecth siswa
//   useEffect(() => {
//     const loadSiswa = async () => {
//       const response = await fetchSiswa();
//       console.log('API siswa:', response); // Debugging tambahan
//       const data = response.data; 
//       setDataSiswa(data);
//     };
//     loadSiswa();
//   }, []);

//   // fields untuk DataTabel
//   const siswaColumns = [
//     { header: 'ID', accessor: 'id_siswa' as keyof Siswa },
//     { header: 'Foto', accessor: 'foto' as keyof Siswa },
//     { header: 'Nis', accessor: 'nis' as keyof Siswa },
//     { header: 'Nama', accessor: 'nama_siswa' as keyof Siswa },
//     { header: 'JK', accessor: 'jenis_kelamin' as keyof Siswa },
//     { header: 'Tahun Ajaran', accessor: 'id_tahun_pelajaran' as keyof Siswa },
//     { header: 'Kelas', accessor: 'id_kelas' as keyof Siswa },
//     { header: 'Jurusan', accessor: 'id_rombel' as keyof Siswa },
//     { header: 'Email', accessor: 'email' as keyof Siswa },
//     { header: 'Password', accessor: 'pass' as keyof Siswa },
//     { header: 'Barcode', accessor: 'barcode' as keyof Siswa },
//     { header: 'Nama Wali', accessor: 'nama_wali' as keyof Siswa },
//     { header: 'No Wali', accessor: 'nomor_wali' as keyof Siswa },
//   ];

//   //state untuk menghandle input
//    // Handler umum untuk input teks
//    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   // Handler khusus untuk input foto
//   const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFormData({ ...formData, foto: e.target.files[0] }); // Simpan file foto di formData
//       setFotoPreview(URL.createObjectURL(e.target.files[0])); // Untuk menampilkan preview
//     }
//   };
  
  

//   //state untuk simpan
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
  
//     // Validasi jika ada input yang kosong
//     if (
//       !formData.id_siswa ||
//       !formData.nama_siswa ||
//       !formData.nis ||
//       !formData.email ||
//       !formData.jenis_kelamin ||
//       !formData.foto ||
//       !formData.nama_wali ||
//       !formData.nomor_wali ||
//       !formData.id_tahun_pelajaran ||
//       !formData.id_kelas ||
//       !formData.id_rombel
//     ) {
//       toast.error('Data tidak boleh kosong');
//       return;
//     }
  
//     try {
//       const response = await addSiswa(formData);
//       console.log('API response:', response);
      
//       // Cek apakah data sudah ada berdasarkan respons dari server
//       if (response?.data?.exists) { // Asumsikan response.data.exists bernilai true jika data sudah ada
//         toast.error('Data sudah ada!');
//       } else {
//         toast.success('Siswa berhasil ditambahkan!');
//         // Reset form data setelah berhasil
//         setFormData({
//           id_siswa: '',
//           id_admin: '',
//           nis: '',
//           nama_siswa: '',
//           jenis_kelamin: '',
//           id_tahun_pelajaran: '',
//           id_kelas: '',
//           id_rombel: '',
//           email: '',
//           pass: '',
//           foto: null,
//           barcode: '',
//           nama_wali: '',
//           nomor_wali: '',
//         });
//         setFotoPreview(null);
//       }
//     } catch (error) {
//       console.error('Error adding siswa:', error);
  
//       if (axios.isAxiosError(error)) {
//         console.error('Error response:', error.response);
//         if (error.response) {
//           // Tampilkan pesan error spesifik dari server jika ada
//           const errorMessage = error.response.data.message || 'Terjadi kesalahan pada server';
//           toast.error(`Error: ${error.response.status} - ${errorMessage}`);
//         } else {
//           toast.error('Tidak dapat terhubung ke server. Periksa koneksi Anda atau coba lagi nanti.');
//         }
//       } else {
//         toast.error('Terjadi kesalahan saat menambah data');
//       }
//     }
//   };
  

//   // Fungsi untuk menangani edit
//   const handleEdit = async (updatedRow: Siswa) => {
//   try {
//     // Pastikan updatedRow memiliki id_siswa dan nis
//     if (!updatedRow.id_siswa || !updatedRow.nis) {
//       throw new Error('ID Siswa atau NIS tidak ditemukan');
//     }

//     // Update state di frontend
//     setDataSiswa((prevSiswa) =>
//       prevSiswa.map((siswa) =>
//         siswa.id_siswa === updatedRow.id_siswa ? updatedRow : siswa
//       )
//     );
//     // Kirim request ke backend dengan id dan nis yang benar
//     const updatedSiswa = await updateSiswa(updatedRow.id_siswa, updatedRow.nis, updatedRow);
//     toast.success('Data siswa berhasil diperbarui!');
//   } catch (error) {
//     // Tampilkan lebih banyak detail error dari response server
//     console.error('Gagal memperbarui data di backend:', error.response?.data || error.message);
//     toast.error(`Gagal memperbarui data: ${error.response?.data?.message || error.message}`);
//   }
// };

// const handleDelete = async (deletedRow) => {
//   const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus siswa ${deletedRow.nama_siswa}?`);
//   if (confirmed) {
//       try {
//           // Panggil fungsi deleteTahunAjaran untuk menghapus di backend
//           await deleteSiswa(deletedRow.id_siswa);

//           // Setelah sukses, update state di frontend
//           setDataSiswa((prevSiswa) =>
//               prevSiswa.filter((siswa) => siswa.id_siswa !== deletedRow.id_siswa)
//           );
          
//           toast.success(' siswa berhasil dihapus');
//       } catch (error) {
//           console.error('Error deleting Siswa:', error);
//           // Anda bisa menambahkan notifikasi atau pesan error di sini
//       }
//   }
// };

// const handleDownloadFormatClick = () => {
//   // Data yang akan diisikan ke dalam file Excel
//   const data = [
//     {
//       id_siswa: "",
//       nis: "",
//       nama_siswa: "",
//       jenis_kelamin: "",
//       tahun_pelajaran: "",
//       kelas: "",
//       rombel: "",
//       email: "",
//       pass: "",
//       foto: "",
//       barcode: "",
//       nama_wali: "",
//       nomor_wali: "",
//     },
//   ];

//   // Definisikan header file Excel
//   const headers = [
//     "id_siswa",
//     "nis",
//     "nama_siswa",
//     "jenis_kelamin",
//     "tahun_pelajaran",
//     "kelas",
//     "rombel",
//     "email",
//     "pass",
//     "foto",
//     "barcode",
//     "nama_wali",
//     "nomor_wali",
//   ];

//   // Membuat worksheet
//   const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });

//   // Membuat workbook
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");

//   // Menghasilkan file Excel
//   const excelBuffer = XLSX.write(workbook, {
//     bookType: "xlsx",
//     type: "array",
//   });

//   // Membuat Blob untuk mengunduh
//   const blob = new Blob([excelBuffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });

//   // Membuat link download
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = "format_siswa.xlsx"; // Nama file yang diunduh
//   link.click();
// };

// const handleUploadFileClick = () => {
//   // Memicu klik pada elemen input file
//   fileInputRef.current.click();
// };

// const handleFileChange = (event) => {
//   const file = event.target.files[0];

//   if (file) {
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

//       // Mengubah sheet ke format JSON
//       const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

//       // Mengonversi JSON ke bentuk yang sesuai dengan struktur tabel
//       const formattedData = jsonData
//         .slice(1)
//         .map((row, index) => ({
//           no: currentDataa.length + index + 1,
//           foto: "",
//           idSiswa: row[0] || "", // Kolom ID Siswa
//           nisn: row[1] || "", // Kolom NISN
//           namaSiswa: row[2] || "", // Kolom Nama Siswa
//           jk: row[3] || "", // Kolom Jenis Kelamin
//           kelas: row[5] || "", // Kolom Kelas
//           jurusan: row[6] || "", // Kolom Jurusan
//           namaWali: row[11] || "", // Kolom Nama Wali
//           noWali: row[12] || "", // Kolom No Wali
//         }))
//         // Filter untuk baris yang memiliki setidaknya satu kolom yang tidak kosong
//         .filter((item) =>
//           Object.values(item).some(
//             (value) => typeof value === "string" && value.trim() !== ""
//           )
//         );
//       // Menyimpan data ke state jika ada data yang valid
//       // Menyimpan data ke state jika ada data yang valid
//       if (formattedData.length > 0) {
//         setCurrentDataa((prevData) => [...prevData, ...formattedData]);
//         // Simpan ke local storage jika perlu
//         saveToLocalStorage("tableDataSiswa", [
//           ...currentDataa,
//           ...formattedData,
//         ]);
//       } else {
//         console.log("Tidak ada data valid yang dimasukkan.");
//       }
//     };

//     reader.readAsArrayBuffer(file);
//   }
// };

// const filteredData = tableData.filter((item) => {
//   const searchLowerCase = searchTerm.toLowerCase();

//   return (
//     (filterKelas ? item.kelas === filterKelas : true) &&
//     (filterJurusan ? item.jurusan === filterJurusan : true) &&
//     (searchTerm
//       ? (typeof item.idSiswa === "string" &&
//           item.idSiswa.toLowerCase().includes(searchLowerCase)) ||
//         (typeof item.nisn === "string" &&
//           item.nisn.toLowerCase().includes(searchLowerCase)) ||
//         (typeof item.namaSiswa === "string" &&
//           item.namaSiswa.toLowerCase().includes(searchLowerCase)) ||
//         (typeof item.kelas === "string" &&
//           item.kelas.toLowerCase().includes(searchLowerCase)) ||
//         (typeof item.jurusan === "string" &&
//           item.jurusan.toLowerCase().includes(searchLowerCase)) ||
//         (typeof item.jk === "string" &&
//           item.jk.toLowerCase().includes(searchLowerCase)) ||
//         (typeof item.namaWali === "string" &&
//           item.namaWali.toLowerCase().includes(searchLowerCase)) ||
//         (typeof item.noWali === "string" &&
//           item.noWali.toLowerCase().includes(searchLowerCase))
//       : true)
//   );
// });


//   return (
// <>
//     <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow-md rounded-md">
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium">ID Siswa</label>
//           <input
//             type="text"
//             name="id_siswa"
//             value={formData.id_siswa}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">ID Admin</label>
//           <input
//             type="text"
//             name="id_admin"
//             value={formData.id_admin}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">NIS</label>
//           <input
//             type="text"
//             name="nis"
//             value={formData.nis}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Nama Siswa</label>
//           <input
//             type="text"
//             name="nama_siswa"
//             value={formData.nama_siswa}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Jenis Kelamin</label>
//           <select
//             name="jenis_kelamin"
//             value={formData.jenis_kelamin}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//             required
//           >
//             <option value="">Pilih</option>
//             <option value="Laki-laki">Laki-laki</option>
//             <option value="Perempuan">Perempuan</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium">ID Tahun Pelajaran</label>
//           <input
//             type="text"
//             name="id_tahun_pelajaran"
//             value={formData.id_tahun_pelajaran}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">ID Kelas</label>
//           <input
//             type="text"
//             name="id_kelas"
//             value={formData.id_kelas}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">ID Rombel</label>
//           <input
//             type="text"
//             name="id_rombel"
//             value={formData.id_rombel}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Password</label>
//           <input
//             type="password"
//             name="pass"
//             value={formData.pass}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Foto</label>
//           <input
//             type="file"
//             name="foto"
//             accept="image/*"
//             onChange={handleFotoChange}
//             className="mt-1 p-2 border rounded-md w-full"
//           />
//           {fotoPreview && <img src={fotoPreview} alt="Preview Foto" className="mt-2 h-20 w-20" />}
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Barcode</label>
//           <input
//             type="text"
//             name="barcode"
//             value={formData.barcode}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Nama Wali</label>
//           <input
//             type="text"
//             name="nama_wali"
//             value={formData.nama_wali}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Nomor Wali</label>
//           <input
//             type="text"
//             name="nomor_wali"
//             value={formData.nomor_wali}
//             onChange={handleChange}
//             className="mt-1 p-2 border rounded-md w-full"
//             required
//           />
//         </div>
//       </div>
//       <button
//         type="submit"
//         className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
//       >
//         Simpan
//       </button>
//     </form>
//     <ToastContainer className="mt-14" />
//     <div className="overflow-x-auto">
//       <DataTable 
//       columns={siswaColumns}
//       data={dataSiswa}
//       onEdit={handleEdit}
//       onDelete={handleDelete}
//       />
//     </div>
// </>
//   );
// };

// export default SiswaForm;
