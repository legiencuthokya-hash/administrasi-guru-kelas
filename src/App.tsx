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
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          settings={settings}
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
            />
          )}

          {/* Guru Profile & TTD */}
          {currentUser.role === 'guru' && activeTab === 'guru-profile' && (
            <GuruProfile
              currentUser={currentUser}
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
    </div>
  );
}
