import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from './components/footer/page';
import Navbar from './components/navbar/page';
import Sidebar from './components/sidebar/page';
import ClientTokenHandler from './components/ClientTokenHandler';

const poppins = Poppins({ weight: ["300", "400", "400"], subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Nextjs Authentication",
//   description: "Nextjs Authentication",
// };

export const metadata: Metadata = {
  title: "Sistem Absensi",
  description: "Sistem Absensi",
  icons: {
    icon: {
      rel: "icon",
      url: "/favicon1.ico",
    },
    apple: {
      rel: "apple-touch-icon",
      url: "/favicon1.ico",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body className={poppins.className}>
      <ClientTokenHandler />
      {children}
     
        </body>
        
    </html>
  );
}