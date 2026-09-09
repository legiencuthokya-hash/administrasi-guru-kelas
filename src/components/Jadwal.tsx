import React, { useState, useEffect } from 'react';
import {
  DAFTAR_KELAS,
  DAFTAR_HARI,
  HariSekolah,
  JadwalPeriodInfo,
  JadwalSlot,
  MASTER_TIME_SLOTS,
  User,
} from '../types';
import { isGuruMapelUmum } from '../services/storage';
import { generateDefaultJadwalForClass } from '../services/initialData';
import {
  Clock,
  Calendar,
  Sparkles,
  Printer,
  Edit3,
  RotateCcw,
  Check,
  Save,
  Coffee,
  Sun,
  AlertCircle,
  BookOpen,
  Layers,
  MapPin,
  UserCheck,
} from 'lucide-react';

interface JadwalProps {
  currentUser: User;
  users: User[];
  jadwalList: JadwalSlot[];
  onSaveJadwal: (updated: JadwalSlot[]) => void;
  onNavigateToPrint?: () => void;
}

const DEFAULT_MAPEL_OPTIONS = [
  'Pendidikan Pancasila',
  'Bahasa Indonesia',
  'Matematika',
  'IPAS (Sains & Sosial)',
  'Pendidikan Agama Islam',
  'Pendidikan Agama Kristen',
  'Pendidikan Agama Katolik',
  'PJOK (Pendidikan Jasmani)',
  'Bahasa Jawa',
  'Bahasa Inggris',
  'Seni Rupa',
  'Seni Musik',
  'Seni Tari',
  'P5 (Projek Profil Pancasila)',
  'Upacara Bendera',
  'Senam Pagi / Jumat Sehat',
  'Jumat Bersih & Religi',
  'Literasi & Karakter',
  'Bimbingan Wali Kelas',
  'Ekstrakurikuler Pramuka',
  'Kegiatan Mandiri / Remedial',
];

export const JadwalComponent: React.FC<JadwalProps> = ({
  currentUser,
  users,
  jadwalList,
  onSaveJadwal,
  onNavigateToPrint,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canAccessAllClasses = isAdmin || isSubjectTeacher;

  // Selected Class
  const [selectedClass, setSelectedClass] = useState<string>(
    canAccessAllClasses ? '1A' : currentUser.tanggungJawab
  );

  // View Mode: 'mingguan' | 'harian'
  const [viewMode, setViewMode] = useState<'mingguan' | 'harian'>('mingguan');
  const [selectedHari, setSelectedHari] = useState<HariSekolah>('Senin');

  // Edit Modal State
  const [editingSlot, setEditingSlot] = useState<JadwalSlot | null>(null);
  const [modalMapel, setModalMapel] = useState('');
  const [modalCustomMapel, setModalCustomMapel] = useState('');
  const [modalGuru, setModalGuru] = useState('');
  const [modalRuang, setModalRuang] = useState('');
  const [modalCatatan, setModalCatatan] = useState('');

  // Save notification toast
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Realtime clock & active period calculation
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [activeSlotInfo, setActiveSlotInfo] = useState<{
    status: 'kbm' | 'istirahat' | 'sebelum' | 'selesai' | 'libur';
    label: string;
    detail?: string;
  }>({ status: 'sebelum', label: 'Memuat waktu...' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeVal = `${hours}.${minutes}`;
      setCurrentTimeStr(`${hours}:${minutes} WIB`);

      const dayIdx = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
      const dayNames: (HariSekolah | null)[] = [
        null,
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        null,
      ];
      const todayDay = dayNames[dayIdx];

      if (!todayDay) {
        setActiveSlotInfo({
          status: 'libur',
          label: 'Hari Libur Sekolah (Sabtu/Minggu)',
        });
        return;
      }

      if (timeVal < '07.10') {
        setActiveSlotInfo({
          status: 'sebelum',
          label: `Sebelum KBM Dimulai (${todayDay})`,
          detail: 'Bel masuk berbunyi pukul 07.10 WIB',
        });
      } else if (timeVal > '14.05') {
        setActiveSlotInfo({
          status: 'selesai',
          label: `KBM Hari ${todayDay} Telah Selesai`,
          detail: 'Kegiatan belajar berakhir pukul 14.05 WIB',
        });
      } else {
        // Find matching slot in MASTER_TIME_SLOTS
        const currentSlot = MASTER_TIME_SLOTS.find(
          (s) => timeVal >= s.mulai && timeVal < s.selesai
        );
        if (currentSlot) {
          if (currentSlot.type === 'istirahat') {
            setActiveSlotInfo({
              status: 'istirahat',
              label: `Sedang Berlangsung: ${currentSlot.label}`,
              detail: `Waktu istirahat: ${currentSlot.mulai} - ${currentSlot.selesai} WIB`,
            });
          } else {
            setActiveSlotInfo({
              status: 'kbm',
              label: `Sedang Berlangsung: Jam Ke-${currentSlot.jp}`,
              detail: `${currentSlot.mulai} - ${currentSlot.selesai} WIB (${currentSlot.durasiMenit} Menit)`,
            });
          }
        }
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 15000);
    return () => clearInterval(timer);
  }, []);

  // Filter slots for current selected class
  const classSlots = jadwalList.filter((s) => s.kelas === selectedClass);

  const getSlot = (hari: HariSekolah, jp: number): JadwalSlot | undefined => {
    return classSlots.find((s) => s.hari === hari && s.jp === jp);
  };

  const handleOpenEdit = (hari: HariSekolah, jp: number) => {
    const existing = getSlot(hari, jp);
    const slot: JadwalSlot = existing || {
      id: `${selectedClass}-${hari}-${jp}`,
      kelas: selectedClass,
      hari,
      jp,
      mapel: '',
      guruNama: '',
      ruang: `Ruang Kelas ${selectedClass}`,
      catatan: '',
    };

    setEditingSlot(slot);
    if (DEFAULT_MAPEL_OPTIONS.includes(slot.mapel)) {
      setModalMapel(slot.mapel);
      setModalCustomMapel('');
    } else if (slot.mapel) {
      setModalMapel('CUSTOM');
      setModalCustomMapel(slot.mapel);
    } else {
      setModalMapel('');
      setModalCustomMapel('');
    }
    setModalGuru(slot.guruNama || '');
    setModalRuang(slot.ruang || `Ruang Kelas ${selectedClass}`);
    setModalCatatan(slot.catatan || '');
  };

  const handleSaveModalSlot = () => {
    if (!editingSlot) return;

    const finalMapel =
      modalMapel === 'CUSTOM' ? modalCustomMapel.trim() : modalMapel;

    const updatedSlot: JadwalSlot = {
      ...editingSlot,
      mapel: finalMapel,
      guruNama: modalGuru.trim(),
      ruang: modalRuang.trim(),
      catatan: modalCatatan.trim(),
      updatedAt: new Date().toISOString(),
    };

    const nextList = jadwalList.filter((s) => s.id !== updatedSlot.id);
    if (finalMapel) {
      nextList.push(updatedSlot);
    }

    onSaveJadwal(nextList);
    setEditingSlot(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleClearSlot = () => {
    if (!editingSlot) return;
    const nextList = jadwalList.filter((s) => s.id !== editingSlot.id);
    onSaveJadwal(nextList);
    setEditingSlot(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetToDefaultTemplate = () => {
    if (
      !confirm(
        `Apakah Anda yakin ingin mengisi jadwal Kelas ${selectedClass} dengan template rekomendasi Kurikulum Merdeka (10 JP)? Jadwal saat ini pada kelas ini akan digantikan.`
      )
    ) {
      return;
    }

    const defaultForClass = generateDefaultJadwalForClass(selectedClass);
    const otherClasses = jadwalList.filter((s) => s.kelas !== selectedClass);
    const nextList = [...otherClasses, ...defaultForClass];

    onSaveJadwal(nextList);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Color mapper for subjects
  const getSubjectColorStyle = (mapel?: string) => {
    if (!mapel) return 'bg-slate-50 text-slate-400 border-dashed border-slate-200';
    const m = mapel.toLowerCase();
    if (m.includes('matematika')) return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70';
    if (m.includes('bahasa indonesia')) return 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/70';
    if (m.includes('pancasila') || m.includes('ppkn')) return 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/70';
    if (m.includes('agama') || m.includes('pai')) return 'bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100/70';
    if (m.includes('ipas') || m.includes('sains')) return 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100/70';
    if (m.includes('pjok') || m.includes('jasmani') || m.includes('olahraga')) return 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/70';
    if (m.includes('jawa')) return 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100/70';
    if (m.includes('inggris')) return 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100/70';
    if (m.includes('seni')) return 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200 hover:bg-fuchsia-100/70';
    if (m.includes('p5') || m.includes('projek')) return 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100/70';
    if (m.includes('upacara') || m.includes('pramuka') || m.includes('senam')) return 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100/70';
    return 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200/70';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Clock className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Jadwal Pelajaran
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Senin — Jumat
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl pt-1">
              Struktur alokasi <strong>10 Jam Pelajaran (JP)</strong> per hari, durasi <strong>35 menit</strong> per JP dimulai pukul <strong>07.10 WIB</strong> dengan 3 jeda istirahat resmi SDN Maospati 3.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateToPrint && (
              <button
                type="button"
                id="btn-cetak-jadwal-top"
                onClick={onNavigateToPrint}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition border border-slate-200 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak Jadwal</span>
              </button>
            )}

            <button
              type="button"
              id="btn-reset-template-jadwal"
              onClick={handleResetToDefaultTemplate}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 cursor-pointer"
              title="Isi otomatis jadwal kelas ini dengan susunan standar Kurikulum Merdeka"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Template Standar</span>
            </button>
          </div>
        </div>

        {/* Breakdown of Breaks Badges */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-800">Istirahat I (15 Menit)</div>
              <div className="text-[10px] text-slate-500 font-medium">08.55 - 09.10 (Setelah Jam Ke-3)</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-800">Istirahat II (15 Menit)</div>
              <div className="text-[10px] text-slate-500 font-medium">10.20 - 10.35 (Setelah Jam Ke-5)</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-800">Istirahat III / Ishoma (35 Menit)</div>
              <div className="text-[10px] text-slate-500 font-medium">11.45 - 12.20 (Setelah Jam Ke-7)</div>
            </div>
          </div>
        </div>

        {/* Realtime Active Slot Tracker */}
        <div className="mt-3 flex items-center justify-between bg-blue-50/70 border border-blue-100 px-3.5 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <span className="font-semibold text-blue-950">{activeSlotInfo.label}</span>
            {activeSlotInfo.detail && (
              <span className="hidden sm:inline text-blue-700/80 font-normal">
                — {activeSlotInfo.detail}
              </span>
            )}
          </div>
          <div className="font-mono text-[11px] font-semibold text-blue-800 bg-white/80 px-2 py-0.5 rounded-md border border-blue-200/60">
            {currentTimeStr || '07.10 WIB'}
          </div>
        </div>
      </div>

      {/* Filter and Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500">Kelas:</span>
          {canAccessAllClasses ? (
            <select
              id="select-kelas-jadwal"
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
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              Kelas {selectedClass}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('mingguan')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'mingguan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriks Lengkap (Senin - Jumat)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('harian')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'harian'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tampilan Per Hari
          </button>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveSuccess && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-medium animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Jadwal pelajaran berhasil diperbarui dan tersimpan!</span>
        </div>
      )}

      {/* VIEW MODE 1: MATRIKS LENGKAP SENIN - JUMAT */}
      {viewMode === 'mingguan' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Matriks Jadwal Pelajaran — Kelas {selectedClass}
              </h2>
            </div>
            <div className="text-[11px] text-slate-400">
              Klik pada kotak jam pelajaran untuk mengubah mata pelajaran / guru
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-28 text-center border-r border-slate-200">
                    Jam / Waktu
                  </th>
                  {DAFTAR_HARI.map((hari) => (
                    <th
                      key={hari}
                      className="py-3 px-3 text-center border-r border-slate-200 last:border-r-0"
                    >
                      <div className="font-bold text-slate-900">{hari}</div>
                      <div className="text-[10px] font-normal text-slate-500">
                        {hari === 'Jumat' ? '10 JP (Pulang/Pramuka)' : '10 JP'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-200">
                {MASTER_TIME_SLOTS.map((slot, idx) => {
                  if (slot.type === 'istirahat') {
                    // Full row for break
                    return (
                      <tr
                        key={`istirahat-${idx}`}
                        className="bg-amber-50/80 text-amber-900 font-semibold border-y-2 border-amber-200/80"
                      >
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] border-r border-amber-200 bg-amber-100/50">
                          {slot.mulai} - {slot.selesai}
                        </td>
                        <td
                          colSpan={5}
                          className="py-2.5 px-4 text-center text-xs tracking-wide"
                        >
                          <div className="flex items-center justify-center gap-2">
                            {slot.jp === undefined && slot.label.includes('Ishoma') ? (
                              <Sun className="w-3.5 h-3.5 text-amber-700" />
                            ) : (
                              <Coffee className="w-3.5 h-3.5 text-amber-700" />
                            )}
                            <span className="uppercase font-bold tracking-wider text-[11px]">
                              {slot.label} ({slot.durasiMenit} Menit)
                            </span>
                            {slot.label.includes('Ishoma') && (
                              <span className="text-[10px] font-normal text-amber-800/80">
                                — Sholat Dhuhur & Istirahat Siang
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const jp = slot.jp!;
                  return (
                    <tr
                      key={`jp-${jp}`}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="py-2 px-2.5 text-center border-r border-slate-200 bg-slate-50/60">
                        <div className="font-bold text-slate-900 text-xs">
                          JP {jp}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 font-medium">
                          {slot.mulai} - {slot.selesai}
                        </div>
                        <div className="text-[9px] text-slate-400">35 mnt</div>
                      </td>

                      {DAFTAR_HARI.map((hari) => {
                        const item = getSlot(hari, jp);
                        const hasMapel = Boolean(item && item.mapel);
                        return (
                          <td
                            key={`${hari}-${jp}`}
                            onClick={() => handleOpenEdit(hari, jp)}
                            className="p-1.5 border-r border-slate-200 last:border-r-0 cursor-pointer align-top"
                          >
                            <div
                              className={`p-2.5 rounded-xl border text-left transition h-full flex flex-col justify-between group min-h-[78px] ${getSubjectColorStyle(
                                item?.mapel
                              )}`}
                            >
                              <div>
                                <div className="font-bold text-xs leading-snug line-clamp-2">
                                  {item?.mapel || (
                                    <span className="text-slate-400 italic font-normal text-[11px]">
                                      + Isi Pelajaran
                                    </span>
                                  )}
                                </div>
                                {item?.guruNama && (
                                  <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1 font-medium truncate">
                                    <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">{item.guruNama}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1 pt-1 border-t border-black/5">
                                <span className="truncate">
                                  {item?.ruang || `R. ${selectedClass}`}
                                </span>
                                <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-80 transition text-slate-600" />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: TAB PER HARI (SENIN - JUMAT) */
        <div className="space-y-4">
          {/* Day Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
            {DAFTAR_HARI.map((h) => {
              const isSelected = selectedHari === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setSelectedHari(h)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{h}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    10 JP
                  </span>
                </button>
              );
            })}
          </div>

          {/* Timeline View for the Selected Day */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Jadwal Hari {selectedHari} — Kelas {selectedClass}
                </h3>
                <p className="text-xs text-slate-500">
                  Urutan pembelajaran 10 JP dari 07.10 hingga 14.05 WIB
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenEdit(selectedHari, 1)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Jadwal</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {MASTER_TIME_SLOTS.map((slot, idx) => {
                if (slot.type === 'istirahat') {
                  return (
                    <div
                      key={`harian-istirahat-${idx}`}
                      className="py-3 px-4 my-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                          <Coffee className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{slot.label}</div>
                          <div className="text-[11px] text-amber-700">
                            Durasi {slot.durasiMenit} Menit
                          </div>
                        </div>
                      </div>
                      <div className="font-mono text-xs font-bold text-amber-800 bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200">
                        {slot.mulai} - {slot.selesai}
                      </div>
                    </div>
                  );
                }

                const jp = slot.jp!;
                const item = getSlot(selectedHari, jp);

                return (
                  <div
                    key={`harian-jp-${jp}`}
                    onClick={() => handleOpenEdit(selectedHari, jp)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 text-center shrink-0">
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 py-1 px-1.5 rounded-lg border border-blue-100">
                          JP {jp}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">
                          {slot.mulai}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {item?.mapel || (
                            <span className="text-slate-400 italic font-normal">
                              (Belum ada mata pelajaran — klik untuk mengisi)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                          {item?.guruNama && (
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-slate-400" />
                              {item.guruNama}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3" />
                            {item?.ruang || `Ruang Kelas ${selectedClass}`}
                          </span>
                        </div>
                        {item?.catatan && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">
                            Catatan: {item.catatan}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                        {slot.mulai} - {slot.selesai} (35m)
                      </span>
                      <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Edit Jadwal — Kelas {editingSlot.kelas}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Hari {editingSlot.hari}, Jam Pelajaran Ke-{editingSlot.jp} (
                    {
                      MASTER_TIME_SLOTS.find((s) => s.jp === editingSlot.jp)
                        ?.mulai
                    }{' '}
                    -{' '}
                    {
                      MASTER_TIME_SLOTS.find((s) => s.jp === editingSlot.jp)
                        ?.selesai
                    }{' '}
                    WIB)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4 text-xs">
              {/* Mata Pelajaran */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mata Pelajaran:
                </label>
                <select
                  id="modal-select-mapel"
                  value={modalMapel}
                  onChange={(e) => setModalMapel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {DEFAULT_MAPEL_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Tulis Mapel Lainnya...</option>
                </select>

                {modalMapel === 'CUSTOM' && (
                  <input
                    type="text"
                    id="modal-custom-mapel"
                    placeholder="Ketik nama mata pelajaran / kegiatan..."
                    value={modalCustomMapel}
                    onChange={(e) => setModalCustomMapel(e.target.value)}
                    className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                )}
              </div>

              {/* Guru Pengajar */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Guru Pengajar:
                </label>
                <input
                  type="text"
                  id="modal-input-guru"
                  placeholder={`Contoh: Wali Kelas ${editingSlot.kelas} / Budi Santoso, S.Pd.`}
                  value={modalGuru}
                  onChange={(e) => setModalGuru(e.target.value)}
                  list="list-teachers"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <datalist id="list-teachers">
                  {users.map((u) => (
                    <option key={u.id} value={u.nama}>
                      {u.nama} ({u.tanggungJawab})
                    </option>
                  ))}
                  <option value={`Wali Kelas ${editingSlot.kelas}`} />
                  <option value="Guru PJOK" />
                  <option value="Guru PAI" />
                  <option value="Guru Bahasa Inggris" />
                </datalist>
              </div>

              {/* Ruang / Tempat */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ruangan / Tempat:
                </label>
                <input
                  type="text"
                  id="modal-input-ruang"
                  placeholder={`Contoh: Ruang Kelas ${editingSlot.kelas} / Lapangan / Lab Komputer`}
                  value={modalRuang}
                  onChange={(e) => setModalRuang(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Khusus (Opsional):
                </label>
                <input
                  type="text"
                  id="modal-input-catatan"
                  placeholder="Contoh: Membawa perlengkapan gambar / seragam olahraga"
                  value={modalCatatan}
                  onChange={(e) => setModalCatatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                id="btn-modal-clear-slot"
                onClick={handleClearSlot}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition border border-rose-200 cursor-pointer"
              >
                Kosongkan Jam Ini
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="btn-modal-save-slot"
                  onClick={handleSaveModalSlot}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
