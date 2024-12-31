import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Tes = {
  id: string;
  nama: string;
  gambar?: string;
  gambarUrl?: string;
};

// Fungsi untuk mengambil daftar tahun ajaran
export const fetchTes = async (): Promise<Tes[]> => {
  try {
    const response = await axios.get(`${baseUrl}/tes/tes`);
    return response.data as Tes[];
  } catch (error) {
    console.error('Error fetching tes:', error);
    throw error;
  }
};

// Fungsi untuk menambah tahun ajaran baru
export const addTes = async (tesData: Tes) => {
  try {
    console.log("Mengirim data ke API:", tesData); // Tambahkan log untuk data yang dikirim
    const response = await axios.post(`${baseUrl}/tes/add-tes`, tesData);
    console.log("Respons dari API:", response.data); // Tambahkan log untuk respons dari API
    return response.data;
  } catch (error) {
    console.error('Error saat menambah tahun ajaran:', error);
    throw error; // Ini akan dilempar kembali ke pemanggil
  }
};