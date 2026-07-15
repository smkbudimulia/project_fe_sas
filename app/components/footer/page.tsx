"use client";

import { FOOTER_TEXT, Footer_2 } from '../../version';

export default function Footer() {
  return (
    <footer className="bg-slate-100 text-white py-6 relative shadow-md z-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">
          {FOOTER_TEXT}
        </p>
        <p className="text-xs text-gray-400 mt-1 whitespace-pre-line">
          {Footer_2}
        </p>
      </div>
    </footer>
  );
}