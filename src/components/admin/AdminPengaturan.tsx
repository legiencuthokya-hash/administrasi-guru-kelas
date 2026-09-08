import React, { useState } from 'react';
import { SchoolSettings } from '../../types';
import { Settings, Save, Check, Image, School, MapPin, PenTool, Database } from 'lucide-react';
import { isFirebaseReady, initFirebase } from '../../services/firebase';

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

  // Optional custom Firebase config
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [firebaseConfigText, setFirebaseConfigText] = useState(
    localStorage.getItem('sdn3_firebase_config') || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveFirebaseConfig = () => {
    try {
      if (!firebaseConfigText.trim()) {
        localStorage.removeItem('sdn3_firebase_config');
        alert('Konfigurasi Firebase dihapus. Menggunakan penyimpanan lokal.');
        setShowFirebaseModal(false);
        return;
      }
      const parsed = JSON.parse(firebaseConfigText);
      localStorage.setItem('sdn3_firebase_config', JSON.stringify(parsed));
      const ok = initFirebase(parsed);
      alert(
        ok
          ? 'Koneksi Firebase Firestore berhasil diinisialisasi!'
          : 'Konfigurasi tersimpan, periksa kembali API Key dan Project ID Anda.'
      );
      setShowFirebaseModal(false);
    } catch (e) {
      alert('Format JSON konfigurasi Firebase tidak valid. Pastikan format JSON benar.');
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
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
        >
          <Database className="w-4 h-4 text-amber-600" />
          <span>Pengaturan Firebase</span>
        </button>
      </div>

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

      {/* Firebase Config Modal */}
      {showFirebaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600" />
              <span>Konfigurasi Firebase Firestore</span>
            </h3>
            <p className="text-slate-600 mb-3 leading-relaxed">
              Aplikasi telah dilengkapi penyimpanan lokal instan super cepat untuk menghemat kuota baca Firestore. Untuk menyambungkan ke Firebase Console Anda, tempel objek konfigurasi JSON Firebase:
            </p>

            <textarea
              rows={6}
              value={firebaseConfigText}
              onChange={(e) => setFirebaseConfigText(e.target.value)}
              placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "sdn-maospati-3.firebaseapp.com",\n  "projectId": "sdn-maospati-3"\n}`}
              className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFirebaseModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveFirebaseConfig}
                className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 shadow-md shadow-amber-600/20"
              >
                Terapkan & Sambungkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
