import { useEffect, useState } from "react";
import Image from "next/image";

const ProfileCard = () => {
  const [activeTab, setActiveTab] = useState("detail");
  const [profileImage, setProfileImage] = useState(null); // Untuk menyimpan URL gambar
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null); // Untuk pratinjau gambar
  const [isSaving, setIsSaving] = useState(false);
  // State untuk menyimpan data profil yang ditampilkan
  const [profileData, setProfileData] = useState({
    nama: "",
    status: "",
    tentang: "",
    alamat: "",
    jenisKelamin: "",
    nomorTelepon: "",
    email: "",
  });

  // State untuk menyimpan data profil yang sedang diedit
  const [editProfileData, setEditProfileData] = useState({
    profileImage: "", // Gambar kosong secara default
    status: "",
    tentang: "",
    nama: "",
    alamat: "",
    jenisKelamin: "",
    nomorTelepon: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fungsi untuk menangani perubahan input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement |  HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fungsi untuk menangani perubahan gambar profil
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
      // localStorage.setItem("profileImage", reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };
  // Memuat data profil dan gambar profil saat komponen di-mount
  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    const savedProfileData = localStorage.getItem("profileData");

    if (savedImage) {
      setImagePreview(savedImage);
    }

    if (savedProfileData) {
      setProfileData(JSON.parse(savedProfileData));
      setEditProfileData(JSON.parse(savedProfileData));
    } else {
      setActiveTab("edit"); // Atur tab aktif ke 'edit' jika tidak ada data
    }
  }, []);

  // Fungsi untuk menyimpan perubahan profil (misalnya, kirim ke backend)
  const handleSave = () => {
    // Simpan data gambar profil
    if (imagePreview) {
      if (typeof imagePreview === 'string') {
        localStorage.setItem('profileImage', imagePreview);
      } else {
        console.error("imagePreview bukan string, tidak dapat disimpan ke localStorage.");
      }
    }
  
    // Simpan data lainnya
    localStorage.setItem('profileData', JSON.stringify(editProfileData));
  
    // Setelah berhasil menyimpan, ubah tab aktif
    setActiveTab('detail');
  };
  const handlePasswordSave = () => {
    // Tambahkan logika untuk memvalidasi dan menyimpan perubahan kata sandi
    console.log("Password data:", passwordData);
    // Reset password fields
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const getImageSrc = (imagePreview: string | ArrayBuffer | null) => {
    if (imagePreview === null) {
      return ''; // Atau gambar default jika null
    }

    if (typeof imagePreview === 'string') {
      return imagePreview; // Jika sudah string (Data URL)
    } else if (imagePreview instanceof ArrayBuffer) {
      // Jika ArrayBuffer, buat URL objek dari ArrayBuffer
      const blob = new Blob([imagePreview], { type: 'image/jpeg' }); // Sesuaikan dengan tipe gambar
      return URL.createObjectURL(blob);
    }

    return ''; // Jika tidak ada gambar, kembalikan string kosong
  };

  return (
    <div className="rounded-lg max-w-full bg-slate-100">
      <div className="pt-8 ml-7">
        <h1 className="text-2xl font-bold">Profile</h1>
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
            <li className="text-gray-500">Profile</li>
          </ol>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border">
            <div className="p-4 rounded-lg">
              <div className="p-6 border-gray-200 lg:pr-6">
                {" "}
                {/* Menambahkan padding kanan untuk jarak */}
                <div className="flex space-x-4">
                  {imagePreview && (
                    <Image
                      src={getImageSrc(imagePreview)} // Ganti dengan path ke foto profil Anda
                      alt="Foto Profil"
                      width={128}
                      height={128}
                      className="w-32 h-32 mx-auto rounded-full object-cover"
                    />
                  )}
                </div>
                <div className="flex items-center flex-col">
                  <h1 className="text-xl font-bold p-4 text-center">
                    {profileData.nama}
                  </h1>
                  <p className="text-gray-600">{profileData.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* menu */}
        <div className="w-full lg:w-2/3 p-4 lg:p-6">
          <div className="pl-8 bg-white rounded-lg shadow-md p-4 lg:p-6 border ">
            <ul className="flex my-4 space-x-6">
              <li>
                <button
                  className={`text-blue-500 hover:underline ${
                    activeTab === "detail" ? "font-bold" : ""
                  }`}
                  onClick={() => setActiveTab("detail")}
                >
                  Detail Profile
                </button>
              </li>
              <li>
                <button
                  className={`text-blue-500 hover:underline ${
                    activeTab === "edit" ? "font-bold" : ""
                  }`}
                  onClick={() => setActiveTab("edit")}
                >
                  Edit Profile
                </button>
              </li>
              <li>
                <button
                  className={`text-blue-500 hover:underline ${
                    activeTab === "ubah" ? "font-bold" : ""
                  }`}
                  onClick={() => setActiveTab("ubah")}
                >
                  Ubah Sandi
                </button>
              </li>
            </ul>

            {/* Conditionally render content based on activeTab */}
            {activeTab === "detail" && (
              <div>
                {/* {imagePreview && <img src={imagePreview} alt="Profile" className="w-32 h-32 mb-4 rounded-full object-cover" />} */}
                <h2 className="mb-4 text-lg">Tentang</h2>
                <p className="mb-4">{profileData.tentang}</p>
                <ul className="list-disc space-y-6">
                  <li className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 sm:w-60 sm:mr-4">Nama</span>
                    <span>{profileData.nama}</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 sm:w-60 sm:mr-4">
                      Alamat
                    </span>
                    <span>{profileData.alamat}</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 sm:w-60 sm:mr-4">
                      Jenis Kelamin
                    </span>
                    <span>{profileData.jenisKelamin}</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 sm:w-60 sm:mr-4">
                      Nomor Telepon
                    </span>
                    <span>{profileData.nomorTelepon}</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-400 sm:w-60 sm:mr-4">Email</span>
                    <span>{profileData.email}</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "edit" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center items-start mb-4">
                  <span className="lg:w-48 sm:w-52 block text-gray-400 mb-2 lg:-mt-32 md:-mt-32 sm:-mt-0 ">
                    Profile Image
                  </span>
                  <div className="lg:ml-14 md:ml-6 flex-col items-center sm:ml-0">
                    {imagePreview && (
                      <img
                        src={getImageSrc(imagePreview)} // Gambar default jika belum ada
                        alt="Profile Preview"
                        className="w-32 h-32 mb-2 rounded-full object-cover"
                      />
                    )}
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <ul className="list-disc space-y-6">
                  <p className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-80 text-gray-400">Status</span>
                    <input
                      name="status"
                      value={editProfileData.status}
                      onChange={handleChange}
                      className="w-full border h-8 py-4 px-2 rounded-lg shadow-md"
                    />
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-80 text-gray-400">Nama Lengkap</span>
                    <input
                      type="text"
                      name="nama"
                      value={editProfileData.nama}
                      onChange={handleChange}
                      className="w-full border h-8 py-4 px-2 rounded-lg shadow-md"
                    />
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-80 text-gray-400 lg:-mt-24 md:-mt-24 sm:-mt-0">
                      Tentang
                    </span>
                    <textarea
                      name="tentang"
                      value={editProfileData.tentang}
                      onChange={handleChange}
                      className="w-full h-28 border py-1 px-2 shadow-md overflow-visible"
                    />
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-80 text-gray-400">Alamat</span>
                    <input
                      type="text"
                      name="alamat"
                      value={editProfileData.alamat}
                      onChange={handleChange}
                      className="w-full border h-8 py-4 px-2 rounded-lg shadow-md"
                    />
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-80 text-gray-400">Jenis Kelamin</span>
                    <input
                      type="text"
                      name="jenisKelamin"
                      value={editProfileData.jenisKelamin}
                      onChange={handleChange}
                      className="w-full border h-8 py-4 px-2 rounded-lg shadow-md"
                    />
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-80 text-gray-400">Nomor Telepon</span>
                    <input
                      type="text"
                      name="nomorTelepon"
                      value={editProfileData.nomorTelepon}
                      onChange={handleChange}
                      className="w-full border h-8 py-4 px-2 rounded-lg shadow-md"
                    />
                  </p>
                  <p className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-80 text-gray-400">Email</span>
                    <input
                      type="text"
                      name="email"
                      value={editProfileData.email}
                      onChange={handleChange}
                      className="w-full border h-8 py-4 px-2 rounded-lg shadow-md"
                    />
                  </p>
                </ul>
                <div className="flex flex-col sm:flex-row sm:items-center justify-center items-center mt-4">
                  <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={isSaving}
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "ubah" && (
              <div>
                <h2 className="text-lg font-bold mb-4">Ubah Sandi</h2>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-gray-600 mb-1"
                      htmlFor="oldPassword"
                    >
                      Password Lama
                    </label>
                    <input
                      type="password"
                      id="oldPassword"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full border h-8 py-4 px-2 rounded-lg shadow-md"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 mb-1"
                      htmlFor="newPassword"
                    >
                      Password Baru
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full border h-8 py-4 px-2 rounded-lg shadow-md"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 mb-1"
                      htmlFor="confirmPassword"
                    >
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full border h-8 py-4 px-2 rounded-lg shadow-md"
                    />
                  </div>
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handlePasswordSave}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
