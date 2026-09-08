import React, { useState } from 'react';
import { BimbinganSiswa, Siswa, User, DAFTAR_KELAS } from '../types';
import { isGuruMapelUmum } from '../services/storage';
import { HeartHandshake, Plus, Trash2, Edit2, X, Check, Search } from 'lucide-react';

interface BimbinganProps {
  currentUser: User;
  siswaList: Siswa[];
  bimbinganList: BimbinganSiswa[];
  onSaveBimbingan: (updated: BimbinganSiswa[]) => void;
}

export const BimbinganComponent: React.FC<BimbinganProps> = ({
  currentUser,
  siswaList,
  bimbinganList,
  onSaveBimbingan,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canAccessAllClasses = isAdmin || isSubjectTeacher;

  const [selectedSemester, setSelectedSemester] = useState<'1' | '2'>('2');
  const [selectedClass, setSelectedClass] = useState<string>(
    canAccessAllClasses ? 'Semua' : currentUser.tanggungJawab
  );

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    siswaId: '',
    siswaNama: '',
    kelas: canAccessAllClasses ? 'Kelas 1' : currentUser.tanggungJawab,
    permasalahan: '',
    penanganan: '',
    hasil: '',
    status: 'Dalam Proses' as 'Dalam Proses' | 'Selesai',
  });

  const availableStudents = siswaList.filter(
    (s) => s.kelas === formData.kelas && s.status === 'Aktif'
  );

  const filteredBimbingan = bimbinganList.filter((b) => {
    const matchesUser = isAdmin ? true : b.guruId === currentUser.id;
    const matchesSem = b.semester === selectedSemester;
    const matchesClass = selectedClass === 'Semua' ? true : b.kelas === selectedClass;
    return matchesUser && matchesSem && matchesClass;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    const targetClass = selectedClass !== 'Semua' ? selectedClass : 'Kelas 1';
    const studentsInClass = siswaList.filter(
      (s) => s.kelas === targetClass && s.status === 'Aktif'
    );

    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      siswaId: studentsInClass[0]?.id || '',
      siswaNama: studentsInClass[0]?.nama || '',
      kelas: targetClass,
      permasalahan: '',
      penanganan: '',
      hasil: '',
      status: 'Dalam Proses',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bimb: BimbinganSiswa) => {
    setEditingId(bimb.id);
    setFormData({
      tanggal: bimb.tanggal,
      siswaId: bimb.siswaId,
      siswaNama: bimb.siswaNama,
      kelas: bimb.kelas,
      permasalahan: bimb.permasalahan,
      penanganan: bimb.penanganan,
      hasil: bimb.hasil,
      status: bimb.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus catatan bimbingan siswa ini?')) {
      onSaveBimbingan(bimbinganList.filter((b) => b.id !== id));
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const s = siswaList.find((item) => item.id === studentId);
    if (s) {
      setFormData({
        ...formData,
        siswaId: s.id,
        siswaNama: s.nama,
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siswaNama.trim() || !formData.permasalahan.trim()) {
      alert('Nama siswa dan uraian permasalahan wajib diisi.');
      return;
    }

    if (editingId) {
      const updated = bimbinganList.map((b) =>
        b.id === editingId
          ? {
              ...b,
              ...formData,
              semester: selectedSemester,
              updatedAt: new Date().toISOString(),
            }
          : b
      );
      onSaveBimbingan(updated);
    } else {
      const newEntry: BimbinganSiswa = {
        id: `bimb-${Date.now()}`,
        guruId: currentUser.id,
        siswaId: formData.siswaId,
        siswaNama: formData.siswaNama,
        kelas: formData.kelas,
        tanggal: formData.tanggal,
        semester: selectedSemester,
        tahunAjaran: '2025/2026',
        permasalahan: formData.permasalahan,
        penanganan: formData.penanganan,
        hasil: formData.hasil,
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };
      onSaveBimbingan([newEntry, ...bimbinganList]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-600" />
            <span>Buku Catatan Bimbingan & Konseling Siswa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan masalah perilaku, motivasi belajar, dan tindak lanjut pembinaan siswa.
          </p>
        </div>

        <button
          id="btn-tambah-bimbingan"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Bimbingan Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Pilih Semester
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value as '1' | '2')}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="1">Semester 1 (Ganjil)</option>
            <option value="2">Semester 2 (Genap)</option>
          </select>
        </div>

        {canAccessAllClasses && (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Filter Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
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

      {/* Bimbingan List */}
      <div className="space-y-3">
        {filteredBimbingan.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs shadow-xs">
            Belum ada data bimbingan siswa di Semester {selectedSemester}.
          </div>
        ) : (
          filteredBimbingan.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {item.siswaNama}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                    {item.kelas}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Tanggal: {item.tanggal}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Edit Catatan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700">Permasalahan / Kasus: </span>
                <p className="text-slate-800 mt-0.5">{item.permasalahan}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700">Tindakan Penanganan Guru: </span>
                <p className="text-slate-600 mt-0.5">{item.penanganan || '-'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700">Hasil Pembinaan / Tindak Lanjut: </span>
                <p className="text-slate-600 mt-0.5">{item.hasil || '-'}</p>
              </div>
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
                {editingId ? 'Edit Catatan Bimbingan' : 'Catat Bimbingan Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Pembinaan *
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
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
                    onChange={(e) => {
                      const newClass = e.target.value;
                      const inNew = siswaList.filter(
                        (s) => s.kelas === newClass && s.status === 'Aktif'
                      );
                      setFormData({
                        ...formData,
                        kelas: newClass,
                        siswaId: inNew[0]?.id || '',
                        siswaNama: inNew[0]?.nama || '',
                      });
                    }}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium disabled:bg-slate-100"
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
                  Pilih Siswa *
                </label>
                <select
                  value={formData.siswaId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  required
                >
                  <option value="">-- Pilih Siswa --</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nisn || s.nis || 'No-NIS'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Permasalahan / Kasus Siswa *
                </label>
                <textarea
                  rows={2}
                  value={formData.permasalahan}
                  onChange={(e) =>
                    setFormData({ ...formData, permasalahan: e.target.value })
                  }
                  placeholder="Contoh: Kerap mengantuk di jam pelajaran atau tidak mengerjakan tugas..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tindakan Penanganan / Bimbingan
                </label>
                <textarea
                  rows={2}
                  value={formData.penanganan}
                  onChange={(e) =>
                    setFormData({ ...formData, penanganan: e.target.value })
                  }
                  placeholder="Contoh: Konseling tatap muka, pemberian motivasi, pemanggilan orang tua..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hasil Pembinaan
                  </label>
                  <input
                    type="text"
                    value={formData.hasil}
                    onChange={(e) =>
                      setFormData({ ...formData, hasil: e.target.value })
                    }
                    placeholder="Contoh: Siswa berkomitmen berubah"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Bimbingan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'Dalam Proses' | 'Selesai',
                      })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  >
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
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
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Catatan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
