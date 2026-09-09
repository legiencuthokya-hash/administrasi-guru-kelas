import React, { useState } from 'react';
import {
  DAFTAR_KELAS,
  DAFTAR_HARI,
  HariSekolah,
  JadwalSlot,
  MASTER_TIME_SLOTS,
  SchoolSettings,
  User,
} from '../../types';
import { PrintWrapper } from './PrintWrapper';
import { isGuruMapelUmum } from '../../services/storage';

interface CetakJadwalProps {
  currentUser: User;
  settings: SchoolSettings;
  users: User[];
  jadwalList: JadwalSlot[];
}

export const CetakJadwal: React.FC<CetakJadwalProps> = ({
  currentUser,
  settings,
  users,
  jadwalList,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canAccessAllClasses = isAdmin || isSubjectTeacher;

  const [selectedClass, setSelectedClass] = useState<string>(
    canAccessAllClasses ? '1A' : currentUser.tanggungJawab
  );

  // Find class teacher user for signature
  const classTeacherUser =
    users.find((u) => u.tanggungJawab === selectedClass) || currentUser;

  const classSlots = jadwalList.filter((s) => s.kelas === selectedClass);

  const getSlot = (hari: HariSekolah, jp: number): JadwalSlot | undefined => {
    return classSlots.find((s) => s.hari === hari && s.jp === jp);
  };

  const handleDownloadExcel = () => {
    // Generate simple CSV export
    let csv = `JADWAL PELAJARAN KELAS ${selectedClass}\n`;
    csv += `${settings.namaSekolah}\n`;
    csv += `Tahun Ajaran: ${settings.tahunAjaranAktif} - Semester ${settings.semesterAktif}\n\n`;
    csv += `JP,Waktu,${DAFTAR_HARI.join(',')}\n`;

    MASTER_TIME_SLOTS.forEach((slot) => {
      if (slot.type === 'istirahat') {
        csv += `-,${slot.mulai} - ${slot.selesai},${slot.label},${slot.label},${slot.label},${slot.label},${slot.label}\n`;
      } else {
        const jp = slot.jp!;
        const row = [
          `JP ${jp}`,
          `${slot.mulai} - ${slot.selesai}`,
          ...DAFTAR_HARI.map((h) => {
            const s = getSlot(h, jp);
            return `"${s?.mapel || '-'}"`;
          }),
        ];
        csv += row.join(',') + '\n';
      }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jadwal_Pelajaran_Kelas_${selectedClass}_${settings.tahunAjaranAktif.replace(
      '/',
      '_'
    )}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Filters on Top */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">
            Pilih Kelas:
          </label>
          {canAccessAllClasses ? (
            <select
              id="select-cetak-kelas-jadwal"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              {DAFTAR_KELAS.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              Kelas {selectedClass}
            </span>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Format: 10 JP (35 Menit) &bull; Dimulai 07.10 WIB &bull; 3 Jeda Istirahat
        </div>
      </div>

      {/* Printable Sheet */}
      <PrintWrapper
        title={`JADWAL PELAJARAN KELAS ${selectedClass}`}
        subtitle={`TAHUN AJARAN ${settings.tahunAjaranAktif} — SEMESTER ${settings.semesterAktif}`}
        columnCount={7}
        settings={settings}
        teacherUser={classTeacherUser}
        onDownloadExcel={handleDownloadExcel}
      >
        <div className="w-full">
          <table className="w-full text-left border-collapse border border-slate-900 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold text-center border-b border-slate-900">
                <th className="py-2.5 px-2 border-r border-slate-900 w-12">
                  JP
                </th>
                <th className="py-2.5 px-2 border-r border-slate-900 w-28">
                  WAKTU
                </th>
                {DAFTAR_HARI.map((hari) => (
                  <th
                    key={hari}
                    className="py-2.5 px-2 border-r border-slate-900 last:border-r-0 text-center font-bold"
                  >
                    {hari.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MASTER_TIME_SLOTS.map((slot, idx) => {
                if (slot.type === 'istirahat') {
                  return (
                    <tr
                      key={`cetak-istirahat-${idx}`}
                      className="bg-slate-200/90 font-bold text-slate-900 text-center border-y-2 border-slate-900"
                    >
                      <td className="py-1.5 px-2 border-r border-slate-900 font-mono text-[10px]">
                        -
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-900 font-mono text-[10px]">
                        {slot.mulai} - {slot.selesai}
                      </td>
                      <td
                        colSpan={5}
                        className="py-1.5 px-3 text-center uppercase tracking-wider text-[11px]"
                      >
                        {slot.label} ({slot.durasiMenit} Menit)
                      </td>
                    </tr>
                  );
                }

                const jp = slot.jp!;
                return (
                  <tr
                    key={`cetak-jp-${jp}`}
                    className="border-b border-slate-800"
                  >
                    <td className="py-2 px-1 text-center font-bold border-r border-slate-900">
                      {jp}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-[11px] border-r border-slate-900">
                      {slot.mulai} - {slot.selesai}
                    </td>
                    {DAFTAR_HARI.map((hari) => {
                      const item = getSlot(hari, jp);
                      return (
                        <td
                          key={`cetak-${hari}-${jp}`}
                          className="py-2 px-2.5 border-r border-slate-900 last:border-r-0 align-top"
                        >
                          <div className="font-semibold text-slate-900 leading-tight">
                            {item?.mapel || '-'}
                          </div>
                          {item?.guruNama && (
                            <div className="text-[10px] text-slate-600 mt-0.5 italic">
                              {item.guruNama}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Schedule Notes / Catatan KBM */}
          <div className="mt-4 text-[11px] text-slate-700 leading-relaxed">
            <p className="font-semibold">Catatan Pelaksanaan KBM:</p>
            <ol className="list-decimal list-inside space-y-0.5 mt-1 text-slate-600">
              <li>Bel tanda masuk berbunyi pukul 07.10 WIB.</li>
              <li>Alokasi waktu setiap jam pelajaran (JP) adalah 35 menit.</li>
              <li>Istirahat I dilaksanakan pukul 08.55 - 09.10 WIB (15 menit).</li>
              <li>Istirahat II dilaksanakan pukul 10.20 - 10.35 WIB (15 menit).</li>
              <li>Istirahat III (Ishoma/Sholat Dhuhur) dilaksanakan pukul 11.45 - 12.20 WIB (35 menit).</li>
              <li>Kegiatan belajar mengajar berakhir pada pukul 14.05 WIB.</li>
            </ol>
          </div>
        </div>
      </PrintWrapper>
    </div>
  );
};
