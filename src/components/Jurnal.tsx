import React, { useState } from 'react';
import { JurnalMengajar, User, DAFTAR_KELAS } from '../types';
import { isGuruMapelUmum } from '../services/storage';
import { BookOpen, Plus, Trash2, Edit2, X, Check, Calendar } from 'lucide-react';

interface JurnalProps {
  currentUser: User;
  jurnalList: JurnalMengajar[];
  onSaveJurnal: (updated: JurnalMengajar[]) => void;
}

export const JurnalComponent: React.FC<JurnalProps> = ({
  currentUser,
  jurnalList,
  onSaveJurnal,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canAccessAllClasses = isAdmin || isSubjectTeacher;

  // Filter state
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterClass, setFilterClass] = useState<string>(
    canAccessAllClasses ? 'Semua' : currentUser.tanggungJawab
  );

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kelas: canAccessAllClasses ? 'Kelas 1' : currentUser.tanggungJawab,
    mapel: isSubjectTeacher ? currentUser.tanggungJawab : 'Bahasa Indonesia',
    babMateri: '',
    kegiatan: '',
    refleksi: '',
  });

  const filteredJurnal = jurnalList.filter((j) => {
    // If regular teacher, show only their journal or class
    const matchesUser = isAdmin ? true : j.guruId === currentUser.id;
    const matchesMonth = filterMonth ? j.bulan === filterMonth : true;
    const matchesClass = filterClass === 'Semua' ? true : j.kelas === filterClass;
    return matchesUser && matchesMonth && matchesClass;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      kelas: filterClass !== 'Semua' ? filterClass : 'Kelas 1',
      mapel: isSubjectTeacher ? currentUser.tanggungJawab : 'Bahasa Indonesia',
      babMateri: '',
      kegiatan: '',
      refleksi: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (jurnal: JurnalMengajar) => {
    setEditingId(jurnal.id);
    setFormData({
      tanggal: jurnal.tanggal,
      kelas: jurnal.kelas,
      mapel: jurnal.mapel,
      babMateri: jurnal.babMateri,
      kegiatan: jurnal.kegiatan,
      refleksi: jurnal.refleksi || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan jurnal mengajar ini?')) {
      onSaveJurnal(jurnalList.filter((j) => j.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.babMateri.trim() || !formData.kegiatan.trim()) {
      alert('Bab/Materi dan Uraian Kegiatan wajib diisi.');
      return;
    }

    const monthStr = formData.tanggal.substring(0, 7);
    const sem = parseInt(formData.tanggal.split('-')[1], 10) >= 7 ? '1' : '2';

    if (editingId) {
      const updated = jurnalList.map((j) =>
        j.id === editingId
          ? {
              ...j,
              ...formData,
              bulan: monthStr,
              semester: sem,
              updatedAt: new Date().toISOString(),
            }
          : j
      );
      onSaveJurnal(updated);
    } else {
      const newEntry: JurnalMengajar = {
        id: `jurnal-${Date.now()}`,
        guruId: currentUser.id,
        guruNama: currentUser.nama,
        tanggal: formData.tanggal,
        bulan: monthStr,
        semester: sem,
        tahunAjaran: '2025/2026',
        kelas: formData.kelas,
        mapel: formData.mapel,
        babMateri: formData.babMateri,
        kegiatan: formData.kegiatan,
        refleksi: formData.refleksi,
        updatedAt: new Date().toISOString(),
      };
      onSaveJurnal([newEntry, ...jurnalList]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-600" />
            <span>Jurnal Catatan Mengajar Guru</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi harian materi, kegiatan pembelajaran, dan refleksi kelas.
          </p>
        </div>

        <button
          id="btn-tambah-jurnal"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Jurnal Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Pilih Bulan
          </label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {canAccessAllClasses && (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Filter Kelas
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="Semua">Semua Kelas</option>
              {DAFTAR_KELAS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Jurnal List */}
      <div className="space-y-3">
        {filteredJurnal.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs shadow-xs">
            Belum ada catatan jurnal mengajar pada bulan {filterMonth}.
          </div>
        ) : (
          filteredJurnal.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-300 transition space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {item.tanggal}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-semibold text-[10px]">
                    {item.kelas}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-[10px]">
                    {item.mapel}
                  </span>
                  {isAdmin && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      • Oleh: {item.guruNama}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 transition"
                    title="Edit Jurnal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus Jurnal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700">Bab / Materi: </span>
                <span className="text-slate-800 font-medium">{item.babMateri}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700">Kegiatan Pembelajaran: </span>
                <p className="text-slate-600 mt-0.5 leading-relaxed whitespace-pre-line">
                  {item.kegiatan}
                </p>
              </div>

              {item.refleksi && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700">Refleksi / Catatan Guru: </span>
                  <span className="text-slate-600 italic">{item.refleksi}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingId ? 'Edit Jurnal Mengajar' : 'Tulis Jurnal Mengajar Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kelas *
                  </label>
                  <select
                    value={formData.kelas}
                    disabled={!canAccessAllClasses}
                    onChange={(e) =>
                      setFormData({ ...formData, kelas: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium disabled:bg-slate-100"
                  >
                    {DAFTAR_KELAS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mata Pelajaran *
                </label>
                <input
                  type="text"
                  value={formData.mapel}
                  onChange={(e) =>
                    setFormData({ ...formData, mapel: e.target.value })
                  }
                  placeholder="Contoh: Matematika / IPAS / Bahasa Indonesia"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bab / Materi Pokok *
                </label>
                <input
                  type="text"
                  value={formData.babMateri}
                  onChange={(e) =>
                    setFormData({ ...formData, babMateri: e.target.value })
                  }
                  placeholder="Contoh: Bab 2 - Operasi Hitung Pecahan"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Uraian Kegiatan Pembelajaran *
                </label>
                <textarea
                  rows={3}
                  value={formData.kegiatan}
                  onChange={(e) =>
                    setFormData({ ...formData, kegiatan: e.target.value })
                  }
                  placeholder="Jelaskan langkah-langkah kegiatan belajar mengajar siswa di kelas..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Refleksi / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formData.refleksi}
                  onChange={(e) =>
                    setFormData({ ...formData, refleksi: e.target.value })
                  }
                  placeholder="Catatan kendala, pemahaman siswa, atau tindak lanjut..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 shadow-md shadow-cyan-600/20 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Jurnal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
