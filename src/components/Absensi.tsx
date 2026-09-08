import React, { useState, useEffect } from 'react';
import { Absensi, Siswa, StatusKehadiran, User, DAFTAR_KELAS } from '../types';
import { isGuruMapelUmum } from '../services/storage';
import { CalendarCheck, Save, CheckCheck, AlertCircle, Ban, Users } from 'lucide-react';

interface AbsensiProps {
  currentUser: User;
  siswaList: Siswa[];
  absensiList: Absensi[];
  onSaveAbsensi: (updated: Absensi[]) => void;
}

export const AbsensiComponent: React.FC<AbsensiProps> = ({
  currentUser,
  siswaList,
  absensiList,
  onSaveAbsensi,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canAccessAllClasses = isAdmin || isSubjectTeacher;

  // Selected date
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  // Selected class
  const [selectedClass, setSelectedClass] = useState<string>(
    canAccessAllClasses ? 'Kelas 1' : currentUser.tanggungJawab
  );

  // Check if Saturday or Sunday
  const dateObj = new Date(selectedDate);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Students in selected class
  const classStudents = siswaList.filter((s) => s.kelas === selectedClass && s.status === 'Aktif');

  // Attendance records state for selected date: studentId -> 'H' | 'S' | 'I' | 'A'
  const [records, setRecords] = useState<Record<string, StatusKehadiran>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Load existing records when date or class changes
  useEffect(() => {
    const existing = absensiList.find(
      (a) => a.tanggal === selectedDate && a.kelas === selectedClass
    );
    if (existing) {
      setRecords(existing.records);
    } else {
      // Default all to 'H'
      const init: Record<string, StatusKehadiran> = {};
      classStudents.forEach((s) => {
        init[s.id] = 'H';
      });
      setRecords(init);
    }
    setIsSaved(false);
  }, [selectedDate, selectedClass, absensiList, classStudents.length]);

  const handleStatusChange = (studentId: string, status: StatusKehadiran) => {
    if (isWeekend) return;
    setRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setIsSaved(false);
  };

  const handleMarkAllHadir = () => {
    if (isWeekend) return;
    const next: Record<string, StatusKehadiran> = {};
    classStudents.forEach((s) => {
      next[s.id] = 'H';
    });
    setRecords(next);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (isWeekend) {
      alert('Tidak dapat menyimpan absensi pada hari libur (Sabtu/Minggu).');
      return;
    }

    const monthStr = selectedDate.substring(0, 7); // YYYY-MM
    const currentMonthNum = parseInt(selectedDate.split('-')[1], 10);
    // Academic semester: Jul-Dec = Sem 1, Jan-Jun = Sem 2
    const semester = currentMonthNum >= 7 ? '1' : '2';

    const existingIndex = absensiList.findIndex(
      (a) => a.tanggal === selectedDate && a.kelas === selectedClass
    );

    const newRecord: Absensi = {
      id: existingIndex >= 0 ? absensiList[existingIndex].id : `absen-${Date.now()}`,
      tanggal: selectedDate,
      bulan: monthStr,
      semester,
      tahunAjaran: '2025/2026',
      kelas: selectedClass,
      guruId: currentUser.id,
      records,
      updatedAt: new Date().toISOString(),
    };

    let updated: Absensi[];
    if (existingIndex >= 0) {
      updated = [...absensiList];
      updated[existingIndex] = newRecord;
    } else {
      updated = [...absensiList, newRecord];
    }

    onSaveAbsensi(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Stats for this day
  let hCount = 0;
  let sCount = 0;
  let iCount = 0;
  let aCount = 0;
  classStudents.forEach((s) => {
    const st = records[s.id] || 'H';
    if (st === 'H') hCount++;
    else if (st === 'S') sCount++;
    else if (st === 'I') iCount++;
    else if (st === 'A') aCount++;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <span>Pengisian Daftar Hadir (Absensi Harian)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hari Sabtu dan Minggu otomatis diliburkan sesuai ketentuan kalender sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isWeekend && (
            <button
              onClick={handleMarkAllHadir}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition"
              title="Tandai semua siswa hadir"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Semua Hadir</span>
            </button>
          )}

          <button
            id="btn-simpan-absen"
            onClick={handleSave}
            disabled={isWeekend}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition ${
              isWeekend
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Tersimpan!' : 'Simpan Absensi'}</span>
          </button>
        </div>
      </div>

      {/* Date & Class Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Pilih Tanggal Absensi
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Kelas
          </label>
          <select
            value={selectedClass}
            disabled={!canAccessAllClasses}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold disabled:bg-slate-100"
          >
            {DAFTAR_KELAS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 justify-around text-center">
          <div>
            <div className="text-[10px] text-slate-500 font-bold">HADIR (H)</div>
            <div className="text-base font-black text-emerald-600">{hCount}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold">SAKIT (S)</div>
            <div className="text-base font-black text-amber-600">{sCount}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold">IZIN (I)</div>
            <div className="text-base font-black text-blue-600">{iCount}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold">ALPA (A)</div>
            <div className="text-base font-black text-rose-600">{aCount}</div>
          </div>
        </div>
      </div>

      {/* Weekend Holiday Banner */}
      {isWeekend && (
        <div className="flex items-center gap-3 bg-red-50 border-2 border-red-300 text-red-800 p-4 rounded-2xl text-xs font-semibold">
          <Ban className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <div className="text-sm font-bold text-red-900">
              HARI LIBUR: {dayOfWeek === 0 ? 'MINGGU' : 'SABTU'}
            </div>
            <div className="text-xs text-red-700 mt-0.5">
              Sesuai aturan sekolah, hari Sabtu dan Minggu tidak ada kegiatan belajar mengajar dan daftar hadir tidak dapat diisi. Silakan pilih hari Senin s/d Jumat.
            </div>
          </div>
        </div>
      )}

      {/* Students Attendance List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    Tidak ada siswa aktif di {selectedClass}.
                  </td>
                </tr>
              ) : (
                classStudents.map((siswa, idx) => {
                  const currentStatus = records[siswa.id] || 'H';
                  return (
                    <tr key={siswa.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-center text-slate-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{siswa.nama}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NISN: {siswa.nisn || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-600">
                        {siswa.jenisKelamin}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          {(['H', 'S', 'I', 'A'] as StatusKehadiran[]).map((st) => {
                            const isSelected = currentStatus === st;
                            let activeClass = '';
                            if (st === 'H')
                              activeClass = isSelected
                                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                : 'text-slate-600 hover:bg-emerald-50';
                            else if (st === 'S')
                              activeClass = isSelected
                                ? 'bg-amber-500 text-white font-bold shadow-xs'
                                : 'text-slate-600 hover:bg-amber-50';
                            else if (st === 'I')
                              activeClass = isSelected
                                ? 'bg-blue-600 text-white font-bold shadow-xs'
                                : 'text-slate-600 hover:bg-blue-50';
                            else if (st === 'A')
                              activeClass = isSelected
                                ? 'bg-rose-600 text-white font-bold shadow-xs'
                                : 'text-slate-600 hover:bg-rose-50';

                            return (
                              <button
                                key={st}
                                type="button"
                                disabled={isWeekend}
                                onClick={() => handleStatusChange(siswa.id, st)}
                                className={`w-9 h-8 sm:w-11 sm:h-8 rounded-xl text-xs font-semibold border border-slate-200 transition ${activeClass} ${
                                  isWeekend ? 'opacity-40 cursor-not-allowed' : ''
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
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
