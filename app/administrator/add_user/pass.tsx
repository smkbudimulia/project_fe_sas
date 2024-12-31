
import React, { useState } from 'react';
import Tbpas from './tbpas';
interface PassProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

const pass: React.FC<PassProps> = ({ isOpen, onClose, onConfirm }) => {
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
  
    if (!isOpen) return null;
  
    const handleConfirm = () => {
      if (typeof onConfirm === 'function') {
        setConfirmedPassword(password); // Menyimpan password di state
        onConfirm(password); // Pastikan onConfirm adalah fungsi
      }
       // Menutup modal
    };
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
        <div className="bg-white p-4 rounded shadow-lg">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Masukkan Password Super Admin
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="password super admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border text-black border-gray-300 p-2 rounded w-full"
          />
          <button
            onClick={handleConfirm}
            className="bg-blue-500 text-white px-4 mr-2 py-2 mt-2 rounded"
          >
            Konfirmasi
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Kembali
          </button>
          <Tbpas confirmedPassword={confirmedPassword} />
        </div>
      </div>
    );
  };
  

export default pass
