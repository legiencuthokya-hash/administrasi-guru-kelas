import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, CheckCircle2 } from 'lucide-react';
import { deleteTeacherData } from '../services/storage';

interface ResetDataGuruModalProps {
  isOpen: boolean;
  onClose: () => void;
  guruId: string;
  guruNama: string;
  onSuccess: () => void;
}

export const ResetDataGuruModal: React.FC<ResetDataGuruModalProps> = ({
  isOpen,
  onClose,
  guruId,
  guruNama,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [typedConfirm, setTypedConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedSummary, setDeletedSummary] = useState<any>(null);

  if (!isOpen) return null;

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalDelete = async () => {
    if (typedConfirm.trim().toUpperCase() !== 'HAPUS DATA') {
      alert('Ketik kata "HAPUS DATA" untuk melanjutkan.');
      return;
    }

    setIsDeleting(true);
    try {
      const summary = await deleteTeacherData(guruId);
      setDeletedSummary(summary);
      onSuccess();
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setTypedConfirm('');
    setDeletedSummary(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5 text-rose-600 font-bold text-lg">
            <AlertTriangle className="w-6 h-6" />
            <span>Hapus Semua Data Guru</span>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {deletedSummary ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">
              Data Berhasil Dihapus!
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Data Anda ({guruNama}) telah dibersihkan:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 text-left space-y-1 mb-5">
              <div>• Data Absensi: {deletedSummary.absensiCount} data</div>
              <div>• Data Nilai Harian: {deletedSummary.nilaiCount} data</div>
              <div>• Jurnal Mengajar: {deletedSummary.jurnalCount} data</div>
              <div>• Bimbingan Siswa: {deletedSummary.bimbinganCount} data</div>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
            >
              Tutup
            </button>
          </div>
        ) : step === 1 ? (
          <div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 mb-4 leading-relaxed">
              <strong>Peringatan Tahap 1/2:</strong> Tindakan ini akan menghapus <strong>semua data tersimpan</strong> milik akun <strong>{guruNama}</strong>, yang meliputi:
              <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-rose-700 font-medium">
                <li>Seluruh riwayat Daftar Hadir (Absen)</li>
                <li>Seluruh Penilaian Harian (Nilai Bab)</li>
                <li>Seluruh Jurnal Catatan Mengajar</li>
                <li>Seluruh Catatan Bimbingan Siswa</li>
              </ul>
            </div>
            <p className="text-xs text-slate-600 mb-5">
              Data yang terhapus tidak dapat dikembalikan. Untuk melanjutkan, konfirmasi langkah pertama di bawah.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Batalkan
              </button>
              <button
                type="button"
                id="btn-confirm-reset-step1"
                onClick={handleFirstConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-md shadow-rose-600/20"
              >
                Lanjut ke Konfirmasi 2
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-rose-100/80 border-2 border-rose-400 rounded-xl p-3.5 text-xs text-rose-900 mb-4 leading-relaxed font-medium">
              ⚠️ <strong>Konfirmasi Terakhir (2/2):</strong>
              <p className="mt-1">
                Ketik kata <span className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-rose-700 border border-rose-300">HAPUS DATA</span> di bawah ini untuk mengonfirmasi penghapusan permanen.
              </p>
            </div>

            <div className="mb-5">
              <input
                id="input-confirm-text"
                type="text"
                value={typedConfirm}
                onChange={(e) => setTypedConfirm(e.target.value)}
                placeholder="Ketik: HAPUS DATA"
                className="w-full border-2 border-slate-300 focus:border-rose-600 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 uppercase focus:outline-none"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Kembali
              </button>
              <button
                type="button"
                id="btn-confirm-reset-step2"
                onClick={handleFinalDelete}
                disabled={isDeleting || typedConfirm.trim().toUpperCase() !== 'HAPUS DATA'}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-700/30 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Menghapus...' : 'Hapus Permanen'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
