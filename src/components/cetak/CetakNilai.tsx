import React, { useState } from 'react';
import { Nilai, SchoolSettings, Siswa, User, DAFTAR_KELAS } from '../../types';
import { PrintWrapper } from './PrintWrapper';
import { exportNilaiToExcel } from '../../services/excelExport';
import { isGuruMapelUmum } from '../../services/storage';

interface CetakNilaiProps {
  currentUser: User;
  settings: SchoolSettings;
  siswaList: Siswa[];
  nilaiList: Nilai[];
}

const DEFAULT_MAPEL = [
  'Bahasa Indonesia',
  'Matematika',
  'IPAS',
  'Pendidikan Pancasila',
  'Pendidikan Agama Islam',
  'PJOK',
  'Seni Rupa',
  'Seni Musik',
  'Bahasa Jawa',
  'Bahasa Inggris',
];

export const CetakNilai: React.FC<CetakNilaiProps> = ({
  currentUser,
  settings,
  siswaList,
  nilaiList,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canAccessAllClasses = isAdmin || isSubjectTeacher;

  const [selectedClass, setSelectedClass] = useState<string>(
    canAccessAllClasses ? '1A' : currentUser.tanggungJawab
  );
  const initialMapel = isSubjectTeacher ? currentUser.tanggungJawab : 'Bahasa Indonesia';
  const [selectedMapel, setSelectedMapel] = useState<string>(initialMapel);
  const [selectedSemester, setSelectedSemester] = useState<'1' | '2'>('2');

  const classStudents = siswaList.filter(
    (s) => s.kelas === selectedClass && s.status === 'Aktif'
  );

  // Extract all existing chapters from recorded grades for this mapel & class
  const classGrades = nilaiList.filter(
    (n) =>
      n.kelas === selectedClass &&
      n.mapel === selectedMapel &&
      n.semester === selectedSemester
  );

  const gradeMap: Record<string, Record<string, number>> = {};
  const foundBabIds = new Set<string>();

  classGrades.forEach((g) => {
    gradeMap[g.siswaId] = g.babScores || {};
    Object.keys(g.babScores || {}).forEach((k) => foundBabIds.add(k));
  });

  const babList =
    foundBabIds.size > 0
      ? Array.from(foundBabIds).map((id, idx) => ({ id, nama: `Bab ${idx + 1}` }))
      : [
          { id: 'bab1', nama: 'Bab 1' },
          { id: 'bab2', nama: 'Bab 2' },
          { id: 'bab3', nama: 'Bab 3' },
        ];

  const handleDownloadExcel = () => {
    exportNilaiToExcel(
      selectedClass,
      selectedMapel,
      selectedSemester,
      settings.tahunAjaranAktif,
      classStudents,
      nilaiList,
      babList,
      settings.namaSekolah
    );
  };

  const totalCols = 3 + babList.length + 1;

  return (
    <div className="space-y-4">
      {/* Filter Toolbar (No-Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
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

        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700">Mata Pelajaran:</label>
          <select
            value={selectedMapel}
            onChange={(e) => setSelectedMapel(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800"
          >
            {DEFAULT_MAPEL.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700">Semester:</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value as '1' | '2')}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800"
          >
            <option value="1">Semester 1 (Ganjil)</option>
            <option value="2">Semester 2 (Genap)</option>
          </select>
        </div>
      </div>

      <PrintWrapper
        title={`DAFTAR NILAI HARIAN PESERTA DIDIK`}
        subtitle={`MATA PELAJARAN: ${selectedMapel.toUpperCase()} • KELAS: ${selectedClass} • SEMESTER ${selectedSemester} (${settings.tahunAjaranAktif})`}
        columnCount={totalCols}
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
                {babList.map((b) => (
                  <th key={b.id} className="border border-black p-2 w-16">
                    {b.nama}
                  </th>
                ))}
                <th className="border border-black p-2 w-20 bg-slate-200 text-black font-bold">
                  Rata-rata
                </th>
              </tr>
            </thead>
            <tbody>
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className="p-4 text-slate-400 text-center">
                    Tidak ada siswa aktif di {selectedClass}.
                  </td>
                </tr>
              ) : (
                classStudents.map((siswa, idx) => {
                  const studentScores = gradeMap[siswa.id] || {};
                  let total = 0;
                  let count = 0;

                  babList.forEach((bab) => {
                    const sc = studentScores[bab.id];
                    if (sc !== undefined && sc !== null && (sc as any) !== '') {
                      total += Number(sc);
                      count++;
                    }
                  });

                  const avg = count > 0 ? (total / count).toFixed(1) : '-';

                  return (
                    <tr key={siswa.id} className="border-b border-black hover:bg-slate-50 text-black">
                      <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-black p-1.5 text-center font-mono text-[11px]">
                        {siswa.nisn || siswa.nis || '-'}
                      </td>
                      <td className="border border-black p-1.5 text-left font-semibold px-2">
                        {siswa.nama}
                      </td>

                      {babList.map((bab) => {
                        const val = studentScores[bab.id];
                        return (
                          <td key={bab.id} className="border border-black p-1.5 font-bold">
                            {val !== undefined && val !== null && (val as any) !== ''
                              ? val
                              : '-'}
                          </td>
                        );
                      })}

                      <td className="border border-black p-1.5 font-bold bg-slate-100">
                        {avg}
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
