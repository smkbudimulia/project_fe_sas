// import React, { useEffect, useState } from 'react';
// import DataTable from '../../../components/dataTabel';

// interface Kelas {
//   id_kelas: string;
//   kelas: string;
// }

// interface RombelData {
//   id_kelas: string;
//   nama_rombel: string;
//   id_tahun_pelajaran: string;
//   tahun: string;
// }

// const RombelJurusanTable = () => {
//   const [dataRombel, setDataRombel] = useState<RombelData[]>([]);
//   const [dataKelas, setDataKelas] = useState<Kelas[]>([]);

//   const rombelColumns = [
//     {
//       header: 'Kelas',
//       accessor: 'kelas',
//       Cell: ({ row }) => {
//         const kelas = dataKelas.find(k => k.kelas === row.original.kelas);
//         return kelas ? kelas.kelas : 'N/A';
//       },
//     },
//     { header: 'Jurusan', accessor: 'nama_rombel' as keyof RombelData },
//     { header: 'Tahun Ajaran', accessor: 'tahun' as keyof RombelData },
//   ];

//   useEffect(() => {
//     const fetchKelasData = async () => {
//       try {
//         const response = await fetch('http://localhost:3005/kelas/all-kelas');
//         if (!response.ok) throw new Error('Network response was not ok');
//         const data = await response.json();
//         console.log("Fetched Kelas Data:", data);
//         setDataKelas(data);
//       } catch (error) {
//         console.error("Error fetching kelas data:", error);
//       }
//     };

//     const fetchRombelData = async () => {
//       try {
//         const response = await fetch('http://localhost:3005/rombel/all-rombel');
//         if (!response.ok) throw new Error('Network response was not ok');
//         const data = await response.json();
//         console.log("Fetched Rombel Data:", data);
//         setDataRombel(data);
//       } catch (error) {
//         console.error("Error fetching rombel data:", error);
//       }
//     };

//     fetchKelasData();
//     fetchRombelData();
//   }, []);

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4">Tabel Rombel Jurusan</h2>
//       <DataTable columns={rombelColumns} data={dataRombel} />
//     </div>
//   );
// };

// export default RombelJurusanTable;
