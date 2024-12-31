// components/Navbar.js
import React from 'react';

const Navbar = () => {
  return (
    <header className="bg-teal-500 py-4 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center md:pl-24 md:pr-24 ">
        {/* Logo di sebelah kiri */}
        <div className="flex-shrink-0 mb-4 md:mb-0">
            <img src="/image/logo smk new2.png" alt="" width={112} height={112} className='mt-1'/>
        </div>
        
        {/* Kalimat di tengah */}
        <div className="text-center flex-grow mb-4 md:mb-0">
          <h1 className="text-xl font-bold text-white">
            Sistem Absensi Siswa
          </h1>
        </div>
        
        {/* Tombol di sebelah kanan */}
        <div className="flex-shrink-0">
          <a
            href="https://www.smkbudimuliapakisaji.sch.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-teal-400 text-white text-sm font-medium px-4 py-2 rounded-3xl hover:bg-teal-600 hover:text-white transition duration-300"
          >
            WEB SMK BUDI MULIA PAKISAJI
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
