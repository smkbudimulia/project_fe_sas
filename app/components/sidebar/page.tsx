"use client";

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../navbar/page';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [isAkademikOpen, setIsAkademikOpen] = useState(false);
  const [isSiswaOpen, setIsSiswaOpen] = useState(false);
  const [isGuruOpen, setIsGuruOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const toggleMasterData = () => {
    setIsMasterDataOpen(!isMasterDataOpen);
  };
  const toggleAkademik = () => {
    setIsAkademikOpen(!isAkademikOpen);
  };
  const toggleSiswa = () => {
    setIsSiswaOpen(!isSiswaOpen);
  };
  const toggleGuru = () => {
    setIsGuruOpen(!isGuruOpen);
  };
  const toggleAdmin = () => {
    setIsAdminOpen(!isAdminOpen);
  };

  return (
    <>
    
    
    
    </>
  );
}


