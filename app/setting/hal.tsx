"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface Item {
  id_setting?: string;
  hari?: string;
  jam_masuk: string[] | null;
  jam_pulang: string[] | null;
  jam_terlambat: string[] | null;
  tanggal_libur?: string | null;
}

const formatTimeForApi = (time: string): string | null => {
  if (!time) return null;
  return time.replace(":", ".");
};

export default function Schedule() {
  const hariUrutan = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  const [settings, setSettings] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const [arrivalFrom, setArrivalFrom] = useState("");
  const [arrivalTo, setArrivalTo] = useState("");
  const [departureFrom, setDepartureFrom] = useState("");
  const [departureTo, setDepartureTo] = useState("");
  const [latenessFrom, setLatenessFrom] = useState("");
  const [latenessTo, setLatenessTo] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [instansiName, setInstansiName] = useState("");
  const [instansiFromApi, setInstansiFromApi] = useState<{ nama_instansi?: string; logo?: string } | null>(null);

  const [batasAbsen, setBatasAbsen] = useState("");
  const [existingBatasAbsen, setExistingBatasAbsen] = useState(false);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  // Fetch batas absen
  useEffect(() => {
    const fetchBatasAbsen = async () => {
      try {
        const res = await axios.get(`${baseUrl}/setting/get-batas-absen`);
        if (res.data?.data?.batas_absen) {
          const cron = res.data.data.batas_absen.split(" ");
          if (cron.length >= 2) {
            const minute = cron[0].padStart(2, "0");
            const hour = cron[1].padStart(2, "0");
            setBatasAbsen(`${hour}:${minute}`);
            setExistingBatasAbsen(true);
          }
        }
      } catch (err) {
        setExistingBatasAbsen(false);
      }
    };
    fetchBatasAbsen();
  }, []);

  const convertToCron = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return `${minute} ${hour} * * *`;
  };

  const handleSaveBatasAbsen = async () => {
    if (!batasAbsen) {
      toast.error("Jam batas absen belum diisi!");
      return;
    }
    const cronTime = convertToCron(batasAbsen);
    try {
      await axios.post(`${baseUrl}/setting/update-batas-absen`, { batas_absen: cronTime });
      toast.success(existingBatasAbsen ? "Batas absen diperbarui!" : "Batas absen ditambahkan!");
      setExistingBatasAbsen(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Gagal simpan batas absen!");
      } else {
        toast.error("Terjadi kesalahan!");
      }
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [settingsResp, instansiResp] = await Promise.all([
        axios.get(`${baseUrl}/setting/all-setting`),
        fetch(`${baseUrl}/setting/all-instansi`).then((r) => r.json()),
      ]);

      const data: Item[] = settingsResp.data?.data || [];
      const normalized = data.map((s) => ({
        ...s,
        jam_masuk: Array.isArray(s.jam_masuk) ? s.jam_masuk : (s.jam_masuk ? String(s.jam_masuk).split(",") : null),
        jam_pulang: Array.isArray(s.jam_pulang) ? s.jam_pulang : (s.jam_pulang ? String(s.jam_pulang).split(",") : null),
        jam_terlambat: Array.isArray(s.jam_terlambat) ? s.jam_terlambat : (s.jam_terlambat ? String(s.jam_terlambat).split(",") : null),
      }));

      const sorted = normalized.sort((a, b) => {
        if (a.tanggal_libur && b.tanggal_libur) return 0;
        if (a.tanggal_libur) return 1;
        if (b.tanggal_libur) return -1;
        return hariUrutan.indexOf(a.hari || "") - hariUrutan.indexOf(b.hari || "");
      });

      setSettings(sorted);

      if (instansiResp.success && Array.isArray(instansiResp.data) && instansiResp.data.length > 0) {
        const inst = instansiResp.data[0];
        setInstansiFromApi(inst);
        setInstansiName(inst.nama_instansi || "");
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
    }
  };

  const handleSaveClick = async () => {
    if (selectedDays.length === 0) {
      toast.error("Pilih setidaknya satu hari!");
      return;
    }

    const scheduleArray: any[] = selectedDays.map((day) => ({
      hari: day,
      jam_masuk: [formatTimeForApi(arrivalFrom), formatTimeForApi(arrivalTo)],
      jam_pulang: [formatTimeForApi(departureFrom), formatTimeForApi(departureTo)],
      jam_terlambat: [formatTimeForApi(latenessFrom), formatTimeForApi(latenessTo)],
      tanggal_libur: null,
    }));

    try {
      await axios.post(`${baseUrl}/setting/setting-sistem`, scheduleArray);
      toast.success("Jadwal berhasil disimpan!");
      await fetchAll();

      setArrivalFrom("");
      setArrivalTo("");
      setDepartureFrom("");
      setDepartureTo("");
      setLatenessFrom("");
      setLatenessTo("");
      setSelectedDays([]);
    } catch (error) {
      console.error("Error menyimpan jadwal:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Gagal menyimpan jadwal!");
      } else {
        toast.error("Terjadi kesalahan saat menyimpan!");
      }
    }
  };

  const handleSaveInstansi = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("nama_instansi", instansiName);
    if (logoFile) fd.append("logo", logoFile);

    try {
      await axios.post(`${baseUrl}/setting/instansi`, fd);
      toast.success("Instansi disimpan!");
      setLogoFile(null);
      setLogoPreview(null);
      await fetchAll();
    } catch (error) {
      console.error("Error menyimpan instansi:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Gagal menyimpan instansi!");
      } else {
        toast.error("Terjadi kesalahan!");
      }
    }
  };

  // Warna untuk hari aktif
  const getDayColor = (hari: string) => {
    if (!hari) return "bg-gray-100";
    const index = hariUrutan.indexOf(hari);
    const colors = [
      "bg-blue-100 border-blue-300", // Senin
      "bg-green-100 border-green-300", // Selasa
      "bg-yellow-100 border-yellow-300", // Rabu
      "bg-purple-100 border-purple-300", // Kamis
      "bg-red-100 border-red-300", // Jumat
      "bg-pink-100 border-pink-300", // Sabtu
      "bg-indigo-100 border-indigo-300", // Minggu
    ];
    return colors[index] || "bg-gray-100 border-gray-300";
  };

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-6">
      <ToastContainer className="mt-16" />

      <div className="container mx-auto">
        <h1 className="text-xl md:text-2xl font-semibold mb-4">Setting Waktu Absensi</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Jadwal */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-3">Set Hari & Waktu</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {hariUrutan.map((h) => (
                <div
                  key={h}
                  onClick={() => toggleDay(h)}
                  className={`px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium ${
                    selectedDays.includes(h)
                      ? "bg-teal-500 text-white border-2 border-teal-600"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {h}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Jam Datang</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="time"
                    value={arrivalFrom}
                    onChange={(e) => setArrivalFrom(e.target.value)}
                    className="border rounded p-2 w-full text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="time"
                    value={arrivalTo}
                    onChange={(e) => setArrivalTo(e.target.value)}
                    className="border rounded p-2 w-full text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Jam Terlambat</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="time"
                    value={latenessFrom}
                    onChange={(e) => setLatenessFrom(e.target.value)}
                    className="border rounded p-2 w-full text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="time"
                    value={latenessTo}
                    onChange={(e) => setLatenessTo(e.target.value)}
                    className="border rounded p-2 w-full text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Jam Pulang</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="time"
                    value={departureFrom}
                    onChange={(e) => setDepartureFrom(e.target.value)}
                    className="border rounded p-2 w-full text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="time"
                    value={departureTo}
                    onChange={(e) => setDepartureTo(e.target.value)}
                    className="border rounded p-2 w-full text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveClick}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Simpan Jadwal
              </button>
            </div>

            {/* Batas ALPA */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-semibold mb-2">Batas ALPA</h3>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <input
                  type="time"
                  value={batasAbsen}
                  onChange={(e) => setBatasAbsen(e.target.value)}
                  className="border p-2 rounded text-sm"
                />
                <button
                  onClick={handleSaveBatasAbsen}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
                >
                  Simpan
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Siswa yang belum melakukan presensi pada/ diatas pukul:{" "}
                <strong>{batasAbsen || "Belum diatur"}</strong> otomatis ALPA
              </p>
            </div>
          </section>

          {/* Data & Instansi */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-3">Hari Aktif</h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {settings.length === 0 ? (
                  <p className="text-gray-500">Tidak ada data.</p>
                ) : (
                  settings
                    .filter((it) => it.hari) // hanya hari, bukan libur tanggal
                    .map((it) => (
                      <div
                        key={it.id_setting || it.hari}
                        className={`p-3 rounded-lg border ${getDayColor(it.hari!)} shadow-sm`}
                      >
                        <h3 className="font-bold text-gray-800">{it.hari}</h3>
                        <p className="text-sm">
                          <strong>Masuk:</strong>{" "}
                          {it.jam_masuk ? `${it.jam_masuk[0]} - ${it.jam_masuk[1]}` : "Libur"}
                        </p>
                        <p className="text-sm">
                          <strong>Terlambat:</strong>{" "}
                          {it.jam_terlambat ? `${it.jam_terlambat[0]} - ${it.jam_terlambat[1]}` : "Libur"}
                        </p>
                        <p className="text-sm">
                          <strong>Pulang:</strong>{" "}
                          {it.jam_pulang ? `${it.jam_pulang[0]} - ${it.jam_pulang[1]}` : "Libur"}
                        </p>
                      </div>
                    ))
                )}
              </div>
            )}

            <hr className="my-4" />
            <h3 className="font-semibold mb-2">Instansi</h3>
            <form onSubmit={handleSaveInstansi}>
              <input
                value={instansiName}
                onChange={(e) => setInstansiName(e.target.value)}
                placeholder="Nama Instansi"
                className="border p-2 rounded w-full text-sm"
              />
              <div className="mt-3">
                <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm" />
                {(logoPreview || instansiFromApi?.logo) && (
                  <img
                    src={logoPreview || instansiFromApi?.logo || ""}
                    alt="Logo"
                    className="w-20 h-20 mt-2 object-contain border rounded"
                  />
                )}
              </div>
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded mt-3 text-sm font-medium"
              >
                Simpan Instansi
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}