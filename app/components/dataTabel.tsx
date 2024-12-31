"use client";
import React, { useState } from "react";
import DropdownMenu from "./dropdown";
// import EditForm from "./EditForm"; // Import komponen EditForm
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type DataTableProps<T> = {
  columns: {
    header: string;
    accessor: keyof T;
    Cell?: (props: { row: T }) => React.ReactNode;
  }[]; // Menambahkan properti Cell opsional
  data: T[];
  // onEdit: (row: T) => void;
  // onDelete: (row: T) => void;
};

const DataTable = <T,>({
  columns = [],
  data = [],
  // onEdit,
  // onDelete,
}: DataTableProps<T>) => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<T | null>(null); // State untuk data yang sedang diedit

  const handleDropdownClick = (rowIndex: number) => {
    setOpenDropdown((prevIndex) => (prevIndex === rowIndex ? null : rowIndex));
  };

  const handleEditClick = (row: T, rowIndex: number) => {
    setOpenDropdown(null); // Tutup dropdown setelah klik edit
    setEditingRow(row); // Set row yang sedang diedit
  };

  // const handleDeleteClick = (row: T) => {
  //   setOpenDropdown(null); // Close dropdown after clicking delete
  //   onDelete(row);
  // };

  // const handleUpdate = (updatedRow: T) => {
  //   console.log("Updating row:", updatedRow);
  //   if (onEdit) {
  //     onEdit(updatedRow);
  //     setEditingRow(null);
  //   }
  // };

  return (
    <div className="w-full lg:w-2/2 ">
      {/* <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border"> */}
      {/* <div className="bg-slate-600 px-2 rounded-xl"> */}
      <div className="overflow-x-auto">
        {/* Tambahkan console.log di sini untuk memeriksa apakah data adalah array */}
        {/* {console.log(Array.isArray(data), data)} */}
        <table className="w-full text-left mt-4 border-collapse">
          <thead>
            <tr className="ml-2">
              <th className=" p-2 sm:p-3 bg-slate-500 text-white">No</th>
              {columns.map((column, index) => (
                <th className="p-2 sm:p-3 bg-slate-500 text-white" key={index}>
                  {column.header}
                </th>
              ))}
              {/* <th className="p-2 sm:p-3 bg-slate-500 text-white">Aksi</th> */}
              {/* Kolom aksi */}
            </tr>
          </thead>
          <tbody>
            {/* {Array.isArray(data) &&
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="p-3 sm:p-3 text-white border-b z-50">
                    {rowIndex + 1}
                  </td>
                  {columns.map((column, colIndex) => (
                    <td className="p-3 sm:p-3 text-white border-b z-50" key={column.header}>
                      
                      {typeof column.Cell === "function" 
                        ? column.Cell({ row }) 
                        : column.accessor === 'gambar' && row[column.accessor] ? (
                            <img
                              src={`${BASE_URL}img/${row[column.accessor]}`}
                              alt={row.nama}
                              className="w-16 h-16 object-cover"
                            />
                          ) : row[column.accessor] ? row[column.accessor] : ""
                      }
                    </td>
                  ))}
                </tr>
              ))} */}
            {Array.isArray(data) &&
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="p-3 sm:p-3 text-white border-b z-50">
                    {rowIndex + 1} {/* Menampilkan nomor urut */}
                  </td>
                  {columns.map((column, colIndex) => (
                    <td
                      className="p-3 sm:p-3 text-white border-b z-50"
                      key={column.header}
                    >
                      {/* Pastikan column.Cell ada sebelum mengaksesnya */}
                      {typeof column.Cell === "function" ? (
                        column.Cell({ row }) // Rendering kustom jika Cell didefinisikan
                      ) : column.accessor === "gambar" &&
                        row[column.accessor] ? (
                        <img
                          src={`${BASE_URL}img/${String(row[column.accessor])}`}
                          // alt={String(row.nama)}
                          alt={(row as { nama: string }).nama}
                          className="w-16 h-16 object-cover"
                        />
                      ) : row[column.accessor] !== undefined ? (
                        String(row[column.accessor]) // Render nilai sebagai string
                      ) : (
                        "" // Default kosong jika tidak ada nilai
                      )}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* </div> */}
      {/* </div> */}
      {/* Tampilkan form edit jika ada data yang sedang diedit */}
      {/* {editingRow && (
        <EditForm
          initialData={editingRow}
          onUpdate={handleUpdate}
          onCancel={() => setEditingRow(null)} // Fungsi untuk membatalkan edit
        />
      )} */}
    </div>
  );
};

export default DataTable;
