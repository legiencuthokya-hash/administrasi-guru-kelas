import React, { useState } from 'react';
import { JurnalMengajar, SchoolSettings, User } from '../../types';
import { PrintWrapper } from './PrintWrapper';
import { exportJurnalToExcel } from '../../services/excelExport';

interface CetakJurnalProps {
  currentUser: User;
  settings: SchoolSettings;
  jurnalList: JurnalMengajar[];
}

export const CetakJurnal: React.FC<CetakJurnalProps> = ({
  currentUser,
  settings,
  jurnalList,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const currentMonth = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const monthLabel = monthNames[month - 1] || selectedMonth;

  // Filter journals for this month and user (if not admin)
  const filteredJurnal = jurnalList
    .filter((j) => {
      const matchesUser = isAdmin ? true : j.guruId === currentUser.id;
      const matchesMonth = selectedMonth ? j.bulan === selectedMonth : true;
      return matchesUser && matchesMonth;
    })
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const handleDownloadExcel = () => {
    exportJurnalToExcel(
      selectedMonth,
      filteredJurnal,
      settings.namaSekolah,
      isAdmin ? undefined : currentUser.nama
    );
  };

  const colCount = 7; // <= 10, default portrait

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 text-xs">
        <label className="font-semibold text-slate-700">Pilih Bulan Cetak:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800"
        />
      </div>

      <PrintWrapper
        title={`JURNAL AGENDA CATATAN MENGAJAR GURU`}
        subtitle={`BULAN: ${monthLabel.toUpperCase()} ${year} • TAHUN AJARAN: ${settings.tahunAjaranAktif}`}
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
                <th className="border border-black p-2 w-16">Kelas</th>
                <th className="border border-black p-2 w-28">Mata Pelajaran</th>
                <th className="border border-black p-2 w-36">Bab / Materi</th>
                <th className="border border-black p-2">Kegiatan Pembelajaran</th>
                <th className="border border-black p-2 w-36">Refleksi / Catatan</th>
              </tr>
            </thead>
            <tbody>
              {filteredJurnal.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="p-4 text-slate-400 text-center">
                    Tidak ada catatan jurnal mengajar pada bulan {monthLabel} {year}.
                  </td>
                </tr>
              ) : (
                filteredJurnal.map((j, idx) => (
                  <tr key={j.id} className="border-b border-black hover:bg-slate-50 text-black align-top">
                    <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                    <td className="border border-black p-1.5 text-center font-medium whitespace-nowrap">
                      {j.tanggal}
                    </td>
                    <td className="border border-black p-1.5 text-center font-bold">
                      {j.kelas}
                    </td>
                    <td className="border border-black p-1.5">{j.mapel}</td>
                    <td className="border border-black p-1.5 font-medium">{j.babMateri}</td>
                    <td className="border border-black p-1.5 leading-relaxed whitespace-pre-line">
                      {j.kegiatan}
                    </td>
                    <td className="border border-black p-1.5 italic text-slate-700">
                      {j.refleksi || '-'}
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
