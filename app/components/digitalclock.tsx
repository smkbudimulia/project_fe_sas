import { useEffect, useState } from "react";

function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Membersihkan interval saat komponen di-unmount
    return () => clearInterval(interval);
  }, []);

  // Jika waktu belum diatur (saat SSR), tampilkan "Loading..."
  if (!time) {
    return <div className="text-2xl font-bold text-gray-800">Loading...</div>;
  }

  const getDayName = (dayIndex: number): string => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[dayIndex];
  };

  const getMonthName = (monthIndex: number): string => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return months[monthIndex];
  };

  const dayName = getDayName(time.getDay());
  const date = time.getDate();
  const monthName = getMonthName(time.getMonth());
  const year = time.getFullYear();

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  return (
    <div>
      <div className="text-2xl font-bold text-gray-800">
        {dayName}, {date} {monthName} {year}
      </div>
      <div className="text-7xl font-bold text-gray-800">
        {hours}:{minutes}:{seconds}
      </div>
    </div>
  );
}

export default DigitalClock;
