import React, { useState } from 'react';

type DropdownMenuProps = {
  isOpen: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: (deletedRow: any) => void; // Terima fungsi delete dari parent
  deletedRow: any; // Data baris yang akan dihapus
};

const DropdownMenu = ({ isOpen, onClick, onEdit, onDelete, deletedRow }: DropdownMenuProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsModalOpen(true); // Tampilkan modal konfirmasi
  };

  const handleCancel = () => {
    setIsModalOpen(false); // Sembunyikan modal konfirmasi
  };

  const handleConfirmDelete = () => {
    onDelete(deletedRow); // Panggil fungsi delete dari props
    setIsModalOpen(false); // Sembunyikan modal setelah konfirmasi
  };

  return (
    <div className="relative">
      {/* Tombol untuk membuka/menutup dropdown */}
      <button onClick={onClick} className="px-4 py-2 rounded">
        &#8942;
      </button>
      {/* Dropdown muncul hanya jika isOpen true */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
          <button
            onClick={onEdit}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-200"
          >
            Delete
          </button>
        </div>
      )}
      {/* Modal konfirmasi delete */}
      {isModalOpen && (
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
      )}
    </div>
  );
};

export default DropdownMenu;
