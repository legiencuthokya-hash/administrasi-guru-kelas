import React, { useState } from 'react';
import { Siswa, DAFTAR_KELAS, DAFTAR_AGAMA } from '../../types';
import {
  GraduationCap,
  Download,
  Upload,
  Trash2,
  Search,
  AlertTriangle,
  X,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import {
  deleteAllStudents,
  getSiswaCsvTemplate,
  parseCSV,
} from '../../services/storage';
import { exportSiswaExcelTemplate } from '../../services/excelExport';

interface AdminSiswaProps {
  siswaList: Siswa[];
  onSaveSiswa: (updated: Siswa[]) => void;
}

export const AdminSiswa: React.FC<AdminSiswaProps> = ({
  siswaList,
  onSaveSiswa,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  // CSV Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  const filteredStudents = siswaList.filter((s) => {
    const matchesClass =
      selectedClass === 'Semua' ? true : s.kelas === selectedClass;
    const matchesSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm) ||
      s.nis.includes(searchTerm);
    return matchesClass && matchesSearch;
  });

  const handleDownloadTemplate = () => {
    const template = getSiswaCsvTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_siswa_sdn3.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAllStudents = async () => {
    if (
      confirm(
        '⚠️ PERINGATAN ADMIN: Apakah Anda yakin ingin MENGHAPUS SELURUH DATA SISWA SEKOLAH?'
      )
    ) {
      if (
        confirm(
          'Konfirmasi ke-2: Seluruh data siswa kelas 1-6 akan dibersihkan. Lanjutkan?'
        )
      ) {
        await deleteAllStudents();
        onSaveSiswa([]);
      }
    }
  };

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

    const dataRows = rows.slice(1);
    const newStudents: Siswa[] = [];

    for (const r of dataRows) {
      if (r.length < 3 || !r[2]) continue;
      const nisn = r[0] || '';
      const nis = r[1] || '';
      const nama = r[2] || 'Nama Siswa';
      const jenisKelamin = r[3]?.trim().toUpperCase() === 'P' ? 'P' : 'L';
      const rawKelas = r[4] || '1A';
      const kelas = rawKelas.replace(/^kelas\s*/i, '').trim().toUpperCase() || '1A';
      const agama = r[5] || 'Islam';

      newStudents.push({
        id: `s-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        nisn,
        nis,
        nama,
        jenisKelamin,
        kelas,
        agama,
        status: 'Aktif',
        updatedAt: new Date().toISOString(),
      });
    }

    if (newStudents.length === 0) {
      alert('Tidak ada data siswa yang valid terbaca dari CSV.');
      return;
    }

    onSaveSiswa([...siswaList, ...newStudents]);
    setIsCsvModalOpen(false);
    setCsvText('');
    alert(`Berhasil menambahkan ${newStudents.length} data siswa secara masal!`);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span>Manajemen Siswa Masal (Administrator)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data siswa secara terpusat dan unggah masal format CSV untuk seluruh kelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportSiswaExcelTemplate(selectedClass !== 'Semua' ? selectedClass : 'Kelas 1')}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-2 rounded-xl transition"
            title="Unduh Format Excel (.xlsx) Siap Isi"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Template Excel</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition"
            title="Unduh Format CSV Siswa"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Template CSV</span>
          </button>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition"
          >
            <Upload className="w-4 h-4" />
            <span>Input Masal CSV</span>
          </button>
        </div>
      </div>

      {/* Class distribution capsules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-12 gap-2 text-xs">
        {DAFTAR_KELAS.map((k) => {
          const count = siswaList.filter((s) => s.kelas === k).length;
          return (
            <div
              key={k}
              onClick={() => setSelectedClass(k)}
              className={`p-3 rounded-xl border cursor-pointer transition text-center ${
                selectedClass === k
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-[11px] text-slate-500">{k}</div>
              <div className="text-lg font-black mt-0.5">{count} Siswa</div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="sm:w-56">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Semua">Semua Kelas (1A - 6B)</option>
            {DAFTAR_KELAS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama siswa, NISN, atau NIS..."
            className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">NISN / NIS</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Agama</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada siswa ditemukan.
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
                    <td className="py-2.5 px-4 text-center font-bold">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Hapus Semua Siswa */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Zona Bahaya: Hapus Semua Data Siswa</span>
          </h4>
          <p className="text-[11px] text-rose-700 mt-0.5">
            Menghapus seluruh data siswa di sekolah ({siswaList.length} siswa).
          </p>
        </div>

        <button
          onClick={handleDeleteAllStudents}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs"
        >
          <Trash2 className="w-4 h-4" />
          <span>Hapus Semua Siswa</span>
        </button>
      </div>

      {/* Modal Mass CSV Siswa */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Unggah Masal Data Siswa (CSV)</span>
              </h3>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 mb-3 leading-relaxed">
              Salin dan tempel data CSV siswa di bawah ini dengan urutan kolom:
              <code className="block bg-slate-100 p-2 rounded-lg font-mono text-[11px] text-slate-800 mt-1 border border-slate-200">
                NISN,NIS,NAMA,JENIS_KELAMIN(L/P),KELAS(1A-6B),AGAMA
              </code>
            </p>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Contoh:&#10;0151234010,3110,Ahmad Dani Saputra,L,1A,Islam&#10;0151234011,3111,Bella Safira,P,1A,Islam"
              className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
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
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
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
