import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export type TahunAjaran = {
  id_tahun_pelajaran: string;
  id_admin: string;
  tahun: string;
  aktif: string;
};

// Fungsi untuk mengambil daftar tahun ajaran
export const fetchTahunAjaran = async (): Promise<TahunAjaran[]> => {
  try {
    const response = await axios.get(`${baseUrl}/tahun-pelajaran/all-tahun-pelajaran`);
    return response.data as TahunAjaran[];
  } catch (error) {
    console.error('Error fetching tahun ajaran:', error);
    throw error;
  }
};

// Fungsi untuk menambah tahun ajaran baru
export const addTahunAjaran = async (tahunAjaranData: TahunAjaran) => {
  try {
    console.log("Mengirim data ke API:", tahunAjaranData); // Tambahkan log untuk data yang dikirim
    const response = await axios.post(`${baseUrl}/tahun-pelajaran/add-tahun-pelajaran`, tahunAjaranData);
    console.log("Respons dari API:", response.data); // Tambahkan log untuk respons dari API
    return response.data;
  } catch (error) {
    console.error('Error saat menambah tahun ajaran:', error);
    throw error; // Ini akan dilempar kembali ke pemanggil
  }
};

// Fungsi untuk mengedit tahun ajaran baru
export const updateTahunAjaran = async (id: string, updatedData: Partial<TahunAjaran>): Promise<TahunAjaran> => {
  try {
    console.log(`Updating data at: ${baseUrl}/tahun-pelajaran/edit-tahun-pelajaran/${id}`);
    console.log('Data to be updated:', updatedData);
    const response = await axios.put(`${baseUrl}/tahun-pelajaran/edit-tahun-pelajaran/${id}`, updatedData);
    return response.data as TahunAjaran;
  } catch (error) {
    console.error('Error updating tahun ajaran:', error);
    throw error;
  }
};

export const deleteTahunAjaran = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting data at: ${baseUrl}/tahun-pelajaran/hapus-tahun-pelajaran/${id}`);
    await axios.delete(`${baseUrl}/tahun-pelajaran/hapus-tahun-pelajaran/${id}`);
    console.log(`Tahun ajaran with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting tahun ajaran:', error);
    throw error; // Melempar kembali error agar bisa ditangani di tempat lain
  }
};




