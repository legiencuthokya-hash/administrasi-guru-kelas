import React, { useState } from 'react';
import { TanggungJawab, User, DAFTAR_KELAS } from '../../types';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  X,
  Check,
  Upload,
} from 'lucide-react';
import {
  deleteAllTeachers,
  getGuruCsvTemplate,
  parseCSV,
} from '../../services/storage';

interface AdminGuruProps {
  users: User[];
  onSaveUsers: (updated: User[]) => void;
}

const ALL_TANGGUNG_JAWAB: TanggungJawab[] = [
  'Kelas 1',
  'Kelas 2',
  'Kelas 3',
  'Kelas 4',
  'Kelas 5',
  'Kelas 6',
  'Pendidikan Agama Islam',
  'Pendidikan Agama Kristen',
  'Pendidikan Agama Katolik',
  'Pendidikan agama Hindu',
  'Pendidikan agama Budha',
  'PJOK',
];

export const AdminGuru: React.FC<AdminGuruProps> = ({ users, onSaveUsers }) => {
  const teachers = users.filter((u) => u.role === 'guru');

  // Modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    nama: '',
    nip: '',
    tanggungJawab: 'Kelas 1' as TanggungJawab,
    password: 'Garuda123',
    tandaTanganUrl: '',
  });

  // CSV Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      username: '',
      nama: '',
      nip: '',
      tanggungJawab: 'Kelas 1',
      password: 'Garuda123',
      tandaTanganUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guru: User) => {
    setEditingId(guru.id);
    setFormData({
      username: guru.username,
      nama: guru.nama,
      nip: guru.nip || '',
      tanggungJawab: guru.tanggungJawab,
      password: guru.password || 'Garuda123',
      tandaTanganUrl: guru.tandaTanganUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteOne = (id: string, nama: string) => {
    if (confirm(`Hapus guru "${nama}" dari sistem?`)) {
      onSaveUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleDeleteAllGuru = async () => {
    if (
      confirm(
        '⚠️ PERINGATAN ADMIN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA GURU? (Akun admin akan tetap aman)'
      )
    ) {
      if (
        confirm(
          'Konfirmasi ke-2: Ketuk OK jika Anda benar-benar yakin ingin mengosongkan daftar seluruh guru!'
        )
      ) {
        await deleteAllTeachers();
        onSaveUsers(users.filter((u) => u.role === 'admin'));
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.username.trim()) {
      alert('Nama dan Username wajib diisi.');
      return;
    }

    if (editingId) {
      const updated = users.map((u) =>
        u.id === editingId
          ? {
              ...u,
              ...formData,
              updatedAt: new Date().toISOString(),
            }
          : u
      );
      onSaveUsers(updated);
    } else {
      const newGuru: User = {
        id: `guru-${Date.now()}`,
        role: 'guru',
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      onSaveUsers([...users, newGuru]);
    }
    setIsModalOpen(false);
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const template = getGuruCsvTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_guru_sdn3.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse bulk CSV input
  const handleProcessCsv = () => {
    if (!csvText.trim()) {
      alert('Silakan tempel isi CSV terlebih dahulu.');
      return;
    }

    const rows = parseCSV(csvText);
    if (rows.length < 2) {
      alert('Format CSV minimal memiliki 1 baris header dan 1 baris data.');
      return;
    }

    // Skip header row
    const dataRows = rows.slice(1);
    const newGurus: User[] = [];

    for (const r of dataRows) {
      if (r.length < 2 || !r[0]) continue;
      const username = r[0] || `guru_${Date.now()}_${Math.floor(Math.random() * 100)}`;
      const nama = r[1] || 'Nama Guru';
      const nip = r[2] || '';
      const tanggungJawab = (r[3] as TanggungJawab) || 'Kelas 1';

      newGurus.push({
        id: `guru-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        username,
        nama,
        nip,
        role: 'guru',
        tanggungJawab,
        password: 'Garuda123',
        updatedAt: new Date().toISOString(),
      });
    }

    if (newGurus.length === 0) {
      alert('Tidak ada data guru yang valid terbaca dari CSV.');
      return;
    }

    onSaveUsers([...users, ...newGurus]);
    setIsCsvModalOpen(false);
    setCsvText('');
    alert(`Berhasil menambahkan ${newGurus.length} data guru secara masal!`);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Manajemen Guru & Tenaga Pendidik</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun pengajar, tanggung jawab kelas/mapel, serta unggah masal format CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition"
            title="Unduh Format CSV Guru"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Template CSV</span>
          </button>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-2 rounded-xl transition"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Input Masal CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-4">Username Login</th>
                <th className="py-3 px-4">Tanggung Jawab</th>
                <th className="py-3 px-4 text-center">TTD Digital</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Belum ada guru yang terdaftar.
                  </td>
                </tr>
              ) : (
                teachers.map((guru, idx) => (
                  <tr key={guru.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{guru.nama}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        NIP: {guru.nip || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {guru.username}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                        {guru.tanggungJawab}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {guru.tandaTanganUrl ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          Terpasang
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Belum ada
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => handleOpenEdit(guru)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Guru"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOne(guru.id, guru.nama)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Guru"
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

      {/* Admin Danger Zone for Teachers */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Zona Bahaya: Hapus Semua Data Guru</span>
          </h4>
          <p className="text-[11px] text-rose-700 mt-0.5">
            Menghapus seluruh akun guru terdaftar sekaligus. Gunakan hanya bila diperlukan inisialisasi ulang tahun ajaran.
          </p>
        </div>

        <button
          onClick={handleDeleteAllGuru}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs"
        >
          <Trash2 className="w-4 h-4" />
          <span>Hapus Semua Guru</span>
        </button>
      </div>

      {/* Modal Add / Edit Guru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingId ? 'Edit Profil Guru' : 'Tambah Guru Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Guru Beserta Gelar *
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Siti Rahmawati, S.Pd"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Username Login *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Contoh: sitirahma"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIP Guru
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="18 digit NIP"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggung Jawab (Kelas / Mata Pelajaran) *
                </label>
                <select
                  value={formData.tanggungJawab}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggungJawab: e.target.value as TanggungJawab,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {ALL_TANGGUNG_JAWAB.map((tj) => (
                    <option key={tj} value={tj}>
                      {tj}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  *Guru Agama dan PJOK otomatis diberi izin mengakses data siswa semua kelas.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Default: Garuda123"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL Scan Tanda Tangan Guru (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.tandaTanganUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, tandaTanganUrl: e.target.value })
                  }
                  placeholder="https://... / link gambar transparan"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
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
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Guru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mass CSV Upload */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <span>Unggah Masal Data Guru (CSV)</span>
              </h3>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 mb-3 leading-relaxed">
              Salin dan tempel data CSV teks guru di bawah ini. Pastikan baris pertama berisi tajuk kolom (header):
              <code className="block bg-slate-100 p-2 rounded-lg font-mono text-[11px] text-slate-800 mt-1 border border-slate-200">
                USERNAME,NAMA,NIP,TANGGUNG_JAWAB
              </code>
            </p>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Contoh:&#10;guru_budi,Budi Santoso S.Pd,198001012005011001,Kelas 2&#10;guru_rahmat,Rahmat Hidayat S.Pd.I,198505052010011002,Pendidikan Agama Islam"
              className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessCsv}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Proses dan Simpan Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
