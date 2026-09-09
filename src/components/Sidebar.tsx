import React from 'react';
import { User } from '../types';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  HeartHandshake,
  Printer,
  Settings,
  Trash2,
  X,
  FileSpreadsheet,
  Calendar,
  PenTool,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'jadwal'
  | 'siswa'
  | 'absensi'
  | 'nilai'
  | 'jurnal'
  | 'bimbingan'
  | 'cetak-jadwal'
  | 'cetak-absen-bulanan'
  | 'cetak-rekap-semester'
  | 'cetak-nilai'
  | 'cetak-jurnal'
  | 'cetak-bimbingan'
  | 'admin-guru'
  | 'admin-siswa'
  | 'admin-pengaturan'
  | 'guru-profile';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User;
  onOpenResetGuruModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  currentUser,
  onOpenResetGuruModal,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    // On small screens, close sidebar after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Fixed Sidepanel - does NOT scroll with main content */}
      <aside
        id="sidepanel-navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-screen lg:shrink-0`}
      >
        {/* Top Header of Sidepanel */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-md">
              SD3
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white leading-none">
                SDN MAOSPATI 3
              </div>
              <div className="text-[10px] text-blue-400 font-medium mt-1 uppercase tracking-wider">
                {isAdmin ? 'Panel Administrator' : `Guru ${currentUser.tanggungJawab}`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav List inside fixed sidebar */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs font-medium">
          {/* Main Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </div>
            <button
              id="nav-dashboard"
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Dashboard Ringkasan</span>
            </button>

            <button
              type="button"
              id="nav-jadwal"
              onClick={() => handleNavClick('jadwal')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'jadwal'
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Jadwal Pelajaran</span>
            </button>

            <button
              id="nav-siswa"
              onClick={() => handleNavClick('siswa')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'siswa'
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Data Siswa</span>
            </button>

            <button
              id="nav-absensi"
              onClick={() => handleNavClick('absensi')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'absensi'
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>Daftar Hadir (Absensi)</span>
            </button>

            <button
              id="nav-nilai"
              onClick={() => handleNavClick('nilai')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'nilai'
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span>Nilai Harian Per Bab</span>
            </button>

            <button
              id="nav-jurnal"
              onClick={() => handleNavClick('jurnal')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'jurnal'
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Jurnal Catatan Mengajar</span>
            </button>

            <button
              id="nav-bimbingan"
              onClick={() => handleNavClick('bimbingan')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'bimbingan'
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <span>Bimbingan Siswa</span>
            </button>
          </div>

          {/* Cetak & Dokumen Resmi Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Printer className="w-3 h-3 text-slate-400" />
              <span>Menu Cetak Dokumen</span>
            </div>

            <button
              id="nav-cetak-jadwal"
              onClick={() => handleNavClick('cetak-jadwal')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left ${
                activeTab === 'cetak-jadwal'
                  ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cetak Jadwal Pelajaran</span>
            </button>

            <button
              id="nav-cetak-absen-bulanan"
              onClick={() => handleNavClick('cetak-absen-bulanan')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left ${
                activeTab === 'cetak-absen-bulanan'
                  ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Cetak Absen Bulanan</span>
            </button>

            <button
              id="nav-cetak-rekap-semester"
              onClick={() => handleNavClick('cetak-rekap-semester')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left ${
                activeTab === 'cetak-rekap-semester'
                  ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak Rekap Sem 1 / 2</span>
            </button>

            <button
              id="nav-cetak-nilai"
              onClick={() => handleNavClick('cetak-nilai')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left ${
                activeTab === 'cetak-nilai'
                  ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Cetak Nilai Bab</span>
            </button>

            <button
              id="nav-cetak-jurnal"
              onClick={() => handleNavClick('cetak-jurnal')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left ${
                activeTab === 'cetak-jurnal'
                  ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cetak Jurnal (Bulan)</span>
            </button>

            <button
              id="nav-cetak-bimbingan"
              onClick={() => handleNavClick('cetak-bimbingan')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left ${
                activeTab === 'cetak-bimbingan'
                  ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              <span>Cetak Bimbingan (Sem)</span>
            </button>
          </div>

          {/* Admin Specific Section */}
          {isAdmin ? (
            <div className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Settings className="w-3 h-3 text-slate-400" />
                <span>Administrasi Sistem</span>
              </div>

              <button
                id="nav-admin-guru"
                onClick={() => handleNavClick('admin-guru')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                  activeTab === 'admin-guru'
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Kelola Guru & CSV</span>
              </button>

              <button
                id="nav-admin-siswa"
                onClick={() => handleNavClick('admin-siswa')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                  activeTab === 'admin-siswa'
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Kelola Siswa Masal CSV</span>
              </button>

              <button
                id="nav-admin-pengaturan"
                onClick={() => handleNavClick('admin-pengaturan')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                  activeTab === 'admin-pengaturan'
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Pengaturan Sekolah & TTD</span>
              </button>
            </div>
          ) : (
            /* Guru Profile & Tanda Tangan */
            <div className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pengaturan Guru
              </div>
              <button
                id="nav-guru-profile"
                onClick={() => handleNavClick('guru-profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                  activeTab === 'guru-profile'
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <PenTool className="w-4 h-4 text-indigo-400" />
                <span>TTD Digital Guru</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer with Guru Danger Zone if teacher */}
        {!isAdmin && (
          <div className="p-3 border-t border-slate-800">
            <button
              id="btn-trigger-reset-guru"
              onClick={onOpenResetGuruModal}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-semibold transition"
              title="Hapus semua data absen, nilai, jurnal, dan bimbingan saya"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Data Tersimpan</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
