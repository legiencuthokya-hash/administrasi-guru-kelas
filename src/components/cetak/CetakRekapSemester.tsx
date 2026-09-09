import React, { useState } from 'react';
import { Absensi, SchoolSettings, Siswa, User, DAFTAR_KELAS } from '../../types';
import { PrintWrapper } from './PrintWrapper';
import { exportRekapSemesterToExcel } from '../../services/excelExport';
import { isGuruMapelUmum } from '../../services/storage';

interface CetakRekapSemesterProps {
  currentUser: User;
  settings: SchoolSettings;
  siswaList: Siswa[];
  absensiList: Absensi[];
}

export const CetakRekapSemester: React.FC<CetakRekapSemesterProps> = ({
  currentUser,
  settings,
  siswaList,
  absensiList,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canAccessAllClasses = isAdmin || isSubjectTeacher;

  const [selectedSemester, setSelectedSemester] = useState<'1' | '2'>('2');
  const [selectedClass, setSelectedClass] = useState<string>(
    canAccessAllClasses ? '1A' : currentUser.tanggungJawab
  );

  const classStudents = siswaList.filter(
    (s) => s.kelas === selectedClass && s.status === 'Aktif'
  );

  const semesterAbsensi = absensiList.filter(
    (a) => a.semester === selectedSemester && a.kelas === selectedClass
  );

  const handleDownloadExcel = () => {
    exportRekapSemesterToExcel(
      selectedSemester,
      settings.tahunAjaranAktif,
      selectedClass,
      classStudents,
      absensiList,
      settings.namaSekolah
    );
  };

  const colCount = 9; // <= 10, will be portrait automatically

  return (
    <div className="space-y-4">
      {/* Filter Toolbar (No-Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
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
        title={`REKAPITULASI KEHADIRAN SISWA SEMESTER ${selectedSemester}`}
        subtitle={`KELAS: ${selectedClass} • TAHUN AJARAN: ${settings.tahunAjaranAktif}`}
        columnCount={colCount}
        settings={settings}
        teacherUser={currentUser}
        onDownloadExcel={handleDownloadExcel}
      >
        <div className="overflow-x-auto text-xs font-sans">
          <table className="w-full border-collapse border border-black text-center">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black text-black">
                <th className="border border-black p-2 w-10">No</th>
                <th className="border border-black p-2 w-28">NISN / NIS</th>
                <th className="border border-black p-2 text-left">Nama Siswa</th>
                <th className="border border-black p-2 w-16 bg-emerald-50 text-emerald-900">Hadir</th>
                <th className="border border-black p-2 w-16 bg-amber-50 text-amber-900">Sakit</th>
                <th className="border border-black p-2 w-16 bg-blue-50 text-blue-900">Izin</th>
                <th className="border border-black p-2 w-16 bg-rose-50 text-rose-900">Alpa</th>
                <th className="border border-black p-2 w-20">Total Hari</th>
                <th className="border border-black p-2 w-20">% Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="p-4 text-slate-400 text-center">
                    Tidak ada siswa aktif di {selectedClass}.
                  </td>
                </tr>
              ) : (
                classStudents.map((siswa, idx) => {
                  let h = 0;
                  let s = 0;
                  let i = 0;
                  let a = 0;

                  semesterAbsensi.forEach((rec) => {
                    const val = rec.records[siswa.id];
                    if (val === 'H') h++;
                    else if (val === 'S') s++;
                    else if (val === 'I') i++;
                    else if (val === 'A') a++;
                  });

                  const total = h + s + i + a;
                  const pct = total > 0 ? ((h / total) * 100).toFixed(1) + '%' : '0%';

                  return (
                    <tr key={siswa.id} className="border-b border-black hover:bg-slate-50 text-black">
                      <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-black p-1.5 text-center font-mono text-[11px]">
                        {siswa.nisn || siswa.nis || '-'}
                      </td>
                      <td className="border border-black p-1.5 text-left font-semibold px-2">
                        {siswa.nama}
                      </td>
                      <td className="border border-black p-1.5 font-bold text-emerald-800 bg-emerald-50/40">
                        {h}
                      </td>
                      <td className="border border-black p-1.5 font-bold text-amber-800 bg-amber-50/40">
                        {s}
                      </td>
                      <td className="border border-black p-1.5 font-bold text-blue-800 bg-blue-50/40">
                        {i}
                      </td>
                      <td className="border border-black p-1.5 font-bold text-rose-800 bg-rose-50/40">
                        {a}
                      </td>
                      <td className="border border-black p-1.5 font-bold bg-slate-50">
                        {total}
                      </td>
                      <td className="border border-black p-1.5 font-bold text-blue-900">
                        {pct}
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
