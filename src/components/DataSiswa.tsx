import React, { useState } from 'react';
import { Siswa, User, DAFTAR_KELAS, DAFTAR_AGAMA } from '../types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  GraduationCap,
  X,
  Check,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { isGuruMapelUmum, getSiswaCsvTemplate } from '../services/storage';
import { exportSiswaExcelTemplate } from '../services/excelExport';
import { UploadMasalSiswaModal } from './UploadMasalSiswaModal';

interface DataSiswaProps {
  currentUser: User;
  siswaList: Siswa[];
  onSaveSiswa: (updatedList: Siswa[]) => void;
}

export const DataSiswa: React.FC<DataSiswaProps> = ({
  currentUser,
  siswaList,
  onSaveSiswa,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canAccessAllClasses = isAdmin || isSubjectTeacher;

  // Selected class for viewing/filtering
  const defaultClass = canAccessAllClasses ? 'Semua' : currentUser.tanggungJawab;
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nisn: '',
    nis: '',
    nama: '',
    jenisKelamin: 'L' as 'L' | 'P',
    kelas: canAccessAllClasses ? '1A' : currentUser.tanggungJawab,
    agama: 'Islam',
    status: 'Aktif' as 'Aktif' | 'Pindah' | 'Lulus',
  });

  // Filter students based on role and active selection
  const filteredStudents = siswaList.filter((s) => {
    const matchesClass =
      selectedClass === 'Semua' ? true : s.kelas === selectedClass;
    const matchesSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm) ||
      s.nis.includes(searchTerm);
    return matchesClass && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      nisn: '',
      nis: '',
      nama: '',
      jenisKelamin: 'L',
      kelas: selectedClass !== 'Semua' ? selectedClass : '1A',
      agama: 'Islam',
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (siswa: Siswa) => {
    setEditingId(siswa.id);
    setFormData({
      nisn: siswa.nisn,
      nis: siswa.nis,
      nama: siswa.nama,
      jenisKelamin: siswa.jenisKelamin,
      kelas: siswa.kelas,
      agama: siswa.agama,
      status: siswa.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa "${nama}"?`)) {
      const updated = siswaList.filter((s) => s.id !== id);
      onSaveSiswa(updated);
    }
  };

  const handleDownloadTemplateExcel = () => {
    const target = selectedClass !== 'Semua' ? selectedClass : (currentUser.role === 'admin' ? 'Kelas 1' : currentUser.tanggungJawab);
    exportSiswaExcelTemplate(target);
    setShowTemplateDropdown(false);
  };

  const handleDownloadTemplateCsv = () => {
    const template = getSiswaCsvTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const target = selectedClass !== 'Semua' ? selectedClass : (currentUser.role === 'admin' ? 'Kelas 1' : currentUser.tanggungJawab);
    link.setAttribute('download', `template_siswa_${target.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowTemplateDropdown(false);
  };

  const handleImportSuccess = (
    newStudents: Siswa[],
    mode: 'append' | 'replace',
    targetClass: string
  ) => {
    let updated: Siswa[] = [];
    if (mode === 'replace') {
      // Find classes affected by imported students
      const affectedClasses = new Set(newStudents.map((s) => s.kelas));
      const keptStudents = siswaList.filter((s) => !affectedClasses.has(s.kelas));
      updated = [...keptStudents, ...newStudents];
    } else {
      updated = [...siswaList, ...newStudents];
    }
    onSaveSiswa(updated);
    setAlertMessage({
      text: `Berhasil mengimpor ${newStudents.length} data peserta didik secara masal! Data tersimpan & otomatis tersinkronisasi ke Cloud.`,
    });
    setTimeout(() => setAlertMessage(null), 6000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      alert('Nama siswa wajib diisi');
      return;
    }

    if (editingId) {
      // Edit
      const updated = siswaList.map((s) =>
        s.id === editingId
          ? {
              ...s,
              ...formData,
              updatedAt: new Date().toISOString(),
            }
          : s
      );
      onSaveSiswa(updated);
    } else {
      // Add
      const newSiswa: Siswa = {
        id: `s-${Date.now()}`,
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      onSaveSiswa([...siswaList, newSiswa]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Data Peserta Didik (Siswa)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {canAccessAllClasses
              ? 'Kelola data seluruh siswa kelas 1A s/d 6B'
              : `Kelola data siswa di ${currentUser.tanggungJawab}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Template Download Dropdown */}
          <div className="relative">
            <button
              id="btn-unduh-template-siswa"
              type="button"
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl transition"
              title="Unduh format template Excel atau CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Template</span>
            </button>

            {showTemplateDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-40 space-y-1 text-xs">
                <button
                  type="button"
                  onClick={handleDownloadTemplateExcel}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold">Template Excel (.xlsx)</div>
                    <div className="text-[10px] text-slate-400">Direkomendasikan</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplateCsv}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition text-left"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-semibold">Template CSV (.csv)</div>
                    <div className="text-[10px] text-slate-400">Format teks koma</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Bulk Upload Button */}
          <button
            id="btn-upload-masal-siswa"
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-sm transition"
            title="Unggah banyak siswa sekaligus dari file Excel atau CSV"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Masal</span>
          </button>

          {/* Single Add Button */}
          <button
            id="btn-tambah-siswa"
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Success / Alert Banner */}
      {alertMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            alertMessage.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span className="font-medium">{alertMessage.text}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Class Filter (only if can access all classes) */}
        {canAccessAllClasses && (
          <div className="sm:w-56">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Kelas (1A - 6B)</option>
              {DAFTAR_KELAS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, NISN, atau NIS siswa..."
            className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">NISN / NIS</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Agama</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    Belum ada data siswa ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 text-center text-slate-500 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {s.nisn || '-'}{' '}
                      <span className="text-slate-400">/ {s.nis || '-'}</span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {s.nama}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-600">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                          s.jenisKelamin === 'L'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">
                      {s.kelas}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{s.agama || '-'}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.nama)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Muhammad Budi Santoso"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NISN
                  </label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="10 digit NISN"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIS
                  </label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="Nomor Induk Siswa"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) =>
                      setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Agama
                  </label>
                  <select
                    value={formData.agama}
                    onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DAFTAR_AGAMA.map((ag) => (
                      <option key={ag} value={ag}>
                        {ag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kelas
                  </label>
                  <select
                    value={formData.kelas}
                    disabled={!canAccessAllClasses}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  >
                    {DAFTAR_KELAS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pindah">Pindah</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Masal Siswa Modal */}
      <UploadMasalSiswaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentUser={currentUser}
        currentClass={selectedClass}
        existingStudents={siswaList}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};
