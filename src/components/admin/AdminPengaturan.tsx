import React, { useState } from 'react';
import { SchoolSettings } from '../../types';
import {
  Settings,
  Save,
  Check,
  Image,
  School,
  MapPin,
  PenTool,
  Database,
  Cloud,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  isFirebaseReady,
  auth,
  signInWithGoogle,
  signOutFirebase,
} from '../../services/firebase';
import {
  backupAllToFirestore,
  syncFromFirestore,
  getCurrentUser,
} from '../../services/storage';
import firebaseConfig from '../../../firebase-applet-config.json';

interface AdminPengaturanProps {
  settings: SchoolSettings;
  onSaveSettings: (updated: SchoolSettings) => void;
}

export const AdminPengaturan: React.FC<AdminPengaturanProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  // Cloud sync states
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleBackupCloud = async () => {
    setIsBackingUp(true);
    setSyncStatusMsg(null);
    try {
      const res = await backupAllToFirestore();
      setSyncStatusMsg({ text: res.message, isError: !res.success });
    } catch (e: any) {
      setSyncStatusMsg({ text: e?.message || 'Terjadi kesalahan cadangan', isError: true });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSyncCloud = async () => {
    const cur = getCurrentUser();
    if (!cur) return;
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await syncFromFirestore(cur);
      setSyncStatusMsg({ text: res.message, isError: !res.success });
      if (res.success) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e: any) {
      setSyncStatusMsg({ text: e?.message || 'Terjadi kesalahan sinkronisasi', isError: true });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <span>Pengaturan Satuan Pendidikan & Legalitas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi logo, identitas kepala satuan pendidikan, lokasi tanda tangan, dan kop resmi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFirebaseModal(true)}
          className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Status Firebase Firestore</span>
        </button>
      </div>

      {/* Cloud Sync Quick Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-300" />
            <span className="font-bold text-sm">Penyimpanan Terpadu Cloud Firestore SD Negeri Maospati 3</span>
            <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/40">
              Aktif Terkoneksi
            </span>
          </div>
          <p className="text-xs text-blue-200/90 leading-relaxed max-w-2xl">
            Sistem menggunakan penyimpanan lokal hibrida untuk menghemat kuota baca Firestore secara maksimal. Anda dapat mencadangkan seluruh data sekolah ke Cloud Firestore atau menarik sinkronisasi kapan saja.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleBackupCloud}
            disabled={isBackingUp || isSyncing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition shadow-xs"
          >
            {isBackingUp ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>{isBackingUp ? 'Mencadangkan...' : 'Cadangkan ke Cloud'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncCloud}
            disabled={isBackingUp || isSyncing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition border border-white/20"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isSyncing ? 'Menyinkronkan...' : 'Tarik dari Cloud'}</span>
          </button>
        </div>
      </div>

      {syncStatusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
            syncStatusMsg.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {syncStatusMsg.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{syncStatusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identitas Sekolah */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            <School className="w-4 h-4 text-blue-600" />
            <span>Identitas Satuan Pendidikan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Satuan Pendidikan *
              </label>
              <input
                type="text"
                value={formData.namaSekolah}
                onChange={(e) =>
                  setFormData({ ...formData, namaSekolah: e.target.value })
                }
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NPSN Sekolah *
              </label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) =>
                  setFormData({ ...formData, npsn: e.target.value })
                }
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Alamat Lengkap Satuan Pendidikan *
            </label>
            <input
              type="text"
              value={formData.alamatSekolah}
              onChange={(e) =>
                setFormData({ ...formData, alamatSekolah: e.target.value })
              }
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tahun Ajaran Aktif
              </label>
              <input
                type="text"
                value={formData.tahunAjaranAktif}
                onChange={(e) =>
                  setFormData({ ...formData, tahunAjaranAktif: e.target.value })
                }
                placeholder="2025/2026"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Semester Aktif
              </label>
              <select
                value={formData.semesterAktif}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    semesterAktif: e.target.value as '1' | '2',
                  })
                }
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="1">Semester 1 (Ganjil)</option>
                <option value="2">Semester 2 (Genap)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Kepala Satuan Pendidikan & Tanda Tangan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            <PenTool className="w-4 h-4 text-indigo-600" />
            <span>Kepala Satuan Pendidikan & Pengesahan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Kepala Satuan Pendidikan *
              </label>
              <input
                type="text"
                value={formData.namaKepala}
                onChange={(e) =>
                  setFormData({ ...formData, namaKepala: e.target.value })
                }
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIP Kepala Satuan Pendidikan
              </label>
              <input
                type="text"
                value={formData.nipKepala}
                onChange={(e) =>
                  setFormData({ ...formData, nipKepala: e.target.value })
                }
                placeholder="1970..."
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Lokasi Penetapan Tanda Tangan *</span>
              </label>
              <input
                type="text"
                value={formData.lokasiTandaTangan}
                onChange={(e) =>
                  setFormData({ ...formData, lokasiTandaTangan: e.target.value })
                }
                placeholder="Contoh: Maospati"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                URL Scan Tanda Tangan Kepala Satuan Pendidikan
              </label>
              <input
                type="url"
                value={formData.tandaTanganKepalaUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tandaTanganKepalaUrl: e.target.value,
                  })
                }
                placeholder="https://... (URL gambar transparan PNG)"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {formData.tandaTanganKepalaUrl && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <span className="text-slate-600 font-semibold">Pratinjau TTD Kepala:</span>
              <img
                src={formData.tandaTanganKepalaUrl}
                alt="Pratinjau TTD Kepala"
                className="h-12 object-contain bg-white p-1 rounded border border-slate-300"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Section 3: Logo Sekolah & Logo Kabupaten */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            <Image className="w-4 h-4 text-emerald-600" />
            <span>Logo Sekolah & Logo Kabupaten</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                URL Logo Sekolah (SDN Maospati 3 / Tut Wuri Handayani)
              </label>
              <input
                type="url"
                value={formData.logoSekolahUrl}
                onChange={(e) =>
                  setFormData({ ...formData, logoSekolahUrl: e.target.value })
                }
                placeholder="https://... / link gambar PNG"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
              />
              {formData.logoSekolahUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-slate-500">Pratinjau:</span>
                  <img
                    src={formData.logoSekolahUrl}
                    alt="Logo Sekolah"
                    className="h-10 w-10 object-contain bg-slate-50 p-1 rounded border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                URL Logo Kabupaten (Magetan)
              </label>
              <input
                type="url"
                value={formData.logoKabupatenUrl}
                onChange={(e) =>
                  setFormData({ ...formData, logoKabupatenUrl: e.target.value })
                }
                placeholder="https://... / link gambar PNG"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
              />
              {formData.logoKabupatenUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-slate-500">Pratinjau:</span>
                  <img
                    src={formData.logoKabupatenUrl}
                    alt="Logo Kabupaten"
                    className="h-10 w-10 object-contain bg-slate-50 p-1 rounded border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            id="btn-simpan-pengaturan"
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-lg transition ${
              isSaved
                ? 'bg-emerald-600'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Pengaturan Berhasil Disimpan!' : 'Simpan Seluruh Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* Firebase Info Modal */}
      {showFirebaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <span>Status Koneksi Cloud Firestore</span>
            </h3>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Aplikasi telah terhubung ke cloud database resmi SD Negeri Maospati 3 di Google Cloud / Firebase Firestore.
            </p>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] mb-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Project ID:</span>
                <span className="text-slate-900 font-semibold">{firebaseConfig.projectId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Firestore Database ID:</span>
                <span className="text-blue-700 font-semibold">{firebaseConfig.firestoreDatabaseId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Region Cloud:</span>
                <span className="text-slate-900">asia-southeast1 (Jakarta / Singapore)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Status Proteksi Kuota:</span>
                <span className="text-emerald-700 font-semibold font-sans">
                  Aktif (Local-First High-Speed Cache + Synchronized Mutation)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFirebaseModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
