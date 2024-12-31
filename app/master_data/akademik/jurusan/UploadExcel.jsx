import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const UploadExcel = ({ onUpload }) => {
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet).map((row) => ({
          id_rombel: row.id_rombel || 'default_value',
          id_admin: row.id_admin || '-', // Sesuaikan dengan kolom Excel
          nama_rombel: row.nama_rombel || 'default_value', // Sesuaikan dengan kolom Excel
        }));
        
        console.log('Data dari Excel:', jsonData); // Log data dari Excel
        onUpload(jsonData); // Kirim data ke parent
      } catch (error) {
        console.error('Error membaca file Excel:', error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
    {...getRootProps({
      className: 'border-2 border-dashed p-4 rounded-md cursor-pointer hover:bg-gray-100',
    })}
  >
    <input {...getInputProps()} />
    <p>Drag 'n' drop some files here, or click to select files</p>
  </div>
  
  );
};




export default UploadExcel;
