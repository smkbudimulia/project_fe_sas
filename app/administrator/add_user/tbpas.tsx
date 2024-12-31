import React from 'react';
interface TbpasProps {
  confirmedPassword: string; // Mendefinisikan tipe confirmedPassword sebagai string
}
const Tbpas: React.FC<TbpasProps> = ({ confirmedPassword }) => {
  return (
    <div>
      {confirmedPassword && (
        <div className="mt-4 p-4 border border-gray-300 rounded shadow ">
          <h2 className="text-lg font-semibold mb-4 text-black">Tabel Password</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
              <th className="border border-gray-300 px-4 py-2 text-black">Username</th>
                <th className="border border-gray-300 px-4 py-2 text-black">Password</th>
              </tr>
            </thead>
            <tbody>
              <tr>
              <td className="border border-gray-300 px-4 py-2 text-black">dg</td>
                <td className="border border-gray-300 px-4 py-2 text-black">{confirmedPassword}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tbpas;
