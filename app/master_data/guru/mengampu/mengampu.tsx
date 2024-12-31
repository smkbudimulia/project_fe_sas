import React, { useState, useEffect, useRef } from "react";
import { fetchGuru, Guru } from "@/app/api/guru";
// import { fetchMapel } from "@/app/api/mapel";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import {
  addMapel,
  fetchMapel,
  editMapel,
  deleteMapel,
  Mapel,
} from "../../../api/mapel";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function mengampu() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {};

  const [guru, setGuru] = useState([]); // State untuk menyimpan data nama_guru

  // useEffect(() => {
  // const loadGuru = async () => {
  //   try {
  //     const response = await fetchGuru();
  //     console.log("Data guru yang diterima:", response);

  //     const guruData = Array.isArray(response.data)
  //       ? response.data
  //       : [response.data];

  //     const namaGuru = guruData.map((guru) => guru.nama_guru);

  //     console.log("Nama guru:", namaGuru);
  //     setGuru(namaGuru); // Simpan nama_guru ke state
  //   } catch (error) {
  //     console.error("Error fetching guru data:", error);
  //   }
  // };

  //   loadGuru();
  // }, []);

  const [mapel, setMapel] = useState<Mapel[]>([]); // Hanya menyimpan nama_mapel
  const [selectedMapel, setSelectedMapel] = useState<string | null>(null); // Menyimpan id_mapel yang dipilih

  useEffect(() => {
    const loadMapel = async () => {
      try {
        const response = await fetchMapel();
        console.log("Data mapel yang diterima:", response);

        const mapelData = Array.isArray(response.data) ? response.data : [];
        setMapel(mapelData); // Simpan data mapel ke state
      } catch (error) {
        console.error("Error fetching mapel:", error);
      }
    };

    loadMapel();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value; // Ambil id_mapel dari value
    setSelectedMapel(selectedId);
    // console.log("ID Mapel yang dipilih:", selectedId);
  };

  const [kelas, setKelas] = useState<any[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string>("");

  // Mengambil data saat komponen dimuat
  useEffect(() => {
    const loadKelas = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/joinNonMaster/nama-siswa-kelas`
        );
        console.log("Data kelas jurusan yang diterima:", response.data); // Periksa data yang diterima

        // Jika data ada dalam properti 'data', kita bisa memetakan nama kelas
        const kelasData = Array.isArray(response.data.data)
          ? response.data.data.map((item: any) => item.kelas)
          : [];

        setKelas(kelasData); // Simpan data kelas ke state
      } catch (error) {
        console.error("Error fetching kelas jurusan:", error);
      }
    };

    loadKelas();
  }, []);

  // const handleKelasChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedId = event.target.value; // Ambil value yang dipilih
  //   setSelectedKelasId(selectedId); // Simpan id_kelas yang dipilih ke state
  //   console.log("ID Kelas yang dipilih:", selectedId);
  //   // Kirim id_kelas ke backend atau lakukan operasi lainnya
  // };
  const [dropdowns, setDropdowns] = useState([{}]);
  const handleChangeTambah = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
    const selectedValue = e.target.value;
    console.log(`Selected value: ${selectedValue} at index ${index}`);
    // Handle the change logic here
  };

  const addDropdown = () => {
    setDropdowns([...dropdowns, {}]); // Menambahkan dropdown baru
  };

  const removeDropdown = (index: number): void => {
    const newDropdowns = [...dropdowns];
    newDropdowns.splice(index, 1); // Menghapus dropdown yang dipilih
    setDropdowns(newDropdowns);
  };
  

  const [dropdownsMapel, setDropdownsMapel] = useState([{}]);
  // const handleChangeTambahMapel = (e, index) => {
  //   // Tangani perubahan nilai dropdown jika perlu
  // };

  // const addDropdownMapel = () => {
  //   setDropdownsMapel([...dropdownsMapel, {}]); // Menambahkan dropdown baru
  // };

  // const removeDropdownMapel = (index) => {
  //   const newDropdowns = [...dropdownsMapel];
  //   newDropdowns.splice(index, 1); // Menghapus dropdown yang dipilih
  //   setDropdownsMapel(newDropdowns);
  // };
  return (
    <>
      <div className="rounded-lg max-w-full bg-slate-100">
        <div className="pt-8 ml-7">
          <h1 className="text-2xl font-bold">Mengampu</h1>
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
              <li className="text-gray-500">Mengampu</li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Column 1: Input */}
          <div className="w-full lg:w-1/2 p-4 lg:p-6">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md p-4 lg:p-6 border"
            >
              {/* Dropdown 1 */}
              <div className="mb-4">
                <label
                  htmlFor="dropdown1"
                  className="block text-sm mb-2 sm:text-sm font-bold"
                >
                  Guru
                </label>
                <select
                  id="dropdown1"
                  name="dropdown1"
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
                >
                  <option value="">Pilih...</option>
                  {/* {guru.map((nama, index) => (
                    <option key={index} value={nama}>
                      {nama}
                    </option>
                  ))} */}
                </select>
              </div>

              {/* Dropdown 2 */}
              <div className="mb-4">
                {/* <label
                  htmlFor="dropdownMapel"
                  className="block text-sm mb-2 sm:text-sm font-bold"
                >
                  Mata Pelajaran
                </label>
                <select
                  id="dropdownMapel"
                  name="dropdownMapel"
                  onChange={handleChange}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
                >
                  <option value="">Pilih mata pelajaran...</option>
                  {mapel.map((item) => (
                    <option key={item.id_mapel} value={item.id_mapel}>
                      {item.nama_mapel}
                    </option>
                  ))}
                </select> */}
                {dropdowns.map((_, index) => (
                  <div key={index} className="mb-4 flex items-center">
                    <div className="flex-grow">
                      <label className="block text-sm mb-2 sm:text-sm font-bold">
                        Mata Pelajaran
                      </label>
                      <select
                        onChange={(e) => handleChangeTambah(e, index)}
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
                      >
                        <option value="">Pilih mata pelajaran...</option>
                        {mapel.map((item) => (
                          <option key={item.id_mapel} value={item.id_mapel ?? ''}>
                            {item.nama_mapel}
                          </option>
                        ))}
                      </select>
                      <label className="mt-4 block text-sm mb-2 sm:text-sm font-bold">
                        Mengampu
                      </label>
                      <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm">
                        <option value="">Pilih kelas...</option>
                        {kelas.map((kelasName, i) => (
                          <option key={i} value={kelasName}>
                            {kelasName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tombol - (Hapus dropdown) */}
                    <div className="flex flex-col ml-2">
                      {/* Tombol - (Hapus dropdown) */}
                      {dropdowns.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDropdown(index)}
                          className="bg-red-500 px-1 mt-1 mb-2 text-white hover:bg-red-700 rounded"
                        >
                          -
                        </button>
                      )}
                      {/* Tombol + (Tambah dropdown) */}
                      <button
                        type="button"
                        onClick={addDropdown}
                        className="bg-blue-500 px-1 text-white hover:bg-blue-700 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                {/* <label
                  htmlFor="dropdown2"
                  className="block text-sm mb-2 sm:text-sm font-bold"
                >
                  Mengampu
                </label>
                <select
                  id="dropdown2"
                  name="dropdown2"
                  // onChange={handleKelasChange}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
                >
                  <option value="">Pilih kelas...</option>
                  {kelas.map((kelasName: string, index: number) => (
                    <option key={index} value={kelasName}>
                      {kelasName}
                    </option>
                  ))}
                </select> */}
                {/* {dropdownsMapel.map((_, index) => (
                  <div key={index} className="mb-4 flex items-center">
                    <div className="flex-grow">
                      <label className="block text-sm mb-2 sm:text-sm font-bold">
                        Mengampu
                      </label>
                      <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm">
                        <option value="">Pilih kelas...</option>
                        {kelas.map((kelasName, i) => (
                          <option key={i} value={kelasName}>
                            {kelasName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col ml-2">
                      {dropdownsMapel.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDropdownMapel(index)}
                          className="bg-red-500 px-1 mt-1 mb-2 text-white hover:bg-red-700 rounded"
                        >
                          -
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={addDropdownMapel}
                        className="bg-cyan-500 px-1 text-white hover:bg-cyan-700 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))} */}
              </div>
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
            </form>
          </div>

          {/* Column 2: Table */}
          <div className="w-full  lg:w-2/3 p-4 lg:p-6">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border">
              <div className="bg-slate-600 px-2 rounded-xl">
                <div className="flex flex-col lg:flex-row justify-between mb-4">
                  <div className="p-2">
                    <h2 className="text-sm pt-3 sm:text-2xl text-white font-bold">
                      Tabel Kelas
                    </h2>
                  </div>
                </div>
                {/* Filter Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mt-4">
                  <div className="lg:flex-row justify-between items-center">
                    <div className=" items-center lg:mb-0 space-x-2 mb-3 lg:order-1">
                      {/* <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select> */}
                    </div>
                  </div>

                  {/* <div className=" items-center lg:mb-0 space-x-2 lg:order-1">
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
                  </div> */}
                </div>
                <div className="w-full overflow-x-auto">
                  <div>
                    {/* <DataTable
                      columns={kelasColumns}
                      data={paginatedData}
                      // onEdit={handleEditClick}
                      // onDelete={handleDeleteClickk}
                    />
                    {isModalOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded p-4 shadow-lg">
                          <h3 className="pb-2">Edit Data Kelas</h3>
                          <form onSubmit={handleEditSubmit}>
                            <input
                              type="text"
                              name="kelas"
                              value={editData ? editData.kelas : ""}
                              onChange={handleEditChange}
                              className={`w-full p-2 border rounded text-sm sm:text-base mb-2 ${
                                isKelasValid
                                  ? "border-gray-300"
                                  : "border-red-500"
                              }`}
                              placeholder="Kelas..."
                            />
                            <button
                              type="submit"
                              className="py-2 sm:px-4 sm:py-2 bg-teal-400 hover:bg-teal-500 text-white rounded text-sm sm:text-base"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsModalOpen(false); // Tutup modal
                                setOpenDropdownId(null); // Tutup dropdown juga
                              }}
                              className="ml-2 py-2 sm:px-4 sm:py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm sm:text-base"
                            >
                              Tutup
                            </button>
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
                    )} */}
                  </div>
                </div>
                {/* <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-700 text-white">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex overflow-hidden m-4 space-x-2">
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
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default mengampu;
