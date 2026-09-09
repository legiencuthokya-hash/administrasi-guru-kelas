import React, { useState } from 'react';
import { Absensi, SchoolSettings, Siswa, User, DAFTAR_KELAS } from '../../types';
import { PrintWrapper } from './PrintWrapper';
import { exportAbsenBulananToExcel } from '../../services/excelExport';
import { isGuruMapelUmum } from '../../services/storage';

interface CetakAbsenBulananProps {
  currentUser: User;
  settings: SchoolSettings;
  siswaList: Siswa[];
  absensiList: Absensi[];
}

export const CetakAbsenBulanan: React.FC<CetakAbsenBulananProps> = ({
  currentUser,
  settings,
  siswaList,
  absensiList,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canAccessAllClasses = isAdmin || isSubjectTeacher;

  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedClass, setSelectedClass] = useState<string>(
    canAccessAllClasses ? '1A' : currentUser.tanggungJawab
  );

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const monthLabel = monthNames[month - 1] || selectedMonth;

  // Filter students
  const classStudents = siswaList.filter(
    (s) => s.kelas === selectedClass && s.status === 'Aktif'
  );

  // Filter attendance
  const monthlyRecords = absensiList.filter(
    (a) => a.bulan === selectedMonth && a.kelas === selectedClass
  );

  // Map date -> { studentId: status }
  const dateMap: Record<number, Record<string, string>> = {};
  monthlyRecords.forEach((rec) => {
    const day = parseInt(rec.tanggal.split('-')[2], 10);
    dateMap[day] = rec.records || {};
  });

  const handleDownloadExcel = () => {
    exportAbsenBulananToExcel(
      selectedMonth,
      selectedClass,
      classStudents,
      absensiList,
      settings.namaSekolah
    );
  };

  // Day columns metadata
  const daysMeta: { day: number; isWeekend: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month - 1, d);
    const isWk = dt.getDay() === 0 || dt.getDay() === 6;
    daysMeta.push({ day: d, isWeekend: isWk });
  }

  const totalCols = 3 + daysInMonth + 5; // > 10, will be landscape automatically

  return (
    <div className="space-y-4">
      {/* Filter Toolbar (Hidden on print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700">Pilih Bulan:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800"
          />
        </div>

        {canAccessAllClasses && (
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Pilih Kelas:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800"
            >
              {DAFTAR_KELAS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <PrintWrapper
        title={`DAFTAR HADIR SISWA BULAN ${monthLabel.toUpperCase()} ${year}`}
        subtitle={`KELAS: ${selectedClass} • TAHUN AJARAN: ${settings.tahunAjaranAktif}`}
        columnCount={totalCols}
        settings={settings}
        teacherUser={currentUser}
        onDownloadExcel={handleDownloadExcel}
      >
        <div className="overflow-x-auto text-[10px] font-sans">
          <table className="w-full border-collapse border border-black text-center">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black">
                <th className="border border-black p-1 w-6" rowSpan={2}>No</th>
                <th className="border border-black p-1 w-20" rowSpan={2}>NISN</th>
                <th className="border border-black p-1 text-left min-w-[140px]" rowSpan={2}>Nama Lengkap</th>
                <th className="border border-black p-1" colSpan={daysInMonth}>Tanggal</th>
                <th className="border border-black p-1" colSpan={4}>Rekap</th>
                <th className="border border-black p-1 w-8" rowSpan={2}>Jml</th>
              </tr>
              <tr className="bg-slate-50 font-bold text-[9px] border-b border-black">
                {daysMeta.map((dm) => (
                  <th
                    key={dm.day}
                    className={`border border-black p-0.5 w-5 ${
                      dm.isWeekend
                        ? 'bg-red-200 text-red-900 font-black'
                        : 'text-slate-800'
                    }`}
                  >
                    {dm.day}
                  </th>
                ))}
                <th className="border border-black p-0.5 w-5 bg-emerald-100 text-emerald-900">H</th>
                <th className="border border-black p-0.5 w-5 bg-amber-100 text-amber-900">S</th>
                <th className="border border-black p-0.5 w-5 bg-blue-100 text-blue-900">I</th>
                <th className="border border-black p-0.5 w-5 bg-rose-100 text-rose-900">A</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className="p-4 text-slate-400 text-center">
                    Tidak ada siswa di {selectedClass}.
                  </td>
                </tr>
              ) : (
                classStudents.map((siswa, idx) => {
                  let h = 0;
                  let s = 0;
                  let i = 0;
                  let a = 0;

                  return (
                    <tr key={siswa.id} className="border-b border-black hover:bg-slate-50">
                      <td className="border border-black p-0.5 text-center">{idx + 1}</td>
                      <td className="border border-black p-0.5 text-center font-mono">
                        {siswa.nisn || siswa.nis || '-'}
                      </td>
                      <td className="border border-black p-0.5 text-left font-medium px-1.5 whitespace-nowrap">
                        {siswa.nama}
                      </td>

                      {daysMeta.map((dm) => {
                        if (dm.isWeekend) {
                          return (
                            <td
                              key={dm.day}
                              className="border border-black p-0.5 bg-red-100 text-red-700 font-bold"
                            >
                              -
                            </td>
                          );
                        }
                        const val = dateMap[dm.day]?.[siswa.id] || '';
                        if (val === 'H') h++;
                        else if (val === 'S') s++;
                        else if (val === 'I') i++;
                        else if (val === 'A') a++;

                        return (
                          <td key={dm.day} className="border border-black p-0.5 font-bold">
                            {val}
                          </td>
                        );
                      })}

                      <td className="border border-black p-0.5 font-bold text-emerald-800 bg-emerald-50/50">
                        {h}
                      </td>
                      <td className="border border-black p-0.5 font-bold text-amber-800 bg-amber-50/50">
                        {s}
                      </td>
                      <td className="border border-black p-0.5 font-bold text-blue-800 bg-blue-50/50">
                        {i}
                      </td>
                      <td className="border border-black p-0.5 font-bold text-rose-800 bg-rose-50/50">
                        {a}
                      </td>
                      <td className="border border-black p-0.5 font-bold bg-slate-100">
                        {h + s + i + a}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </PrintWrapper>
    </div>
  );
};
