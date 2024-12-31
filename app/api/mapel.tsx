import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Mapel = {
  id_mapel: string | null;
  id_admin: number | string;
  nama_mapel: string; // Anda bisa menambahkan properti lain sesuai kebutuhan
};
export type MapelResponse = {
  data: Mapel; // Menambahkan tipe data respons
  exists: boolean;
};

// Fungsi untuk mengambil daftar mapel
export const fetchMapel = async (): Promise<{ data: Mapel[] }> => {
  try {
    const response = await axios.get(`${baseUrl}/mapel/all-mapel`);
    return { data: response.data }; // Bungkus data dalam objek dengan properti 'data'
  } catch (error) {
    console.error('Error fetching mapel:', error);
    throw error;
  }
};


// Fungsi untuk menambahkan mapel
export const addMapel = async (mapel: Omit<Mapel, 'id_mapel'>): Promise<MapelResponse> => {
  try {
    const response = await axios.post(`${baseUrl}/mapel/add-mapel`, mapel);
    return response.data; // Mengembalikan data mapel yang baru ditambahkan
  } catch (error) {
    console.error('Error adding mapel:', error);
    throw error;
  }
};

// Fungsi untuk mengedit mapel
export const editMapel = async (id: string, updatedMapel: Omit<Mapel, 'id'>): Promise<Mapel> => {
    try {
      const response = await axios.put(`${baseUrl}/mapel/edit-mapel/${id}`, updatedMapel);
      return response.data as Mapel; // Mengembalikan data mapel yang telah diperbarui
    } catch (error) {
      console.error('Error editing mapel:', error);
      throw error;
    }
  };
  
// Fungsi untuk menghapus mapel
export const deleteMapel = async (id: string): Promise<void> => {
    try {
      await axios.delete(`${baseUrl}/mapel/hapus-mapel/${id}`);
      // Tidak perlu mengembalikan apa-apa jika hanya menghapus
    } catch (error) {
      console.error('Error deleting mapel:', error);
      throw error;
    }
  };
  
