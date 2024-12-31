import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import DataTable from "@/app/components/dataTabel";
import { updateSiswa } from "../api/siswa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Kelas } from "../api/kelas";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type item = {
  kelas: string;
  nama_siswa: string;
  id_siswa: string;
  nis: string;
  tinggalKelas: boolean;
  id_kelas: string;
}

export default function NaikKelas() {
  const [kelas, setKelas] = useState<item[]>([]);
  const [allKelas, setAllKelas] = useState<item[]>([]);
  const fetchKelasSiswaTotal = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/joinNonMaster/nama-siswa-kelas`
      );
      setKelas(response.data.data);
      console.log("ini siswa", response.data);
    } catch (error) {
      console.error("Fetch error:", error); // Menangani kesalahan
    }
  };
  useEffect(() => {
    fetchKelasSiswaTotal(); // Panggil fungsi fetch saat komponen di-mount
  }, []);
  const fetchKelas = async () => {
    try {
      const response = await axios.get(`${baseUrl}/kelas/all-kelas`);
      setAllKelas(response.data.data);
      console.log("ini siswa", response.data);
    } catch (error) {
      console.error("Fetch error:", error); // Menangani kesalahan
    }
  };
  useEffect(() => {
    fetchKelas(); // Panggil fungsi fetch saat komponen di-mount
  }, []);
  const [jumlahLulus, setJumlahLulus] = useState(0);
  const [showLulusNotif, setShowLulusNotif] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [newIdKelas, setNewIdKelas] = useState("");
  const [filteredKelas, setFilteredKelas] = useState<item[]>([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [updatedKelas, setUpdatedKelas] = useState<item[]>([]);
  const [showLihatButton, setShowLihatButton] = useState(false); // State untuk tombol Lihat
  const [showData, setShowData] = useState(false); // State untuk menampilkan data setelah klik Lihat
  const [showUpdatedData, setShowUpdatedData] = useState(false);
  // Update `filteredKelas` setiap kali `selectedKelas` berubah
  useEffect(() => {
    let updatedKelas = kelas.filter((item) => {
      // Filter berdasarkan kelas yang dipilih
      const isClassMatch = selectedKelas ? item.kelas === selectedKelas : true;
      // Filter berdasarkan pencarian nama
      const isNameMatch = item.nama_siswa
        .toLowerCase()
        .includes(searchName.toLowerCase());
      return isClassMatch && isNameMatch;
    });

    // Tambahkan properti `tinggalKelas` untuk checkbox
    updatedKelas = updatedKelas.map((item) => ({
      ...item,
      tinggalKelas: false, // Default semua checkbox tidak dipilih
    }));

    setFilteredKelas(updatedKelas);
  }, [selectedKelas, searchName, kelas]);

  const handleCheckboxChange = (index: number) => {
    setFilteredKelas((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, tinggalKelas: !item.tinggalKelas } : item
      )
    );
  };

  const handleSubmit = async () => {
    if (!newIdKelas) {
      toast.error("Pilih Kelas baru sebelum mengirim.");
      return;
    }
    // Filter data yang tidak memiliki `tinggalKelas: true`
    const dataToSubmit = filteredKelas
      .filter((item) => !item.tinggalKelas)
      .map((item) => ({
        id_siswa: item.id_siswa,
        nis: item.nis,
        id_kelas: newIdKelas,
      }));

    try {
      // Kirim data yang difilter ke server
      await axios.put(`${baseUrl}/naik/naik-kelas`, dataToSubmit);
      toast.success("Data siswa berhasil diperbarui");

      // Perbarui tampilan tabel dengan data yang sudah diperbarui
      const updatedData = filteredKelas.map((item) =>
        !item.tinggalKelas ? { ...item, id_kelas: newIdKelas } : item
      );
      setUpdatedKelas(updatedData); // Simpan data yang diperbarui dalam state baru
      setShowLihatButton(true);
    } catch (error) {
      toast.error("Gagal memperbarui data");
      // console.error(error.response?.data || error.message);
    }
  };
  const handleLihatClick = () => {
    setShowUpdatedData(true); // Tampilkan data setelah tombol Lihat diklik
  };
  const [isAllChecked, setIsAllChecked] = useState(false);

  const handleToggle = () => {
    const newState = !isAllChecked;
    setIsAllChecked(newState);
    setFilteredKelas((prev) =>
      prev.map((item) => ({ ...item, tinggalKelas: newState }))
    );
  };

  const handleLulus = () => {
    // Pisahkan siswa yang lulus dan siswa yang tinggal kelas
    const siswaLulus = filteredKelas.filter((siswa) => !siswa.tinggalKelas);
    const siswaTinggalKelas = filteredKelas.filter(
      (siswa) => siswa.tinggalKelas
    );

    // Set jumlah siswa yang lulus
    setJumlahLulus(siswaLulus.length);

    // Hapus siswa yang lulus dari tabel pertama
    setFilteredKelas(siswaTinggalKelas);

    // Tambahkan siswa yang tinggal kelas ke tabel kedua (dataNaik)
    // setDataNaik((prev) => [...prev, ...siswaLulus]);

    // Tampilkan notifikasi lulus
    setShowLulusNotif(true);
    // Sembunyikan notifikasi setelah 5 detik
    setTimeout(() => {
      setShowLulusNotif(false);
    }, 3000); // 5000 ms = 5 detik
  };
  return (
    <div className="rounded-lg max-w-full p-3 bg-slate-100">
      <ToastContainer className="mt-14" />
      <div className="pt-7 mb-4 ml-7">
        <h1 className="text-2xl font-bold">Naik Kelas</h1>
        <nav>
          <ol className="flex space-x-2 text-sm text-gray-700">
            <li>
              <a href="index.html" className="text-teal-500 hover:underline">
                Home
              </a>
            </li>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li className="text-gray-500">Naik Kelas</li>
          </ol>
        </nav>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4 lg:p-6 border">
        {/* Filter Kelas */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Cari nama..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            // style={{ marginBottom: '10px', padding: '5px', width: '200px' }}
            className="mt-1 h-11 md:w-48 lg:w-48 w-96 p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
          <p className="md:inline-block mx-2 my-2">Dari</p>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="p-2 border rounded md:w-28 lg:w-48 w-96"
          >
            <option value="">Kelas</option>
            {/* Ambil daftar kelas unik untuk opsi dropdown */}
            {Array.isArray(kelas) &&
              [...new Set(kelas.map((siswa) => siswa.kelas))].map(
                (kelasOption) => (
                  <option key={kelasOption} value={kelasOption}>
                    {kelasOption}
                  </option>
                )
              )}
          </select>
          <p className="md:inline-block mx-2 my-2">Naik ke</p>
          {/* <select
            id="naikKelas"
            value={selectedKelas1}
            onChange={(e) => setSelectedKelas1(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Pilih Kelas</option>
            {Array.isArray(allKelas) && allKelas.length > 0 ? (
              [...new Set(allKelas.map((siswa) => siswa.kelas))].map(
                (kelasOption) => (
                  <option key={kelasOption} value={kelasOption}>
                    {kelasOption}
                  </option>
                )
              )
            ) : (
              <option disabled>No classes available</option> // Menampilkan opsi saat allKelas bukan array atau kosong
            )}
          </select> */}
          <select
            value={newIdKelas}
            onChange={(e) => setNewIdKelas(e.target.value)}
            className="p-2 border rounded  md:w-32 lg:w-48 w-96"
          >
            <option value="">Pilih Kelas</option>
            {Array.isArray(allKelas) && allKelas.length > 0 ? (
              allKelas.map((kelasOption) => (
                <option
                  className="text-black"
                  key={kelasOption.id_kelas}
                  value={kelasOption.id_kelas}
                >
                  {kelasOption.kelas}
                </option>
              ))
            ) : (
              <option disabled>Tidak ada kelas tersedia</option>
            )}
          </select>
          {/* <button
            onClick={handleEdit}
            className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
          >
            Simpan
          </button> */}
        </div>
        {/* Container untuk tabel dan tombol */}
        <div className="flex items-start space-x-6">
          {/* Tabel 1 */}
          <div className="w-1/2 bg-slate-600 p-4 rounded-xl">
            <div className="overflow-x-auto">
              {/* <DataTable columns={tableColumns} data={filteredData} /> */}
              <table className="w-full text-left mt-4 border-collapse">
                <thead>
                  <tr className="ml-2">
                    <th className="p-2 sm:p-3 rounded-l-lg  bg-slate-500 text-white">
                      No
                    </th>
                    <th className="p-2 sm:p-3 bg-slate-500 text-white">Nama</th>
                    <th className="p-2 sm:p-3 bg-slate-500 text-white w-24">
                      Kelas
                    </th>
                    <th className="p-2 sm:p-3 bg-slate-500 rounded-r-xl text-white">
                      Tinggal Kelas
                      <div className="inline-block">
                        <input
                          type="checkbox"
                          checked={isAllChecked}
                          onChange={handleToggle}
                          className="hidden"
                        />
                        <span
                          onClick={handleToggle}
                          className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                            isAllChecked ? "bg-blue-600" : ""
                          }`}
                        >
                          <span
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                              isAllChecked ? "translate-x-5" : ""
                            }`}
                          />
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredKelas) &&
                    filteredKelas.map((item, index) => (
                      <tr key={item.id_siswa || index}>
                        <td className="p-3 sm:p-3 text-white border-b">
                          {index + 1}
                        </td>
                        <td className="p-3 sm:p-3 text-white border-b">
                          {item.nama_siswa}
                        </td>
                        <td className="p-3 sm:p-3 text-white border-b">
                          {item.kelas}
                        </td>
                        <td className="p-3 sm:p-3 text-white border-b">
                          <input
                            type="checkbox"
                            checked={item.tinggalKelas}
                            onChange={() => handleCheckboxChange(index)}
                            className="form-checkbox h-5 w-5 text-teal-600"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tombol Naik dan Lulus */}
          <div className="flex flex-col justify-center items-center space-y-4 mt-24">
            <button
              onClick={handleSubmit}
              className="bg-teal-500 text-white py-2 px-4 rounded-md w-full"
            >
              Naik
            </button>
            <button
              onClick={handleLulus}
              className="bg-blue-500 text-white py-2 px-4 rounded-md w-full"
            >
              Lulus
            </button>
            {showLulusNotif && (
              <div className="mt-4 bg-green-200 text-green-800 p-4 rounded-md">
                {jumlahLulus} siswa lulus
              </div>
            )}
            {showLihatButton && (
              <button
                onClick={handleLihatClick} // Mengatur agar data ditampilkan saat tombol Lihat diklik
                className="bg-lime-500 text-white py-2 px-4 rounded-md w-full mt-4"
              >
                Lihat
              </button>
            )}
          </div>

          {/* Tabel 2 */}
          <div className="w-1/2 bg-slate-600 p-4 rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left mt-4 border-collapse">
                <thead>
                  <tr className="ml-2">
                    <th className="p-2 sm:p-3 rounded-l-lg bg-slate-500 text-white">
                      No
                    </th>
                    <th className="p-2 sm:p-3 bg-slate-500 text-white">Nama</th>
                    <th className="p-2 sm:p-3 rounded-r-xl bg-slate-500 text-white">
                      Kelas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showUpdatedData &&
                    Array.isArray(filteredKelas) &&
                    filteredKelas.map((item, index) => (
                      <tr key={item.id_siswa || index}>
                        <td className="p-3 sm:p-3 text-white border-b">
                          {index + 1}
                        </td>
                        <td className="p-3 sm:p-3 text-white border-b">
                          {item.nama_siswa}
                        </td>
                        <td className="p-3 sm:p-3 text-white border-b">
                          {item.kelas}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
