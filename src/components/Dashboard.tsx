import React from 'react';
import { User, SchoolSettings, Siswa, Absensi, JurnalMengajar, BimbinganSiswa, TemaWarnaId } from '../types';
import { ActiveTab } from './Sidebar';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  HeartHandshake,
  Printer,
  Calendar,
  CloudCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';
import { isFirebaseReady } from '../services/firebase';
import { getThemeConfig } from '../services/theme';

interface DashboardProps {
  currentUser: User;
  settings: SchoolSettings;
  siswaList: Siswa[];
  absensiList: Absensi[];
  jurnalList: JurnalMengajar[];
  bimbinganList: BimbinganSiswa[];
  onNavigate: (tab: ActiveTab) => void;
  currentTheme?: TemaWarnaId;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  settings,
  siswaList,
  absensiList,
  jurnalList,
  bimbinganList,
  onNavigate,
  currentTheme = 'blue',
}) => {
  const isAdmin = currentUser.role === 'admin';
  const today = new Date().toISOString().split('T')[0];
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const theme = getThemeConfig(currentTheme);

  // Filter attendance for today
  const todayAbsen = absensiList.filter((a) => a.tanggal === today);
  let totalHadirToday = 0;
  let totalSakitToday = 0;
  let totalIzinToday = 0;
  let totalAlpaToday = 0;

  todayAbsen.forEach((a) => {
    Object.values(a.records).forEach((status) => {
      if (status === 'H') totalHadirToday++;
      else if (status === 'S') totalSakitToday++;
      else if (status === 'I') totalIzinToday++;
      else if (status === 'A') totalAlpaToday++;
    });
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className={`bg-gradient-to-r ${theme.classes.bannerGradient} rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden`}>
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.classes.bannerBadge} text-xs font-semibold mb-3 border`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tahun Ajaran {settings.tahunAjaranAktif} • Semester {settings.semesterAktif}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight">
            Selamat Datang, {currentUser.nama}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-100/90 mt-2 leading-relaxed">
            {isAdmin
              ? 'Anda login sebagai Administrator Sekolah dengan wewenang mengelola seluruh data guru, siswa, dan konfigurasi resmi SD Negeri Maospati 3.'
              : `Anda bertugas sebagai Guru ${currentUser.tanggungJawab}. Kelola daftar hadir, penilaian harian tiap bab, jurnal mengajar, dan bimbingan siswa kelas Anda.`}
          </p>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-blue-800/60 text-[11px] text-blue-200">
            <span>Kepala Satuan Pendidikan: <strong>{settings.namaKepala}</strong></span>
            <span>•</span>
            <span>Lokasi TTD: <strong>{settings.lokasiTandaTangan}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Sistem Siap Digunakan
            </span>
          </div>
        </div>
      </div>

      {/* Weekend Notice if applicable */}
      {isWeekend && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs font-medium">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Hari Libur Akhir Pekan (Sabtu/Minggu):</strong> Sesuai aturan kalender akademik SD Negeri Maospati 3, pengisian absensi dinonaktifkan pada hari Sabtu dan Minggu.
          </span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Siswa Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">
              {isAdmin ? 'Total Siswa Sekolah' : 'Siswa Tanggung Jawab'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {siswaList.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isAdmin ? 'Semua kelas 1 - 6' : `Dalam ${currentUser.tanggungJawab}`}
          </p>
        </div>

        {/* Absensi Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Kehadiran Hari Ini</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600">
            {totalHadirToday}
          </div>
          <div className="flex gap-2 text-[11px] text-slate-600 mt-1">
            <span>S: {totalSakitToday}</span>
            <span>•</span>
            <span>I: {totalIzinToday}</span>
            <span>•</span>
            <span>A: {totalAlpaToday}</span>
          </div>
        </div>

        {/* Jurnal Mengajar Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Jurnal Mengajar</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {jurnalList.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Catatan kegiatan belajar
          </p>
        </div>

        {/* Bimbingan Siswa Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Bimbingan Siswa</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {bimbinganList.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Kasus / pembinaan siswa
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Akses Cepat Menu Administrasi</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            id="dash-quick-jadwal"
            onClick={() => onNavigate('jadwal')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition text-center group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Jadwal</span>
            <span className="text-[10px] text-slate-500">10 JP Pelajaran</span>
          </button>

          <button
            onClick={() => onNavigate('absensi')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition text-center group"
          >
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 mb-2 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Isi Absen</span>
            <span className="text-[10px] text-slate-500">Daftar Hadir</span>
          </button>

          <button
            onClick={() => onNavigate('nilai')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition text-center group"
          >
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 mb-2 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Input Nilai</span>
            <span className="text-[10px] text-slate-500">Penilaian Bab</span>
          </button>

          <button
            onClick={() => onNavigate('jurnal')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition text-center group"
          >
            <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-700 mb-2 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Tulis Jurnal</span>
            <span className="text-[10px] text-slate-500">Agenda Mengajar</span>
          </button>

          <button
            onClick={() => onNavigate('cetak-absen-bulanan')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition text-center group"
          >
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 mb-2 group-hover:scale-110 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Cetak Absen</span>
            <span className="text-[10px] text-slate-500">Format Bulanan</span>
          </button>

          <button
            onClick={() => onNavigate('cetak-rekap-semester')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition text-center group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 mb-2 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Rekap Semester</span>
            <span className="text-[10px] text-slate-500">Excel / Cetak</span>
          </button>
        </div>
      </div>
    </div>
  );
};
