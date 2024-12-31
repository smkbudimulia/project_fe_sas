import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const useUserInfo = () => {
  const [namaAdmin, setNamaAdmin] = useState('');
  const [status, setStatus] = useState('');
  const [idAdmin, setIdAdmin] = useState('');

  useEffect(() => {
    const storedNamaAdmin = Cookies.get('nama_admin');
    const storedStatus = Cookies.get('status');
    const storedIdAdmin = Cookies.get('id_admin');
    
    if (storedNamaAdmin) {
      setNamaAdmin(storedNamaAdmin);
    }
    if (storedStatus) {
      setStatus(storedStatus);
    }
    if (storedIdAdmin) {
      setIdAdmin(storedIdAdmin);
    }
  }, []);

  return { namaAdmin, status, idAdmin };
};

export default useUserInfo;
