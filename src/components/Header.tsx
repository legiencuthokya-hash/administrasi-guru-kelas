import React, { useState } from 'react';
import { User, SchoolSettings } from '../types';
import { Menu, LogOut, ShieldCheck, User as UserIcon, School, Cloud, RefreshCw, Check } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { isFirebaseReady } from '../services/firebase';

interface HeaderProps {
  currentUser: User;
  settings: SchoolSettings;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onSyncCloud?: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  settings,
  onToggleSidebar,
  onLogout,
  onSyncCloud,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const handleSync = async () => {
    if (!onSyncCloud || isSyncing) return;
    setIsSyncing(true);
    try {
      await onSyncCloud();
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-slate-200 px-4 py-2.5 sm:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
          title="Buka / Tutup Menu Sidepanel"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {settings.logoSekolahUrl ? (
            <img
              src={settings.logoSekolahUrl}
              alt="Logo"
              className="w-8 h-8 object-contain rounded"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
              <School className="w-4 h-4" />
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              {settings.namaSekolah || 'SD NEGERI MAOSPATI 3'}
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Tahun Ajaran {settings.tahunAjaranAktif} • Semester {settings.semesterAktif}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Firebase Cloud Sync Button */}
        {onSyncCloud && (
          <button
            id="btn-sync-cloud"
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              justSynced
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Sinkronkan data dengan Cloud Firestore"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : justSynced ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="hidden md:inline">
              {isSyncing ? 'Menyinkronkan...' : justSynced ? 'Tersinkron!' : 'Sinkron Cloud'}
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"
              title="Firebase Firestore Terhubung"
            />
          </button>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* User profile capsule */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100/90 border border-slate-200 px-3 py-1.5 rounded-xl">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
            {currentUser.role === 'admin' ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <UserIcon className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[140px]">
              {currentUser.nama}
            </div>
            <div className="text-[10px] text-blue-700 font-medium mt-0.5 leading-none">
              {currentUser.role === 'admin' ? 'Administrator' : currentUser.tanggungJawab}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          id="btn-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
