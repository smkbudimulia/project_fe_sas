import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Siswa = {
  id_siswa: string;
  id_admin: string;
  nis: string;
  nama_siswa: string;
  jenis_kelamin: string;
  id_tahun_pelajaran: string;
  id_kelas: string;
  id_rombel: string;
  email: string;
  pass: string;
  foto: string;
  barcode: string;
  nama_wali: string;
  nomor_wali: string;
};

// Fungsi untuk mengambil daftar siswa
export const fetchSiswa = async (): Promise<Siswa[]> => {
  try {
    const response = await axios.get(`${baseUrl}/siswa/all-siswa`);
    console.log('fetch siswa',response)
    return response.data as Siswa[];
  } catch (error) {
    console.error('Error fetching siswa:', error);
    throw error;
  }
};

// Fungsi untuk menambah siswa baru
export const addSiswa = async (siswaData: Siswa) => {
  try {
    console.log("Mengirim data ke API:", siswaData); // Tambahkan log untuk data yang dikirim
    const response = await axios.post(`${baseUrl}/siswa/add-siswa`, siswaData);
    console.log("Respons dari API:", response.data); // Tambahkan log untuk respons dari API
    return response.data;
  } catch (error) {
    console.error('Error saat menambah siswa:', error);
    throw error; // Ini akan dilempar kembali ke pemanggil
  }
};

// Fungsi untuk mengedit siswa
export const updateSiswa = async (updatedData: Siswa): Promise<Siswa> => {
  try {
    // Membuat URL endpoint dengan id dan nis
    const response = await axios.put(`${baseUrl}/siswa/edit-siswa`, updatedData);
    console.log('Siswa updated:', response);
    return response.data as Siswa;
  } catch (error) {
    console.error('Error editing siswa:', error);
    throw error;
  }
};


// Fungsi untuk menghapus siswa
export const deleteSiswa = async (id: string): Promise<void> => {
  try {
      await axios.delete(`${baseUrl}/siswa/hapus-siswa/${id}`);
      console.log('Data siswa berhasil dihapus');
  } catch (error) {
      console.error('Error deleting siswa:', error);
      throw error;
  }
};



