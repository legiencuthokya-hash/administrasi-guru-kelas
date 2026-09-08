import React, { useState } from 'react';
import { User } from '../types';
import { PenTool, Save, Check, Lock, User as UserIcon } from 'lucide-react';
import { setCurrentUser } from '../services/storage';

interface GuruProfileProps {
  currentUser: User;
  onUpdateUser: (updated: User) => void;
}

export const GuruProfile: React.FC<GuruProfileProps> = ({
  currentUser,
  onUpdateUser,
}) => {
  const [tandaTanganUrl, setTandaTanganUrl] = useState(
    currentUser.tandaTanganUrl || ''
  );
  const [password, setPassword] = useState(currentUser.password || 'Garuda123');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      tandaTanganUrl: tandaTanganUrl.trim(),
      password: password.trim(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updated);
    onUpdateUser(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-indigo-600" />
          <span>Pengaturan Tanda Tangan Digital Guru</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola URL scan tanda tangan Anda untuk disematkan secara otomatis pada seluruh dokumen cetak resmi.
        </p>
      </div>

      {/* Profile summary card */}
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
