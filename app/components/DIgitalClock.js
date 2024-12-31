import { useEffect, useState } from "react";

export default function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to get the day name
  const getDayName = (dayIndex) => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu"
    ];
    return days[dayIndex];
  };

  // Function to get the month name
  const getMonthName = (monthIndex) => {
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
      "Desember"
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
