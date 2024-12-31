"use client";
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseUrl}/api/login`, {
        username,
        password
      });
      console.log('Full Response:', response);  // Log seluruh respons
    console.log('Token:', response.data.token);  // Pastikan token ada
    console.log('Nama Admin:', response.data.nama_admin);  // Pastikan nama admin ada
    
      if (response.status === 200) {
        // Menyimpan token ke dalam cookie dengan waktu kadaluarsa 5 menit
        const expireDate = new Date();
        expireDate.setTime(expireDate.getTime() + (30 * 60 * 1000)); // 5 menit dalam milidetik
        Cookies.set('token', response.data.token, { expires: expireDate });
        Cookies.set('nama_admin', response.data.data.nama_admin, { expires: expireDate });
        Cookies.set('status', response.data.data.status, { expires: expireDate });
        Cookies.set('id_admin', response.data.data.id_admin, { expires: expireDate });
        window.location.href = '../dash';
      }
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        // Pastikan error adalah instance Error dan memiliki properti `response`
        const axiosError = error as { response: { status: number } }; // Casting dengan lebih aman
        if (axiosError.response) {
          console.error('Respons error:', axiosError.response);
          if (axiosError.response.status === 401) {
            setErrorMessage('Username atau password salah.');
          } else {
            setErrorMessage('Terjadi kesalahan pada server.');
          }
        }
      } else {
        // Tangani error yang bukan dari Axios (misalnya, error biasa atau jaringan)
        console.error('Kesalahan tanpa respons:', error);
        setErrorMessage('Tidak dapat menghubungi server.');
      }
    // catch (error) {
    //     if (error.response) {
    //       console.error('Respons error:', error.response);
    //       if (error.response.status === 401) {
    //         setErrorMessage('Username atau password salah.');
    //       } else {
    //         setErrorMessage('Terjadi kesalahan pada server.');
    //       }
    //     } else {
    //       console.error('Kesalahan tanpa respons:', error);
    //       setErrorMessage('Tidak dapat menghubungi server.');
    //     }
    //   }
    }
  }
  return (
    <main className="bg-pageBg bg-cover bg-center bg-no-repeat min-h-screen">
      <div className="flex justify-center items-center w-full min-h-screen bg-black bg-opacity-15">
        <aside className="bg-white w-full max-w-md rounded-xl bg-opacity-20 shadow-lg shadow-black mx-4 sm:mx-8 md:mt-16 lg:mt-24">
          <h1 className="text-center text-black font-light text-4xl bg-teal-400 rounded-t-xl p-4 font-times">Login</h1>
          <form className="flex flex-col p-6 space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="py-2 px-3 w-full text-black text-lg font-light outline-none rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="py-2 px-3 w-full text-black text-lg font-light outline-none rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

export default LoginForm;
