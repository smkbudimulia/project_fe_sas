// /middleware/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  console.log('Middleware invoked for:', req.nextUrl.pathname);

  const token = req.cookies.get('token')?.value
  console.log('Token:', token);

    // Jika pengguna mencoba mengakses halaman login tapi sudah memiliki token, redirect ke halaman tujuan
    // if (req.nextUrl.pathname === '/login' && token) {
    //   console.log('Pengguna sudah memiliki token, dialihkan ke dasbor.');
    //   return NextResponse.redirect(new URL('/dash', req.url))
    // }

    // Jika tidak ada token dan pengguna mencoba mengakses halaman yang dilindungi
    // if (!token && (req.nextUrl.pathname.startsWith('/profile') || req.nextUrl.pathname.startsWith('/dash'))) {
    //   console.log('No token found, redirecting to login.');
    //   return NextResponse.redirect(new URL('/login', req.url));
    // }
  

  return NextResponse.next();
}

export const config = {
  matcher: ['/dash/:path', '/profile/:path*', '/login'],
};
