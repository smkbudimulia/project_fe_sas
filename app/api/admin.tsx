import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Admin = {
  id_admin: string;
  nama_admin: string;
  alamat:string;
  jenis_kelamin:string;
  no_telp:string;
  email: string;
  username?:string;
  pass?:string;
  foto?:File | null;
  status?:string;
  exists?: boolean;
  // Tambahkan properti lain yang sesuai dengan struktur data di tabel 'admin'
};

// Fungsi untuk mengambil daftar admin
export const fetchAdmins = async (): Promise<Admin[]> => {
  try {
    const res = await axios.get(`${baseUrl}/admin/all-Admin`);
    
    console.log(res)
    return res.data as Admin[];
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

// Fungsi untuk menambah Admins
export const addAdmins = async (adminData: Admin): Promise<Admin> => {
  try {
    const response = await axios.post(`${baseUrl}/admin/add-Admin`, adminData);
    console.log(response);
    return response.data as Admin;
  } catch (error) {
    console.error('Error saat menambah kelas:', error);
    throw error;
  }
};

export const updateAdmins = async (id: string, adminData: Admin): Promise<Admin> => {
  try {
    const res = await axios.put(`${baseUrl}/admin/edit-admin/${id}`, adminData);
    
    console.log(res);
    return res.data as Admin; // Mengembalikan data admin yang telah diperbarui
  } catch (error) {
    console.error('Error editing admin:', error);
    throw error; // Melempar kembali error agar bisa ditangani di tempat lain
  }
};

export const deleteAdmins = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${baseUrl}/admin/hapus-admin/${id}`);
    console.log(`Admin with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error; // Melempar kembali error agar bisa ditangani di tempat lain
  }
};


