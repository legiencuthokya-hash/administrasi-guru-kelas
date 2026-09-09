import React, { useState, useEffect } from 'react';
import { Nilai, Siswa, User, DAFTAR_KELAS } from '../types';
import { isGuruMapelUmum } from '../services/storage';
import { Award, Plus, Trash2, Save, Check } from 'lucide-react';

interface NilaiProps {
  currentUser: User;
  siswaList: Siswa[];
  nilaiList: Nilai[];
  onSaveNilai: (updated: Nilai[]) => void;
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

interface BabItem {
  id: string;
  nama: string;
}

export const NilaiComponent: React.FC<NilaiProps> = ({
  currentUser,
  siswaList,
  nilaiList,
  onSaveNilai,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canAccessAllClasses = isAdmin || isSubjectTeacher;

  // Selected filters
  const [selectedClass, setSelectedClass] = useState<string>(
    canAccessAllClasses ? '1A' : currentUser.tanggungJawab
  );

  const initialMapel = isSubjectTeacher
    ? currentUser.tanggungJawab
    : 'Bahasa Indonesia';
  const [selectedMapel, setSelectedMapel] = useState<string>(initialMapel);
  const [selectedSemester, setSelectedSemester] = useState<'1' | '2'>('2');

  // Dynamic chapters state: Bab 1, Bab 2, Bab 3...
  const [babList, setBabList] = useState<BabItem[]>([
    { id: 'bab1', nama: 'Bab 1' },
    { id: 'bab2', nama: 'Bab 2' },
    { id: 'bab3', nama: 'Bab 3' },
  ]);

  // Scores map: studentId -> { babId: score }
  const [scoresMap, setScoresMap] = useState<Record<string, Record<string, number>>>({});
  const [isSaved, setIsSaved] = useState(false);

  const classStudents = siswaList.filter((s) => s.kelas === selectedClass && s.status === 'Aktif');

  // Load existing grades when class, mapel, or semester changes
  useEffect(() => {
    const existingGrades = nilaiList.filter(
      (n) =>
        n.kelas === selectedClass &&
        n.mapel === selectedMapel &&
        n.semester === selectedSemester
    );

    const newScores: Record<string, Record<string, number>> = {};
    const foundBabIds = new Set<string>();

    existingGrades.forEach((g) => {
      newScores[g.siswaId] = { ...(g.babScores || {}) };
      Object.keys(g.babScores || {}).forEach((k) => foundBabIds.add(k));
    });

    if (foundBabIds.size > 0) {
      // Sync bab list if stored data has more chapters
      const updatedBabs = Array.from(foundBabIds).map((id, i) => ({
        id,
        nama: `Bab ${i + 1}`,
      }));
      setBabList(updatedBabs);
    }

    setScoresMap(newScores);
    setIsSaved(false);
  }, [selectedClass, selectedMapel, selectedSemester, nilaiList]);

  const handleScoreChange = (studentId: string, babId: string, value: string) => {
    const num = value === '' ? ('' as any) : Math.min(100, Math.max(0, Number(value)));
    setScoresMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [babId]: num,
      },
    }));
    setIsSaved(false);
  };

  const handleAddBab = () => {
    const nextIndex = babList.length + 1;
    const newBabId = `bab${Date.now()}`;
    setBabList([...babList, { id: newBabId, nama: `Bab ${nextIndex}` }]);
  };

  const handleRemoveBab = (babId: string) => {
    if (babList.length <= 1) {
      alert('Minimal harus memiliki 1 Bab penilaian.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus kolom Bab ini?')) {
      setBabList(babList.filter((b) => b.id !== babId));
      // Remove score entries for this bab
      const nextScores = { ...scoresMap };
      Object.keys(nextScores).forEach((sId) => {
        if (nextScores[sId]) {
          delete nextScores[sId][babId];
        }
      });
      setScoresMap(nextScores);
      setIsSaved(false);
    }
  };

  const handleSaveAll = () => {
    // Merge into nilaiList
    const otherGrades = nilaiList.filter(
      (n) =>
        !(
          n.kelas === selectedClass &&
          n.mapel === selectedMapel &&
          n.semester === selectedSemester
        )
    );

    const newEntries: Nilai[] = classStudents.map((siswa) => {
      const existing = nilaiList.find(
        (n) =>
          n.siswaId === siswa.id &&
          n.kelas === selectedClass &&
          n.mapel === selectedMapel &&
          n.semester === selectedSemester
      );

      return {
        id: existing ? existing.id : `nilai-${siswa.id}-${Date.now()}`,
        siswaId: siswa.id,
        kelas: selectedClass,
        mapel: selectedMapel,
        guruId: currentUser.id,
        semester: selectedSemester,
        tahunAjaran: '2025/2026',
        babScores: scoresMap[siswa.id] || {},
        updatedAt: new Date().toISOString(),
      };
    });

    onSaveNilai([...otherGrades, ...newEntries]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Penilaian Harian Tiap Bab</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Format penilaian murni per bab tanpa kolom predikat dan tanpa catatan capaian kompetensi.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="btn-tambah-bab"
            onClick={handleAddBab}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4 text-purple-600" />
            <span>Tambah Bab</span>
          </button>

          <button
            id="btn-simpan-nilai"
            onClick={handleSaveAll}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Nilai Tersimpan!' : 'Simpan Semua Nilai'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Kelas
          </label>
          <select
            value={selectedClass}
            disabled={!canAccessAllClasses}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold disabled:bg-slate-100"
          >
            {DAFTAR_KELAS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Mata Pelajaran
          </label>
          <select
            value={selectedMapel}
            onChange={(e) => setSelectedMapel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
          >
            {DEFAULT_MAPEL.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Semester
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value as '1' | '2')}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
          >
            <option value="1">Semester 1 (Ganjil)</option>
            <option value="2">Semester 2 (Genap)</option>
          </select>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[180px]">Nama Siswa</th>
                {babList.map((bab) => (
                  <th key={bab.id} className="py-3 px-2 text-center min-w-[90px]">
                    <div className="flex items-center justify-center gap-1">
                      <span>{bab.nama}</span>
                      {babList.length > 1 && (
                        <button
                          onClick={() => handleRemoveBab(bab.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title={`Hapus ${bab.nama}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center min-w-[90px] bg-purple-50 text-purple-900 font-bold">
                  Rata-rata
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={3 + babList.length}
                    className="py-10 text-center text-slate-400"
                  >
                    Tidak ada siswa aktif di {selectedClass}.
                  </td>
                </tr>
              ) : (
                classStudents.map((siswa, idx) => {
                  const studentScores = scoresMap[siswa.id] || {};
                  let total = 0;
                  let count = 0;

                  babList.forEach((bab) => {
                    const sc = studentScores[bab.id];
                    if (sc !== undefined && sc !== null && (sc as any) !== '') {
                      total += Number(sc);
                      count++;
                    }
                  });

                  const average = count > 0 ? (total / count).toFixed(1) : '-';

                  return (
                    <tr key={siswa.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-4 text-center text-slate-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{siswa.nama}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          NISN: {siswa.nisn || '-'}
                        </div>
                      </td>

                      {babList.map((bab) => {
                        const val =
                          studentScores[bab.id] !== undefined
                            ? studentScores[bab.id]
                            : '';

                        return (
                          <td key={bab.id} className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={val}
                              onChange={(e) =>
                                handleScoreChange(siswa.id, bab.id, e.target.value)
                              }
                              placeholder="0-100"
                              className="w-16 text-center border border-slate-300 rounded-lg py-1 px-1 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                            />
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-4 text-center font-bold text-purple-700 bg-purple-50/50">
                        {average}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
