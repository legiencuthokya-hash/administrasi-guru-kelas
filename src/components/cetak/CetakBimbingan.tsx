import React, { useState } from 'react';
import { BimbinganSiswa, SchoolSettings, User } from '../../types';
import { PrintWrapper } from './PrintWrapper';
import { exportBimbinganToExcel } from '../../services/excelExport';

interface CetakBimbinganProps {
  currentUser: User;
  settings: SchoolSettings;
  bimbinganList: BimbinganSiswa[];
}

export const CetakBimbingan: React.FC<CetakBimbinganProps> = ({
  currentUser,
  settings,
  bimbinganList,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [selectedSemester, setSelectedSemester] = useState<'1' | '2'>('2');

  const filteredBimbingan = bimbinganList
    .filter((b) => {
      const matchesUser = isAdmin ? true : b.guruId === currentUser.id;
      const matchesSem = b.semester === selectedSemester;
      return matchesUser && matchesSem;
    })
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const handleDownloadExcel = () => {
    exportBimbinganToExcel(
      selectedSemester,
      settings.tahunAjaranAktif,
      filteredBimbingan,
      settings.namaSekolah
    );
  };

  const colCount = 8; // <= 10, default portrait

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 text-xs">
        <label className="font-semibold text-slate-700">Pilih Semester:</label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value as '1' | '2')}
          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800"
        >
          <option value="1">Semester 1 (Ganjil)</option>
          <option value="2">Semester 2 (Genap)</option>
        </select>
      </div>

      <PrintWrapper
        title={`BUKU CATATAN BIMBINGAN DAN KONSELING SISWA`}
        subtitle={`SEMESTER ${selectedSemester} • TAHUN AJARAN: ${settings.tahunAjaranAktif}`}
        columnCount={colCount}
        settings={settings}
        teacherUser={currentUser}
        onDownloadExcel={handleDownloadExcel}
      >
        <div className="overflow-x-auto text-xs font-sans">
          <table className="w-full border-collapse border border-black text-left">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black text-black text-center">
                <th className="border border-black p-2 w-10">No</th>
                <th className="border border-black p-2 w-24">Tanggal</th>
                <th className="border border-black p-2 w-40 text-left">Nama Siswa</th>
                <th className="border border-black p-2 w-16">Kelas</th>
                <th className="border border-black p-2">Permasalahan / Kasus</th>
                <th className="border border-black p-2">Tindakan Penanganan Guru</th>
                <th className="border border-black p-2 w-32">Hasil Bimbingan</th>
                <th className="border border-black p-2 w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBimbingan.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="p-4 text-slate-400 text-center">
                    Tidak ada catatan bimbingan siswa pada Semester {selectedSemester}.
                  </td>
                </tr>
              ) : (
                filteredBimbingan.map((b, idx) => (
                  <tr key={b.id} className="border-b border-black hover:bg-slate-50 text-black align-top">
                    <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                    <td className="border border-black p-1.5 text-center font-medium whitespace-nowrap">
                      {b.tanggal}
                    </td>
                    <td className="border border-black p-1.5 font-bold">{b.siswaNama}</td>
                    <td className="border border-black p-1.5 text-center font-semibold">
                      {b.kelas}
                    </td>
                    <td className="border border-black p-1.5 leading-relaxed">{b.permasalahan}</td>
                    <td className="border border-black p-1.5 leading-relaxed">
                      {b.penanganan || '-'}
                    </td>
                    <td className="border border-black p-1.5">{b.hasil || '-'}</td>
                    <td className="border border-black p-1.5 text-center font-bold">
                      {b.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PrintWrapper>
    </div>
  );
};
