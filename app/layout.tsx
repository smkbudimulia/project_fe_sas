import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClientTokenHandler from './components/ClientTokenHandler';

const poppins = Poppins({ 
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"] 
});

export const metadata: Metadata = {
  title: "Sistem Absensi",
  description: "Sistem Absensi",
  icons: {
    icon: "/favicon1.ico",
    apple: "/favicon1.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${poppins.className} bg-gray-50`}>
        <ClientTokenHandler />
        {children}
      </body>
    </html>
  );
}