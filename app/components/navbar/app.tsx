import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const DropdownMenu = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = async () => {
    // Hapus token dari cookie
    Cookies.remove('token');
    Cookies.remove('nama_admin');
    Cookies.remove('status');
    Cookies.remove('id_admin');
    try {
      // Panggil endpoint logout di backend
      const response = await axios.post(`${baseUrl}/api/logout`, {
        withCredentials: true, // Pastikan cookies dikirim dengan permintaan
      });
  
      console.log('Logout response:', response);
  
      if (response.status === 200) {
        // Redirect ke halaman login setelah logout
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
      >
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5">
          <ul className="py-1">
            <li>
              <a
                href="../../../profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Profile
              </a>
            </li>
            <li>
              <a
                href="../../administrator/add_user"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Add User
              </a>
            </li>
            <li>
              <a
                href="../../../setting"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Settings
              </a>
            </li>
            <hr />
            <li>
              <a onClick={() => setShowPopup(true)} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Logout
              </a>
              {showPopup && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded shadow-lg">
                    <h2 className="text-lg font-bold mb-4">Apakah Anda yakin ingin logout?</h2>
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
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
