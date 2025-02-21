// /middleware/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  console.log("Middleware invoked for:", req.nextUrl.pathname);

  const token = req.cookies.get("token")?.value;
  const status = req.cookies.get("status")?.value;
  console.log("Token:", token, "Status:", status);

  // // Jika token tidak ada atau sudah kedaluwarsa, redirect ke login
  // if (!token) {
  //   console.log("Token expired or not found, redirecting to login.");
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }

  // Jika pengguna mencoba mengakses halaman login tapi sudah memiliki token, redirect ke halaman tujuan
  if (req.nextUrl.pathname === "/login" && token) {
    console.log("Pengguna sudah memiliki token, dialihkan ke dasbor.");
    return NextResponse.redirect(new URL("/dash", req.url));
  }

  // Jika tidak ada token dan pengguna mencoba mengakses halaman yang dilindungi
  if (!token) {
    const protectedRoutes = [
      "/dash",
      "/profile",
      "/absensi",
      "/naik_kelas",
      "/administrator",
      "/master_data",
      "/setting"
    ];
    if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
      console.log("No token found, redirecting to login.");
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Batasi akses berdasarkan status
  if (status === "Guru") {
    const allowedRoutesForGuru = ["/dash", "/absensi"];
    if (
      !allowedRoutesForGuru.some((route) =>
        req.nextUrl.pathname.startsWith(route)
      )
    ) {
      console.log("Akses ditolak untuk guru ke halaman:", req.nextUrl.pathname);
      return NextResponse.redirect(new URL("/dash", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dash/:path",
    "/profile/:path*",
    "/login",
    "/absensi/:path*",
    "/naik_kelas/:path*",
    "/administrator/:path*",
    "/master_data/:path*",
    "/setting/:path*",
  ],
};
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//   console.log("Middleware invoked for:", req.nextUrl.pathname);

//   const cookieHeader = req.headers.get("cookie");
//   console.log("Cookies Header:", cookieHeader);

//   const token = cookieHeader
//     ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
//     : null;
//   const status = cookieHeader
//     ? cookieHeader.split("; ").find((c) => c.startsWith("status="))?.split("=")[1]
//     : null;

//   console.log("Token:", token);
//   console.log("Status:", status);

//   if (req.nextUrl.pathname === "/login" && token) {
//     return NextResponse.redirect(new URL("/dash", req.url));
//   }

//   if (
//     !token &&
//     ["/dash", "/profile", "/absensi", "/naik_kelas", "/administrator", "/master_data", "/setting"].some((path) =>
//       req.nextUrl.pathname.startsWith(path)
//     )
//   ) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dash/:path*",
//     "/profile/:path*",
//     "/login",
//     "/absensi/:path*",
//     "/naik_kelas/:path*",
//     "/administrator/:path*",
//     "/master_data/:path*",
//     "/setting/:path*"
//   ],
// };
