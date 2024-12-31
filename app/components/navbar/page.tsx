"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Link from "next/link";
import Drop from "./app";
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CogIcon,
} from "@heroicons/react/24/solid";
import {
  ClipboardDocumentIcon,
  ChartBarIcon,
  CalendarIcon,
  UserCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import useUserInfo from "../useUserInfo"; // Pastikan path file sesuai

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


interface PageProps {
  [key: string]: any;  // Longgarkan indeks tipe untuk menerima properti apa saja
} 
interface NavbarBaseProps {
  
}

interface NavbarWithSidebarProps extends NavbarBaseProps {
  // toggleSidebar: () => void; // Fungsi toggleSidebar hanya ada pada tipe ini
}

type NavbarProps = NavbarBaseProps | NavbarWithSidebarProps;



const Navbar: React.FC<NavbarProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
    // const toggleSidebar = () => {
    //   setIsOpen((prev) => !prev); // Toggle nilai isOpen antara true/false
    // };
    const toggleSidebar = () => {
      setIsOpen(!isOpen);
    };

  const [isToggleSidebar, setToggleSidebar] = useState(false);
  // const [isOpen, setIsOpen] = useState(false);
  const [isClick, setisClick] = useState(false);
  const toggleNavbar = () => {
    setisClick(!isClick);
  };
  const [isMasterDataOpen, setMasterDataOpen] = useState(false);
  const [isAkademikOpen, setAkademikOpen] = useState(false);
  const [isSiswaOpen, setSiswaOpen] = useState(false);
  const [isGuruOpen, setGuruOpen] = useState(false);
  const [isAdminOpen, setAdminOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null); // State untuk menu aktif
  const [showPopup, setShowPopup] = useState(false);

  const toggleMasterData = () => {
    setMasterDataOpen(!isMasterDataOpen);
    setAkademikOpen(false);
    setSiswaOpen(false);
    setGuruOpen(false);
    setAdminOpen(false);
  };

  const toggleAkademik = () => {
    setAkademikOpen(!isAkademikOpen);
    setSiswaOpen(false);
    setGuruOpen(false);
    setAdminOpen(false);
  };

  const toggleSiswa = () => {
    setSiswaOpen(!isSiswaOpen);
    setAkademikOpen(false);
    setGuruOpen(false);
    setAdminOpen(false);
  };

  const toggleGuru = () => {
    setGuruOpen(!isGuruOpen);
    setAkademikOpen(false);
    setSiswaOpen(false);
    setAdminOpen(false);
  };

  const toggleAdmin = () => {
    setAdminOpen(!isAdminOpen);
    setMasterDataOpen(false);
    setAkademikOpen(false);
    setSiswaOpen(false);
    setGuruOpen(false);
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    // Remove or modify any logic that changes `isOpen` to false
    // Example:
    // setIsOpen(false); // Remove this if present
  };

  const handleLogout = async () => {
    // Hapus token dari cookie
    Cookies.remove("token");
    Cookies.remove("nama_admin");
    Cookies.remove("status");
    Cookies.remove("id_admin");
    try {
      // Panggil endpoint logout di backend
      const response = await axios.post(`${baseUrl}/api/logout`, {
        withCredentials: true, // Pastikan cookies dikirim dengan permintaan
      });

      console.log("Logout response:", response);

      if (response.status === 200) {
        // Redirect ke halaman login setelah logout
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const { namaAdmin, status } = useUserInfo();
  const [profileImage, setProfileImage] = useState("/default-image.jpg"); // Gambar default

  useEffect(() => {
    // Ambil gambar dari Local Storage
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // Tambahkan event listener untuk sinkronisasi real-time
    const handleStorageChange = () => {
      const updatedImage = localStorage.getItem("profileImage");
      if (updatedImage) {
        setProfileImage(updatedImage);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Hapus event listener saat komponen di-unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  return (
    <>
      <nav className="bg-teal-500 z-30 sticky top-0 shadow-lg">
        <div className="max-w mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="text-white justify-between focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="flex-shrink-0 p-4">
                <img
                  src="/image/logo smk new2.png"
                  alt=""
                  width={112}
                  height={112}
                  className="mt-1"
                />
                {/* <a href="" className='text-white'>Logo</a> */}
              </div>
            </div>
            <div className="block">
              <div className="ml-4 flex items-center space-x-4">
                <span className="hidden text-right md:block">
                  <span>{namaAdmin}</span>
                  <span className="block italic text-sm">{status}</span>
                  {/* <span className='block text-xs text-dark'>Admin</span> */}
                </span>
                {/* <span className="w-10 h-10 rounded-full">
                  <img
                    src="/image/logo 2.jpg"
                    alt=""
                    width={112}
                    height={112}
                    className="bg-black w-auto h-auto rounded-full"
                  />
                </span> */}
                <span className="w-10 h-10 rounded-full">
                  <img
                    src={profileImage}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="bg-black w-auto h-auto rounded-full"
                  />
                </span>

                <Drop />
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-20 bg-teal-400 text-white w-64 p-5 transform 
            ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }  transition-transform duration-500 ease-in-out`}
      >
        <div></div>
        <nav className="pt-16 min-h-screen">
          <h2 className="px-4 opacity-75">Menu</h2>
          <ul>
            <li className="mb-2">
              <Link href="/dash">
                <div
                  onClick={() => handleMenuClick("dashboard")}
                  className={`px-4 py-2 hover:bg-teal-200 rounded flex items-center cursor-pointer ${
                    activeMenu === "dashboard" ? "bg-teal-500" : ""
                  }`}
                >
                  {isMasterDataOpen ? (
                    <HomeIcon className="h-6 w-6 mr-2" />
                  ) : (
                    <HomeIcon className="h-6 w-6 mr-2" />
                  )}
                  <p>Dashboard</p>
                </div>
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/absensi">
                <div
                  onClick={() => handleMenuClick("absensi")}
                  className={`px-4 py-2 hover:bg-teal-200 rounded flex items-center cursor-pointer ${
                    activeMenu === "absensi" ? "bg-teal-500" : ""
                  }`}
                >
                  <ClipboardDocumentIcon className="h-6 w-6 mr-2" />
                  <p>Absensi</p>
                </div>
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/naik_kelas">
                <div
                  onClick={() => handleMenuClick("naik_kelas")}
                  className={`px-4 py-2 hover:bg-teal-200 rounded flex items-center cursor-pointer ${
                    activeMenu === "naik_kelas" ? "bg-teal-500" : ""
                  }`}
                >
                  <AcademicCapIcon className="h-6 w-6 mr-2" />
                  <p>Naik Kelas</p>
                </div>
              </Link>
            </li>
            <li className="mb-2">
              <button
                onClick={toggleMasterData}
                className="w-full text-left block px-4 py-2 hover:bg-teal-200 rounded focus:outline-none"
              >
                <div
                  onClick={() => handleMenuClick("master_data")}
                  className={`w-full text-left py-2 hover:bg-teal-200 flex items-center focus:outline-none ${
                    activeMenu === "master_data" ? "bg-teal-400" : ""
                  }`}
                >
                  <ChartBarIcon className="h-6 w-6 mr-2" />
                  <p className="">Master Data</p>
                  {isMasterDataOpen ? (
                    <ChevronUpIcon className="h-5 w-5 " />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 " />
                  )}
                </div>
              </button>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isMasterDataOpen ? "max-h-screen " : "max-h-0 opacity-0"
                }`}
              >
                {isMasterDataOpen && (
                  <ul className="pl-4 mt-2 space-y-1">
                    <li>
                      <button
                        onClick={toggleAkademik}
                        className="w-full text-left block px-4 py-2 hover:bg-teal-200 rounded focus:outline-none"
                      >
                        <div className="hover:bg-teal-200 rounded flex items-center cursor-pointer">
                          {/* <AcademicCapIcon className="h-6 w-6 mr-2" /> */}
                          <p className="opacity-85">Akademik</p>
                        </div>
                      </button>
                      <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          isAkademikOpen ? "max-h-screen " : "max-h-0 opacity-0"
                        }`}
                      >
                        {isAkademikOpen && (
                          <ul className="pl-4 mt-2 space-y-1">
                            <li>
                              <Link href="/master_data/akademik/thn_ajaran">
                                <div
                                  onClick={() => handleMenuClick("thn_ajaran")}
                                  className={`px-4 py-2 hover:bg-teal-200 rounded flex items-center cursor-pointer ${
                                    activeMenu === "thn_ajaran"
                                      ? "bg-teal-500"
                                      : ""
                                  }`}
                                >
                                  <p className="block rounded opacity-70">
                                    Tahun Ajaran
                                  </p>
                                </div>
                              </Link>
                            </li>
                            <li>
                              <Link href="/master_data/akademik/kelas">
                                <p className="block px-4 py-2 hover:bg-teal-200 rounded opacity-70">
                                  Kelas
                                </p>
                              </Link>
                            </li>
                            <li>
                              <Link href="/master_data/akademik/jurusan">
                                <p className="block px-4 py-2 hover:bg-teal-200 rounded opacity-70">
                                  Rombel
                                </p>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </div>
                    </li>
                    <li>
                      <button
                        onClick={toggleSiswa}
                        className="w-full text-left block px-4 py-2 hover:bg-teal-200 rounded focus:outline-none"
                      >
                        <p className="opacity-85">Siswa</p>
                      </button>
                      <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          isSiswaOpen ? "max-h-screen " : "max-h-0 opacity-0"
                        }`}
                      >
                        {isSiswaOpen && (
                          <ul className="pl-4 mt-2 space-y-1">
                            <li>
                              <Link href="/master_data/siswa/data_siswa">
                                <p className="block px-4 py-2 hover:bg-teal-200 rounded opacity-70">
                                  Siswa
                                </p>
                              </Link>
                            </li>
                            <li>
                              <Link href="/master_data/siswa/rombel">
                                <p className="block px-4 py-2 hover:bg-teal-200 rounded opacity-70">
                                  Rombel
                                </p>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </div>
                    </li>
                    <li>
                      <button
                        onClick={toggleGuru}
                        className="w-full text-left block px-4 py-2 hover:bg-teal-200 rounded focus:outline-none opacity-85"
                      >
                        Guru
                      </button>
                      <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          isGuruOpen ? "max-h-screen " : "max-h-0 opacity-0"
                        }`}
                      >
                        {isGuruOpen && (
                          <ul className="pl-4 mt-2 space-y-1">
                            <li>
                              <Link href="/master_data/guru/mapel">
                                <p className="block px-4 py-2 hover:bg-teal-200 rounded opacity-70">
                                  Mapel
                                </p>
                              </Link>
                            </li>
                            <li>
                              <Link href="/master_data/guru/data_guru">
                                <p className="block px-4 py-2 hover:bg-teal-200 rounded opacity-70">
                                  Guru
                                </p>
                              </Link>
                            </li>
                            <li>
                              <Link href="/master_data/guru/mengampu">
                                <p className="block px-4 py-2 hover:bg-teal-200 rounded opacity-70">
                                  Mengampu
                                </p>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </div>
                    </li>
                  </ul>
                )}
              </div>
            </li>
            <li className="mb-2">
              <button
                onClick={toggleAdmin}
                className="w-full text-left flex items-center px-4 py-2 hover:bg-teal-200 rounded focus:outline-none"
              >
                <div
                  onClick={() => handleMenuClick("master_data")}
                  className={`w-full text-left py-2 hover:bg-teal-200 flex items-center focus:outline-none ${
                    activeMenu === "master_data" ? "bg-teal-500" : ""
                  }`}
                >
                  <UserGroupIcon className="h-6 w-6 mr-2" />
                  <p className="">Administrator</p>
                  {isAdminOpen ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </div>
              </button>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isAdminOpen ? "max-h-screen " : "max-h-0 opacity-0"
                }`}
              >
                {isAdminOpen && (
                  <ul className="pl-4 mt-2 space-y-1">
                    <li>
                      <Link href="/profile">
                        <p className="block px-4 py-2 hover:bg-teal-200 rounded opacity-85">
                          Profile
                        </p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/administrator/add_user">
                        <p className="block px-4 py-2 hover:bg-teal-200 rounded opacity-85">
                          Add User
                        </p>
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            </li>
            <li className="mb-2">
              <Link href="/setting">
                <div
                  onClick={() => handleMenuClick("setting")}
                  className={`px-4 py-2 hover:bg-teal-200 rounded flex items-center cursor-pointer ${
                    activeMenu === "setting" ? "bg-teal-500" : ""
                  }`}
                >
                  <CogIcon className="h-6 w-6 mr-2" />
                  <p>Setting</p>
                </div>
              </Link>
            </li>
            <li className="mb-2">
              <Link href={""}>
                <div
                  onClick={() => setShowPopup(true)}
                  className={`px-4 py-2 hover:bg-teal-200 rounded flex items-center cursor-pointer ${
                    activeMenu === "setting" ? "bg-teal-500" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="h-5 w-5 mr-2 pl-1"
                  />
                  <p>Logout</p>
                </div>
              </Link>
            </li>
            {/* Tambahkan menu lainnya di sini */}
          </ul>
        </nav>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              Apakah Anda yakin ingin logout?
            </h2>
            <div className="flex ">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded ml-auto"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      {/* <main
        className={`px-30 transition-transform duration-300 relative ${
          isOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="flex-1 p-6 transition-transform duration-300">
          <div className="min-h-screen">
            <h1>hhhhhh</h1>
          </div>
        </div>
      </main> */}
    </>
  );
};

export default Navbar;
