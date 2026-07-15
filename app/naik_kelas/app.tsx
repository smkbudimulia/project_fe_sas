import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import DataTable from "@/app/components/dataTabel";
import { updateSiswa } from "../api/siswa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Kelas } from "../api/kelas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type item = {
  kelas: string;
  nama_siswa: string;
  id_siswa: string;
  nis: string;
  tinggalKelas: boolean;
  id_kelas: string;
  id_rombel: string;
  nama_rombel: string;
  nomor_wali: string;
};

interface Siswa {
  id_siswa: string;
  nis: string;
  id_kelas: string;
  id_rombel: string;
  nama_siswa: string;
  nomor_wali: string;
  kelas: string;
  nama_rombel: string;
  tinggalKelas: boolean;
}

type Absensi = {
  id_siswa: string;
  tanggal: string;
  keterangan: string;
  nama_siswa: string;
  kelas: string;
  nama_rombel: string;
  status?: string;
  kehadiran?: string;
};
  
  

export default function NaikKelas() {
  const [kelas, setKelas] = useState<item[]>([]);
  const [allKelas, setAllKelas] = useState<item[]>([]);
  const fetchKelasSiswaTotal = async () => {
    try {
      const response = await axios.get(`${baseUrl}/joinNonMaster/nama-siswa`);
      setKelas(response.data.data);
      // console.log("ini siswa", response.data);
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
      // console.log("ini siswa", response.data);
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
  const [siswaNaik, setSiswaNaik] = useState<item[]>([]);
  const [siswaLulusList, setSiswaLulusList] = useState<item[]>([]);

  useEffect(() => {
    if (!selectedKelas) {
      setFilteredKelas([]);
      return;
    }

    let updatedKelas = kelas.filter((item) => {
      const isClassMatch = item.kelas === selectedKelas;
      const isNameMatch = item.nama_siswa
        .toLowerCase()
        .includes(searchName.toLowerCase());
      return isClassMatch && isNameMatch;
    });

    updatedKelas = updatedKelas.map((item) => ({
      ...item,
      tinggalKelas: false,
    }));

    setFilteredKelas(updatedKelas);
  }, [selectedKelas, searchName, kelas]);

  const normalizeKelas = (val: string) => String(val || "").toLowerCase().trim();
  const isKelasXII = /xii|12/.test(normalizeKelas(selectedKelas));

  useEffect(() => {
    if (!selectedKelas) {
      setNewIdKelas("");
      return;
    }

    if (isKelasXII) {
      setNewIdKelas("");
    } else {
      const nextKelas = allKelas.find(
        (k) => normalizeKelas(k.kelas) !== normalizeKelas(selectedKelas)
      );
      if (nextKelas) {
        setNewIdKelas(nextKelas.id_kelas);
      }
    }
  }, [selectedKelas, allKelas, isKelasXII]);

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
    const siswaNaik = filteredKelas.filter((item) => item.tinggalKelas && item.id_kelas !== newIdKelas);
    const siswaTinggal = filteredKelas.filter((item) => !item.tinggalKelas);

    const sudahDiKelasTujuan = filteredKelas.some((item) => item.tinggalKelas && item.id_kelas === newIdKelas);

    if (siswaNaik.length === 0) {
      if (sudahDiKelasTujuan) {
        toast.error("Tidak ada siswa yang bisa dinaikkan karena kelas tujuan sama.");
      } else {
        toast.error("Tidak ada siswa yang dipilih untuk naik kelas.");
      }
      return;
    }

    const dataToSubmit = siswaNaik.map((item) => ({
      id_siswa: item.id_siswa,
      nis: item.nis,
      id_kelas: newIdKelas,
    }));

    try {
      await axios.put(`${baseUrl}/naik/naik-kelas`, dataToSubmit);
      toast.success("Data siswa berhasil diperbarui");

      setSiswaNaik((prev) => [...prev, ...siswaNaik]);
      setFilteredKelas(siswaTinggal);
    } catch (error) {
      toast.error("Gagal memperbarui data");
    }
  };
  const [isAllChecked, setIsAllChecked] = useState(false);

  const handleToggle = () => {
    const newState = !isAllChecked;
    setIsAllChecked(newState);
    setFilteredKelas((prev) =>
      prev.map((item) => ({ ...item, tinggalKelas: newState }))
    );
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("Data_Lulus");
  const openModal = () => {
    const siswaLulus = filteredKelas.filter((siswa) => siswa.tinggalKelas);

    if (siswaLulus.length === 0) {
      toast.info("Tidak ada siswa yang akan diluluskan");
      return;
    }

    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  const formatData = (
    siswaLulus: Siswa[]
  ): Record<string, string | boolean>[] => {
    return siswaLulus.map((siswa) => ({
      "Nama Siswa": siswa.nama_siswa,
      NIS: siswa.nis,
      Kelas: siswa.kelas,
      Rombel: siswa.nama_rombel,
      "Nomor Wali": siswa.nomor_wali,
      "Tinggal Kelas": siswa.tinggalKelas ? "Ya" : "Tidak",
    }));
  };

  const handleLulus = async () => {
    try {
      const siswaLulus = filteredKelas.filter((siswa) => siswa.tinggalKelas);

      if (siswaLulus.length === 0) {
        toast.warning("Tidak ada siswa yang akan diluluskan!");
        return;
      }

      const siswaLulusIds = siswaLulus.map((siswa) => siswa.id_siswa);

      const response = await axios.get(`${baseUrl}/absensi/all-absensi`);
      const absensiData = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      if (!absensiData || absensiData.length === 0) {
        toast.warning("Data absensi tidak tersedia!");
        return;
      }

      const absensiLulus = absensiData.filter((absensi: Absensi) =>
        siswaLulusIds.includes(absensi.id_siswa)
      );

      const formatDate = (dateString: string) => {
        return new Date(dateString).toISOString().split("T")[0];
      };

      const absensiPerBulan: Record<string, any[]> = {};
      absensiLulus.forEach((absensi: Record<string, any>) => {
        const date = new Date(absensi.tanggal);
        const bulan = date.toLocaleString("id-ID", { month: "long", year: "numeric" });

        if (!absensiPerBulan[bulan]) {
          absensiPerBulan[bulan] = [];
        }

        absensiPerBulan[bulan].push({
          ID_Siswa: absensi.id_siswa,
          Nama_Siswa: absensi.nama_siswa,
          Kelas: absensi.kelas,
          Rombel: absensi.nama_rombel,
          Tanggal: formatDate(absensi.tanggal),
          Keterangan: absensi.status || absensi.kehadiran || absensi.keterangan,
        });
      });

      const workbook = XLSX.utils.book_new();

      const siswaSheet = siswaLulus.map((siswa) => {
        const s = siswa as Siswa;
        return {
          "ID Siswa": s.id_siswa,
          "Nama Siswa": s.nama_siswa,
          NIS: s.nis,
          Kelas: s.kelas,
          Rombel: s.nama_rombel,
          "Nomor Wali": s.nomor_wali,
        };
      });
      const siswaWs = XLSX.utils.json_to_sheet(siswaSheet);
      XLSX.utils.book_append_sheet(workbook, siswaWs, "Data Siswa");

      Object.keys(absensiPerBulan).forEach((bulan) => {
        const worksheet = XLSX.utils.json_to_sheet(absensiPerBulan[bulan]);
        XLSX.utils.book_append_sheet(workbook, worksheet, bulan);
      });

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const excelBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `Data lulusan kelas ${selectedKelas}.xlsx`;
      saveAs(excelBlob, fileName);

      await axios.post(`${baseUrl}/lulus`, siswaLulus.map((siswa) => ({
        id_siswa: siswa.id_siswa,
      })));

      setJumlahLulus(siswaLulus.length);
      setSiswaLulusList((prev) => [...prev, ...siswaLulus]);
      setFilteredKelas((prev) => prev.filter((siswa) => !siswa.tinggalKelas));
      setShowLulusNotif(true);
      setTimeout(() => {
        setShowLulusNotif(false);
      }, 3000);

      setIsModalOpen(false);
      toast.success("Data siswa berhasil diluluskan dan dihapus");
    } catch (error) {
      console.error("Gagal memproses lulus:", error);
      toast.error("Gagal memproses data lulus");
    }
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
            className="mt-1 h-11 md:w-48 lg:w-48 w-96 p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
          <p className="md:inline-block mx-2 my-2">Dari</p>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="p-2 border rounded md:w-28 lg:w-48 w-96"
          >
            <option value="">Kelas</option>
            {Array.isArray(kelas) &&
              [...new Set(kelas.map((siswa) => siswa.kelas))].map(
                (kelasOption) => (
                  <option key={kelasOption} value={kelasOption}>
                    {kelasOption}
                  </option>
                )
              )}
          </select>
          {selectedKelas && !isKelasXII && (
            <>
              <p className="md:inline-block mx-2 my-2">Naik ke</p>
              <select
                value={newIdKelas}
                onChange={(e) => setNewIdKelas(e.target.value)}
                className="p-2 border rounded md:w-32 lg:w-48 w-96"
              >
                <option value="">Pilih Kelas</option>
                {Array.isArray(allKelas) &&
                  allKelas
                    .filter((k) => {
                      const kelasName = String(k.kelas || "").toLowerCase().trim();
                      const selected = String(selectedKelas || "").toLowerCase().trim();
                      return kelasName !== selected;
                    })
                    .map((kelasOption) => (
                      <option
                        className="text-black"
                        key={kelasOption.id_kelas}
                        value={kelasOption.id_kelas}
                      >
                        {kelasOption.kelas}
                      </option>
                    ))}
              </select>
            </>
          )}
        </div>

        {selectedKelas && (
          <div className="flex items-start space-x-6">
            {/* Tabel 1 */}
            <div className="w-1/2 bg-slate-600 p-4 rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left mt-4 border-collapse">
                  <thead>
                    <tr className="ml-2">
                      <th className="p-2 sm:p-3 rounded-l-lg bg-slate-500 text-white">
                        No
                      </th>
                      <th className="p-2 sm:p-3 bg-slate-500 text-white">Nama</th>
                      <th className="p-2 sm:p-3 bg-slate-500 text-white w-24">
                        Kelas
                      </th>
                      <th className="p-2 sm:p-3 bg-slate-500 rounded-r-xl text-white">
                        <div className="flex">
                          <div className="relative group">
                            <button className="px-4 text-white rounded-md">
                              !
                            </button>
                            <div
                              className="absolute left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white text-black text-sm px-1 py-2 rounded-md shadow-lg w-44 opacity-0 scale-95 transition-all duration-500 ease-out 
                              group-hover:opacity-100 group-hover:scale-100"
                            >
                              Aktifkan untuk memilih semua checkbox
                            </div>
                          </div>
                          <div className="inline-block">
                            <input
                              type="checkbox"
                              checked={isAllChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <span
                              onClick={handleToggle}
                              className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 
                                ${isAllChecked ? "bg-blue-600" : "bg-gray-300"}
                              `}
                            >
                              <span
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 
                                  ${
                                    isAllChecked
                                      ? "translate-x-5"
                                      : "translate-x-0"
                                  }
                                }`}
                              />
                            </span>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(filteredKelas) && filteredKelas.length > 0 ? (
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
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-3 text-center text-gray-400 italic"
                        >
                          (Tidak ada data)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

              {/* Tombol Naik dan Lulus */}
              <div className="flex flex-col justify-center items-center space-y-4 mt-24">
                {!isKelasXII && (
                  <button
                    onClick={handleSubmit}
                    disabled={!filteredKelas.some((item) => item.tinggalKelas)}
                    className="bg-teal-500 text-white py-2 px-4 rounded-md w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Naik
                  </button>
                )}
                {isKelasXII && (
                  <button
                    onClick={openModal}
                    disabled={!filteredKelas.some((item) => item.tinggalKelas)}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Lulus
                  </button>
                )}
              {showLulusNotif && (
                <div className="mt-4 bg-green-200 text-green-800 p-4 rounded-md">
                  {jumlahLulus} siswa lulus
                </div>
              )}
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold mb-3">Masukkan Nama Folder</h2>
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  />
                  <div className="mt-4 flex">
                    <button
                      onClick={closeModal}
                      className="mr-3 px-4 py-2 bg-gray-300 rounded"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleLulus}
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                      <th className="p-2 sm:p-3 bg-slate-500 text-white w-24">
                        Kelas
                      </th>
                      <th className="p-2 sm:p-3 bg-slate-500 text-white">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(siswaNaik.length > 0 || siswaLulusList.length > 0) ? (
                      <>
                        {siswaNaik.map((item, index) => (
                          <tr key={`naik-${item.id_siswa || index}`}>
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
                              Naik Kelas
                            </td>
                          </tr>
                        ))}
                        {siswaLulusList.map((item, index) => (
                          <tr key={`lulus-${item.id_siswa || index}`}>
                            <td className="p-3 sm:p-3 text-white border-b">
                              {siswaNaik.length + index + 1}
                            </td>
                            <td className="p-3 sm:p-3 text-white border-b">
                              {item.nama_siswa}
                            </td>
                            <td className="p-3 sm:p-3 text-white border-b">
                              {item.kelas}
                            </td>
                            <td className="p-3 sm:p-3 text-white border-b">
                              Lulus
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-3 text-center text-gray-400 italic"
                        >
                          (Tidak ada data)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
