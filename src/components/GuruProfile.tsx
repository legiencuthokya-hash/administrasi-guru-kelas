import React, { useState } from 'react';
import { User, TemaWarnaId } from '../types';
import { PenTool, Save, Check, Lock, User as UserIcon, Palette } from 'lucide-react';
import { setCurrentUser } from '../services/storage';
import { ThemePicker } from './ThemePicker';
import { getThemeConfig, saveUserTheme } from '../services/theme';

interface GuruProfileProps {
  currentUser: User;
  onUpdateUser: (updated: User) => void;
  currentTheme?: TemaWarnaId;
  onSelectTheme?: (id: TemaWarnaId) => void;
}

export const GuruProfile: React.FC<GuruProfileProps> = ({
  currentUser,
  onUpdateUser,
  currentTheme = 'blue',
  onSelectTheme,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<TemaWarnaId>(
    (currentUser.temaWarna as TemaWarnaId) || currentTheme || 'blue'
  );
  const [tandaTanganUrl, setTandaTanganUrl] = useState(
    currentUser.tandaTanganUrl || ''
  );
  const [password, setPassword] = useState(currentUser.password || 'Garuda123');
  const [isSaved, setIsSaved] = useState(false);

  const themeConfig = getThemeConfig(selectedTheme);

  const handleThemeChange = (newThemeId: TemaWarnaId) => {
    setSelectedTheme(newThemeId);
    saveUserTheme(currentUser.id, newThemeId);
    if (onSelectTheme) {
      onSelectTheme(newThemeId);
    }
    const updated: User = {
      ...currentUser,
      temaWarna: newThemeId,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updated);
    onUpdateUser(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      temaWarna: selectedTheme,
      tandaTanganUrl: tandaTanganUrl.trim(),
      password: password.trim(),
      updatedAt: new Date().toISOString(),
    };
    saveUserTheme(currentUser.id, selectedTheme);
    setCurrentUser(updated);
    onUpdateUser(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            <span>Pengaturan Akun, Warna & TTD Guru</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sesuaikan tema warna tampilan halaman, kata sandi, dan tanda tangan digital untuk berkas cetak resmi.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeConfig.hex }} />
          <span className="font-semibold text-slate-700">{themeConfig.name}</span>
        </div>
      </div>

      {/* Theme Picker Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div
            className="p-1.5 rounded-xl text-white shadow-xs"
            style={{ backgroundColor: themeConfig.hex }}
          >
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Pilihan Warna Halaman & Tema Anda
            </h3>
            <p className="text-[11px] text-slate-500">
              Pilih warna favorit Anda. Warna akan otomatis tersimpan dan aktif setiap kali Anda masuk ke akun guru Anda.
            </p>
          </div>
        </div>

        <ThemePicker
          currentTheme={selectedTheme}
          onSelectTheme={handleThemeChange}
          title="Pilih Skema Warna Tampilan Guru"
          subtitle="Setiap guru dapat memilih tema warna yang paling nyaman di mata saat mengajar dan menginput nilai."
        />
      </div>

      {/* Profile summary card & Signature Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{currentUser.nama}</h3>
            <p className="text-slate-500 font-mono text-[11px]">
              NIP: {currentUser.nip || '-'}
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-semibold">
              Guru {currentUser.tanggungJawab}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              URL Scan Tanda Tangan Guru
            </label>
            <input
              type="url"
              value={tandaTanganUrl}
              onChange={(e) => setTandaTanganUrl(e.target.value)}
              placeholder="https://... (URL gambar transparan PNG tanda tangan)"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              *Tanda tangan ini akan otomatis tampil saat mencetak Absen, Nilai, Jurnal, dan Bimbingan Siswa bila opsi Tanda Tangan Otomatis diaktifkan.
            </p>
          </div>

          {/* Live Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="block font-semibold text-slate-700 mb-2">
              Pratinjau Tanda Tangan Anda:
            </span>
            <div className="h-24 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2">
              {tandaTanganUrl ? (
                <img
                  src={tandaTanganUrl}
                  alt="Pratinjau TTD Guru"
                  className="max-h-20 max-w-44 object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-slate-400 italic text-[11px]">
                  Belum ada URL gambar tanda tangan yang dimasukkan.
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Ganti Kata Sandi (Opsional)</span>
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Default: Garuda123"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white shadow-md transition ${
                isSaved
                  ? 'bg-emerald-600'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Profil & TTD Berhasil Disimpan!' : 'Simpan Tanda Tangan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
