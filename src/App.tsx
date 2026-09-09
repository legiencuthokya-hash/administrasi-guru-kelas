import React, { useState, useEffect } from 'react';
import {
  User,
  SchoolSettings,
  Siswa,
  Absensi,
  Nilai,
  JurnalMengajar,
  BimbinganSiswa,
  JadwalSlot,
  TemaWarnaId,
} from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getStoredUsers,
  saveStoredUsers,
  getStoredSettings,
  saveStoredSettings,
  getStoredSiswa,
  saveStoredSiswa,
  getStoredAbsensi,
  saveStoredAbsensi,
  getStoredNilai,
  saveStoredNilai,
  getStoredJurnal,
  saveStoredJurnal,
  getStoredBimbingan,
  saveStoredBimbingan,
  getStoredJadwal,
  saveStoredJadwal,
  getFilteredSiswa,
  isGuruMapelUmum,
  syncFromFirestore,
} from './services/storage';
import { auth, signInWithGoogle } from './services/firebase';
import {
  getStoredUserTheme,
  saveUserTheme,
  applyThemeToDOM,
  getThemeConfig,
} from './services/theme';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DataSiswa } from './components/DataSiswa';
import { AbsensiComponent } from './components/Absensi';
import { NilaiComponent } from './components/Nilai';
import { JurnalComponent } from './components/Jurnal';
import { BimbinganComponent } from './components/Bimbingan';
import { JadwalComponent } from './components/Jadwal';
import { CetakJadwal } from './components/cetak/CetakJadwal';
import { CetakAbsenBulanan } from './components/cetak/CetakAbsenBulanan';
import { CetakRekapSemester } from './components/cetak/CetakRekapSemester';
import { CetakNilai } from './components/cetak/CetakNilai';
import { CetakJurnal } from './components/cetak/CetakJurnal';
import { CetakBimbingan } from './components/cetak/CetakBimbingan';
import { AdminGuru } from './components/admin/AdminGuru';
import { AdminSiswa } from './components/admin/AdminSiswa';
import { AdminPengaturan } from './components/admin/AdminPengaturan';
import { GuruProfile } from './components/GuruProfile';
import { ResetDataGuruModal } from './components/ResetDataGuruModal';
import { ThemePicker } from './components/ThemePicker';
import { Palette, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurUser] = useState<User | null>(getCurrentUser());
  const [users, setUsers] = useState<User[]>(getStoredUsers());
  const [settings, setSettings] = useState<SchoolSettings>(getStoredSettings());
  const [siswaList, setSiswaList] = useState<Siswa[]>(getStoredSiswa());
  const [absensiList, setAbsensiList] = useState<Absensi[]>(getStoredAbsensi());
  const [nilaiList, setNilaiList] = useState<Nilai[]>(getStoredNilai());
  const [jurnalList, setJurnalList] = useState<JurnalMengajar[]>(getStoredJurnal());
  const [bimbinganList, setBimbinganList] = useState<BimbinganSiswa[]>(getStoredBimbingan());
  const [jadwalList, setJadwalList] = useState<JadwalSlot[]>(getStoredJadwal());

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isResetGuruModalOpen, setIsResetGuruModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Theme state
  const [activeTheme, setActiveTheme] = useState<TemaWarnaId>(() => {
    const current = getCurrentUser();
    const stg = getStoredSettings();
    return getStoredUserTheme(current?.id, current?.temaWarna, stg.defaultTemaWarna);
  });

  // Apply theme to DOM on mount and change
  useEffect(() => {
    const cfg = getThemeConfig(activeTheme);
    applyThemeToDOM(cfg);
  }, [activeTheme]);

  // Sync theme when user or settings changes
  useEffect(() => {
    if (currentUser) {
      const userTheme = getStoredUserTheme(currentUser.id, currentUser.temaWarna, settings.defaultTemaWarna);
      setActiveTheme(userTheme);
    } else {
      const defaultTheme = (settings.defaultTemaWarna as TemaWarnaId) || 'blue';
      setActiveTheme(defaultTheme);
    }
  }, [currentUser?.id, currentUser?.temaWarna, settings.defaultTemaWarna]);

  const handleSelectTheme = (newThemeId: TemaWarnaId) => {
    setActiveTheme(newThemeId);
    const cfg = getThemeConfig(newThemeId);
    applyThemeToDOM(cfg);
    if (currentUser) {
      saveUserTheme(currentUser.id, newThemeId);
      const updatedUser: User = { ...currentUser, temaWarna: newThemeId };
      setCurUser(updatedUser);
      setCurrentUser(updatedUser);
      const nextUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      setUsers(nextUsers);
      saveStoredUsers(nextUsers);
    }
  };

  // Sync state on user change
  const handleLoginSuccess = (user: User) => {
    setCurUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurUser(null);
  };

  // State update handlers
  const handleSaveUsers = async (updated: User[]) => {
    setUsers(updated);
    await saveStoredUsers(updated);
  };

  const handleSaveSettings = async (updated: SchoolSettings) => {
    setSettings(updated);
    await saveStoredSettings(updated);
  };

  const handleSaveSiswa = async (updated: Siswa[]) => {
    let fullList = updated;
    if (
      currentUser &&
      currentUser.role !== 'admin' &&
      !isGuruMapelUmum(currentUser.tanggungJawab)
    ) {
      // Keep students from all other classes that this teacher doesn't manage
      const otherClassStudents = siswaList.filter(
        (s) => s.kelas !== currentUser.tanggungJawab
      );
      fullList = [...otherClassStudents, ...updated];
    }
    setSiswaList(fullList);
    await saveStoredSiswa(fullList);
  };

  const handleSaveAbsensi = async (updated: Absensi[]) => {
    setAbsensiList(updated);
    await saveStoredAbsensi(updated);
  };

  const handleSaveNilai = async (updated: Nilai[]) => {
    setNilaiList(updated);
    await saveStoredNilai(updated);
  };

  const handleSaveJurnal = async (updated: JurnalMengajar[]) => {
    setJurnalList(updated);
    await saveStoredJurnal(updated);
  };

  const handleSaveBimbingan = async (updated: BimbinganSiswa[]) => {
    setBimbinganList(updated);
    await saveStoredBimbingan(updated);
  };

  const handleSaveJadwal = async (updated: JadwalSlot[]) => {
    setJadwalList(updated);
    await saveStoredJadwal(updated);
  };

  const handleRefreshAllData = () => {
    setAbsensiList(getStoredAbsensi());
    setNilaiList(getStoredNilai());
    setJurnalList(getStoredJurnal());
    setBimbinganList(getStoredBimbingan());
    setJadwalList(getStoredJadwal());
  };

  const handleSyncCloud = async () => {
    if (!currentUser) return;
    if (!auth.currentUser) {
      try {
        await signInWithGoogle();
      } catch (e) {
        console.warn('Google sign-in cancelled or failed:', e);
      }
    }
    await syncFromFirestore(currentUser);
    setSettings(getStoredSettings());
    setUsers(getStoredUsers());
    setSiswaList(getStoredSiswa());
    setAbsensiList(getStoredAbsensi());
    setNilaiList(getStoredNilai());
    setJurnalList(getStoredJurnal());
    setBimbinganList(getStoredBimbingan());
    setJadwalList(getStoredJadwal());
  };

  // If not logged in, render fullscreen login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Filtered students for this user session
  const accessibleStudents = getFilteredSiswa(currentUser, siswaList);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 font-sans">
      {/* Sidepanel (Fixed & does not scroll with content) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenResetGuruModal={() => setIsResetGuruModalOpen(true)}
        currentTheme={activeTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          settings={settings}
          currentTheme={activeTheme}
          onSelectTheme={handleSelectTheme}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
          onSyncCloud={handleSyncCloud}
        />

        {/* Scrollable Content (Sidepanel remains fixed) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {activeTab === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              settings={settings}
              siswaList={accessibleStudents}
              absensiList={absensiList}
              jurnalList={jurnalList}
              bimbinganList={bimbinganList}
              onNavigate={setActiveTab}
              currentTheme={activeTheme}
            />
          )}

          {activeTab === 'jadwal' && (
            <JadwalComponent
              currentUser={currentUser}
              users={users}
              jadwalList={jadwalList}
              onSaveJadwal={handleSaveJadwal}
              onNavigateToPrint={() => setActiveTab('cetak-jadwal')}
            />
          )}

          {activeTab === 'siswa' && (
            <DataSiswa
              currentUser={currentUser}
              siswaList={accessibleStudents}
              onSaveSiswa={handleSaveSiswa}
            />
          )}

          {activeTab === 'absensi' && (
            <AbsensiComponent
              currentUser={currentUser}
              siswaList={accessibleStudents}
              absensiList={absensiList}
              onSaveAbsensi={handleSaveAbsensi}
            />
          )}

          {activeTab === 'nilai' && (
            <NilaiComponent
              currentUser={currentUser}
              siswaList={accessibleStudents}
              nilaiList={nilaiList}
              onSaveNilai={handleSaveNilai}
            />
          )}

          {activeTab === 'jurnal' && (
            <JurnalComponent
              currentUser={currentUser}
              jurnalList={jurnalList}
              onSaveJurnal={handleSaveJurnal}
            />
          )}

          {activeTab === 'bimbingan' && (
            <BimbinganComponent
              currentUser={currentUser}
              siswaList={accessibleStudents}
              bimbinganList={bimbinganList}
              onSaveBimbingan={handleSaveBimbingan}
            />
          )}

          {/* Cetak Sub-menus */}
          {activeTab === 'cetak-jadwal' && (
            <CetakJadwal
              currentUser={currentUser}
              settings={settings}
              users={users}
              jadwalList={jadwalList}
            />
          )}

          {activeTab === 'cetak-absen-bulanan' && (
            <CetakAbsenBulanan
              currentUser={currentUser}
              settings={settings}
              siswaList={accessibleStudents}
              absensiList={absensiList}
            />
          )}

          {activeTab === 'cetak-rekap-semester' && (
            <CetakRekapSemester
              currentUser={currentUser}
              settings={settings}
              siswaList={accessibleStudents}
              absensiList={absensiList}
            />
          )}

          {activeTab === 'cetak-nilai' && (
            <CetakNilai
              currentUser={currentUser}
              settings={settings}
              siswaList={accessibleStudents}
              nilaiList={nilaiList}
            />
          )}

          {activeTab === 'cetak-jurnal' && (
            <CetakJurnal
              currentUser={currentUser}
              settings={settings}
              jurnalList={jurnalList}
            />
          )}

          {activeTab === 'cetak-bimbingan' && (
            <CetakBimbingan
              currentUser={currentUser}
              settings={settings}
              bimbinganList={bimbinganList}
            />
          )}

          {/* Admin Sub-menus */}
          {currentUser.role === 'admin' && activeTab === 'admin-guru' && (
            <AdminGuru users={users} onSaveUsers={handleSaveUsers} />
          )}

          {currentUser.role === 'admin' && activeTab === 'admin-siswa' && (
            <AdminSiswa siswaList={siswaList} onSaveSiswa={handleSaveSiswa} />
          )}

          {currentUser.role === 'admin' && activeTab === 'admin-pengaturan' && (
            <AdminPengaturan
              settings={settings}
              onSaveSettings={handleSaveSettings}
              currentTheme={activeTheme}
              onSelectTheme={handleSelectTheme}
            />
          )}

          {/* Guru Profile, TTD & Warna */}
          {currentUser.role === 'guru' && activeTab === 'guru-profile' && (
            <GuruProfile
              currentUser={currentUser}
              currentTheme={activeTheme}
              onSelectTheme={handleSelectTheme}
              onUpdateUser={(updated) => {
                setCurUser(updated);
                const nextUsers = users.map((u) =>
                  u.id === updated.id ? updated : u
                );
                handleSaveUsers(nextUsers);
              }}
            />
          )}
        </main>
      </div>

      {/* Double Confirmation Modal for Teacher Reset */}
      <ResetDataGuruModal
        isOpen={isResetGuruModalOpen}
        onClose={() => setIsResetGuruModalOpen(false)}
        guruId={currentUser.id}
        guruNama={currentUser.nama}
        onSuccess={handleRefreshAllData}
      />

      {/* Global Theme Selector Modal */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className="p-2 rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: getThemeConfig(activeTheme).hex }}
                >
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    Pilihan Warna Halaman & Tema Aplikasi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sesuaikan suasana warna aplikasi agar nyaman digunakan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ThemePicker
              currentTheme={activeTheme}
              onSelectTheme={(newId) => {
                handleSelectTheme(newId);
              }}
              title="Koleksi Skema Warna Resmi SD Negeri Maospati 3"
              subtitle="Pilih salah satu dari 8 palet warna yang telah disesuaikan dengan kenyamanan visual dan keterbacaan."
            />

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer"
                style={{ backgroundColor: getThemeConfig(activeTheme).hex }}
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
