"use client";
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const LoginFormGuru = () => {
  const [email, setEmail] = useState('');
  const [pas, setPas] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseUrl}/api/login-guru`, {
        email,
        pas
      });
      console.log('Full Response:', response);
      console.log('Token:', response.data.token);
      console.log('Nama Guru:', response.data.nama_guru);
      
      if (response.status === 200) {
        // Menyimpan token ke dalam cookie dengan waktu kadaluarsa 5 menit
        const expireDate = new Date();
        expireDate.setTime(expireDate.getTime() + (60 * 60 * 1000)); // 5 menit dalam milidetik
        Cookies.set('token', response.data.token, { expires: expireDate });
        Cookies.set('nama_guru', response.data.data.nama_guru, { expires: expireDate });
        Cookies.set('walas', response.data.data.walas, { expires: expireDate });
        Cookies.set('id_guru', response.data.data.id_guru, { expires: expireDate });
        
        // Redirect ke halaman dashboard guru
        window.location.href = '../';
      }
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response) {
          console.error('Respons error:', axiosError.response);
          if (axiosError.response.status === 401) {
            setErrorMessage('Email atau password salah.');
          } else {
            setErrorMessage('Terjadi kesalahan pada server.');
          }
        }
      } else {
        console.error('Kesalahan tanpa respons:', error);
        setErrorMessage('Tidak dapat menghubungi server.');
      }
    }
  }

  return (
    <main className="bg-pageBg bg-cover bg-center bg-no-repeat min-h-screen">
      <div className="flex justify-center items-center w-full min-h-screen bg-black bg-opacity-15">
        <aside className="bg-white w-full max-w-md rounded-xl bg-opacity-20 shadow-lg shadow-black mx-4 sm:mx-8 md:mt-16 lg:mt-24">
          <h1 className="text-center text-black font-light text-4xl bg-teal-400 rounded-t-xl p-4 font-times">Login Guru</h1>
          <form className="flex flex-col p-6 space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="py-2 px-3 w-full text-black text-lg font-light outline-none rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              name="pas"
              placeholder="Password"
              className="py-2 px-3 w-full text-black text-lg font-light outline-none rounded-md"
              value={pas}
              onChange={(e) => setPas(e.target.value)}
            />
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            <div className="flex justify-between items-center mt-5">
              <Link href="" className="text-zinc-500 transition hover:text-black">
                Belum Mendaftar?
              </Link>
              <button
                type="submit"
                className="bg-black text-teal-400 font-medium py-2 px-6 transition hover:text-white rounded-md"
              >
                Login
              </button>
            </div>
          </form>
        </aside>
      </div>
    </main>
  )
}

export default LoginFormGuru;
