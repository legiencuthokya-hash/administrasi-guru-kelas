import React, { useState } from 'react';
import { User } from '../types';
import { getStoredUsers, setCurrentUser } from '../services/storage';
import { signInWithGoogle } from '../services/firebase';
import { Lock, ShieldCheck, UserCheck, AlertCircle, GraduationCap, School } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<'guru' | 'admin'>('guru');
  const [selectedGuruId, setSelectedGuruId] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [password, setPassword] = useState('Garuda123');
  const [errorMessage, setErrorMessage] = useState('');

  const users = getStoredUsers();
  const teachers = users.filter((u) => u.role === 'guru');

  const handleRoleChange = (newRole: 'guru' | 'admin') => {
    setRole(newRole);
    setErrorMessage('');
    if (newRole === 'admin') {
      setPassword('admin123');
    } else {
      setPassword('Garuda123');
      if (teachers.length > 0 && !selectedGuruId) {
        setSelectedGuruId(teachers[0].id);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (role === 'admin') {
      const admin = users.find((u) => u.role === 'admin' && u.username === adminUsername.trim());
      if (!admin) {
        setErrorMessage('Akun admin tidak ditemukan.');
        return;
      }
      const validPass = admin.password || 'admin123';
      if (password !== validPass) {
        setErrorMessage('Kata sandi admin salah! (Default: admin123)');
        return;
      }
      setCurrentUser(admin);
      onLoginSuccess(admin);
    } else {
      const targetId = selectedGuruId || (teachers[0]?.id ?? '');
      const guru = users.find((u) => u.id === targetId);
      if (!guru) {
        setErrorMessage('Silakan pilih profil guru Anda.');
        return;
      }
      const validPass = guru.password || 'Garuda123';
      if (password !== validPass) {
        setErrorMessage('Kata sandi guru salah! (Default: Garuda123)');
        return;
      }
      setCurrentUser(guru);
      onLoginSuccess(guru);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage('');
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        // Find existing admin or link with admin role
        const adminUser = users.find((u) => u.role === 'admin') || {
          id: 'user-admin',
          username: fbUser.email?.split('@')[0] || 'admin',
          role: 'admin' as const,
          nama: fbUser.displayName || 'Administrator Sekolah (Google)',
          tanggungJawab: 'Administrator' as const,
        };
        setCurrentUser(adminUser);
        onLoginSuccess(adminUser);
      }
    } catch (err: any) {
      setErrorMessage('Login Google dibatalkan atau terjadi kendala jaringan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-100 overflow-y-auto px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.4),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Top PWA Button */}
        <div className="flex justify-end mb-2">
          <PWAInstallButton />
        </div>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-blue-900/40 border border-blue-700/50 mb-3 shadow-inner">
            <School className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            SD NEGERI MAOSPATI 3
          </h1>
          <p className="text-xs text-blue-300 font-medium mt-1">
            Sistem Administrasi Guru & Penilaian Kurikulum
          </p>
          <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-400 border border-slate-700">
            Kec. Maospati, Kab. Magetan
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 mb-6">
          <button
            type="button"
            id="tab-login-guru"
            onClick={() => handleRoleChange('guru')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
              role === 'guru'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Sebagai Guru</span>
          </button>
          <button
            type="button"
            id="tab-login-admin"
            onClick={() => handleRoleChange('admin')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
              role === 'admin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sebagai Admin</span>
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 bg-red-950/70 border border-red-800 text-red-300 text-xs p-3 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {role === 'guru' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pilih Nama Guru & Tanggung Jawab
              </label>
              <div className="relative">
                <select
                  id="select-guru-login"
                  value={selectedGuruId || (teachers[0]?.id ?? '')}
                  onChange={(e) => setSelectedGuruId(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {teachers.map((guru) => (
                    <option key={guru.id} value={guru.id} className="bg-slate-800 text-slate-100">
                      {guru.nama} — [{guru.tanggungJawab}]
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Akses dibatasi otomatis sesuai kelas / mata pelajaran yang diampu.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username Admin
              </label>
              <div className="relative">
                <input
                  id="input-admin-username"
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Username admin"
                  className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Akses penuh semua data guru, murid, dan pengaturan sekolah.
              </p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Kata Sandi
              </label>
              <span className="text-[11px] text-blue-400 font-mono">
                Default: {role === 'admin' ? 'admin123' : 'Garuda123'}
              </span>
            </div>
            <div className="relative">
              <input
                id="input-login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-xl py-2.5 pl-3 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-login"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Masuk ke Aplikasi</span>
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-slate-900 px-2 text-slate-400 font-medium">atau masuk cloud</span>
          </div>
        </div>

        <button
          type="button"
          id="btn-google-login"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700/80 transition flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.37 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.43l4.02-3.14z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.57l4.02 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>Masuk dengan Google (Cloud Admin)</span>
        </button>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Aplikasi Administrasi Guru Terpadu — SDN Maospati 3
          </p>
        </div>
      </div>
    </div>
  );
};
