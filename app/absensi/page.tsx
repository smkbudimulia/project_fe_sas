"use client";
import React, { useState } from 'react'
import Absensi from './app';
import Navbar from "../components/navbar/page"
import Footer from "../components/footer/page"

  const Page: React.FC = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };


  return (
    <>
    <div>
    <Navbar  />
    
    {/* Main Content */}
    <main className={`px-30 transition-transform relative duration-300 z-10 ${
    isOpen ? 'ml-0 md:ml-64' : 'ml-0'
  }`}>
      <div className="flex-1 p-6">
          <div className="min-h-screen">
            <Absensi />
          </div>
      </div>
    </main>
    <Footer />
  </div>
  </>
  )
}

export default Page
