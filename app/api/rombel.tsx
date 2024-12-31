import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Rombel = {
    id_rombel: string;
    id_admin: string;
    nama_rombel: string; // Anda bisa menambahkan properti lain sesuai kebutuhan
  };
  
// Fungsi untuk mengambil daftar rombel
export const fetchRombel = async (): Promise<Rombel[]> => {
    try {
      const response = await axios.get(`${baseUrl}/rombel/all-rombel`);
      return response.data as Rombel[];
    } catch (error) {
      console.error('Error fetching rombel:', error);
      throw error;
    }
  };

// Fungsi untuk menambah rombel baru
export const addRombel = async (rombelData: Rombel) => {
    try {
      console.log("Mengirim data ke API:", rombelData); // Tambahkan log untuk data yang dikirim
      const response = await axios.post(`${baseUrl}/rombel/add-rombel`, rombelData);
      console.log("Respons dari API:", response.data); // Tambahkan log untuk respons dari API
      return response.data;
    } catch (error) {
      console.error('Error saat menambah rombel:', error);
      throw error; // Ini akan dilempar kembali ke pemanggil
    }
  };

// Fungsi untuk mengedit rombel
export const updateRombel = async (id: string, updatedData: Partial<Rombel>): Promise<Rombel> => {
  try {
    console.log(`Updating data at: ${baseUrl}/rombel/edit-rombel/${id}`);
    console.log('Data to be updated:', updatedData);
    const response = await axios.put(`${baseUrl}/rombel/edit-rombel/${id}`, updatedData);
    return response.data as Rombel;
  } catch (error) {
    console.error('Error updating rombel:', error);
    throw error;
  }
};

// Fungsi untuk menghapus rombel
export const deleteRombel = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${baseUrl}/rombel/hapus-rombel/${id}`);
    console.log('Rombel berhasil dihapus');
  } catch (error) {
    console.error('Error deleting rombel:', error);
    throw error;
  }
};
