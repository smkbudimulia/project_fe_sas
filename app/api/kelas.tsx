import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Kelas = {
    id_kelas: string;
    id_admin: string;
    kelas: string; // Anda bisa menambahkan properti lain sesuai kebutuhan
  };
  
// Fungsi untuk mengambil daftar kelas
export const fetchKelas = async (): Promise<Kelas[]> => {
    try {
      const response = await axios.get(`${baseUrl}/kelas/all-kelas`);
      return response.data as Kelas[];
    } catch (error) {
      console.error('Error fetching kelas:', error);
      throw error;
    }
  };

// Fungsi untuk menambah kelas baru
export const addKelas = async (kelasData: { id_kelas: string, id_admin: string, kelas: string }) => {
    try {
      // console.log("Mengirim data ke API:", kelasData);
      const response = await axios.post(`${baseUrl}/kelas/add-kelas`, kelasData);
      console.log("Respons dari API:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error saat menambah kelas:', error);
      throw error;
    }
  };

// Fungsi untuk mengedit Kelas baru
export const updateKelas = async (id: string, updatedData: Partial<Kelas>): Promise<Kelas> => {
  try {
    console.log(`Updating data at: ${baseUrl}/kelas/edit-kelas/${id}`);
    console.log('Data to be updated:', updatedData);
    const response = await axios.put(`${baseUrl}/kelas/edit-kelas/${id}`, updatedData);
    return response.data as Kelas;
  } catch (error) {
    console.error('Error updating Kelas:', error);
    throw error;
  }
};

export const deleteKelas = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${baseUrl}/kelas/hapus-kelas/${id}`);
    console.log('Kelas berhasil dihapus');
  } catch (error) {
    console.error('Error deleting Kelas:', error);
    throw error;
  }
};