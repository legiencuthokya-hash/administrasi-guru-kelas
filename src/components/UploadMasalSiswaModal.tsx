import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Siswa, User, DAFTAR_KELAS, DAFTAR_AGAMA } from '../types';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
  HelpCircle,
  Check,
  RefreshCw,
} from 'lucide-react';
import { isGuruMapelUmum, getSiswaCsvTemplate, parseCSV } from '../services/storage';
import { exportSiswaExcelTemplate } from '../services/excelExport';

interface UploadMasalSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentClass: string;
  existingStudents: Siswa[];
  onImportSuccess: (imported: Siswa[], mode: 'append' | 'replace', targetClass: string) => void;
}

interface ParsedStudentRow {
  nisn: string;
  nis: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  kelas: string;
  agama: string;
  isValid: boolean;
  errorNote?: string;
}

export const UploadMasalSiswaModal: React.FC<UploadMasalSiswaModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentClass,
  existingStudents,
  onImportSuccess,
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';
  const isSubjectTeacher = isGuruMapelUmum(currentUser.tanggungJawab);
  const canChooseAnyClass = isAdmin || isSubjectTeacher;

  // Initial target class: if Guru Kelas, strictly their class. If admin/mapel, default to current filter or '1A'
  const initialClass = canChooseAnyClass
    ? (currentClass !== 'Semua' ? currentClass : '1A')
    : currentUser.tanggungJawab;

  const [targetClass, setTargetClass] = useState<string>(initialClass);
  const [autoDetectClassFromFile, setAutoDetectClassFromFile] = useState<boolean>(canChooseAnyClass);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  // Input tabs: 'file' or 'paste'
  const [activeInputTab, setActiveInputTab] = useState<'file' | 'paste'>('file');

  // File state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text paste state
  const [pastedText, setPastedText] = useState<string>('');

  // Parsed results
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  // Normalization helpers
  const normalizeGender = (val: any): 'L' | 'P' => {
    const s = String(val || '').trim().toLowerCase();
    if (s.startsWith('p') || s === 'wanita' || s === 'perempuan' || s === '2') {
      return 'P';
    }
    return 'L';
  };

  const normalizeKelas = (val: any, fallbackKelas: string): string => {
    const s = String(val || '').trim();
    if (!s) return fallbackKelas;

    // Clean prefix e.g. "Kelas 1A" -> "1A"
    const cleaned = s.replace(/^kelas\s*/i, '').replace(/\s+/g, '').toUpperCase();
    const directMatch = DAFTAR_KELAS.find((k) => k.toUpperCase() === cleaned);
    if (directMatch) return directMatch;

    // Matches '1'..'6' followed by optional A/B, or standalone number
    const matchNumLetter = cleaned.match(/^([1-6])([A-B]?)$/);
    if (matchNumLetter) {
      const num = matchNumLetter[1];
      const letter = matchNumLetter[2] || 'A';
      const candidate = `${num}${letter}`;
      if (DAFTAR_KELAS.includes(candidate)) return candidate;
    }

    const matched = DAFTAR_KELAS.find((k) => k.toLowerCase() === s.toLowerCase());
    return matched || fallbackKelas;
  };

  const normalizeAgama = (val: any): string => {
    const s = String(val || '').trim().toLowerCase();
    if (s.includes('kristen') || s.includes('protestan')) return 'Kristen';
    if (s.includes('katolik')) return 'Katolik';
    if (s.includes('hindu')) return 'Hindu';
    if (s.includes('budha') || s.includes('buddha')) return 'Budha';
    if (s.includes('konghucu') || s.includes('khonghucu')) return 'Konghucu';
    return 'Islam';
  };

  // Convert raw 2D array of strings into parsed student rows
  const processRawDataRows = (rows: any[][]) => {
    setParseError(null);
    if (!rows || rows.length === 0) {
      setParsedRows([]);
      return;
    }

    // Filter out completely blank lines
    const validRawRows = rows.filter((r) => r.some((c) => String(c || '').trim().length > 0));

    if (validRawRows.length === 0) {
      setParsedRows([]);
      return;
    }

    // Check if first row is header
    const firstRowStr = validRawRows[0].map((c) => String(c || '').toLowerCase()).join(' ');
    const isHeader =
      firstRowStr.includes('nama') ||
      firstRowStr.includes('nisn') ||
      firstRowStr.includes('nis') ||
      firstRowStr.includes('kelamin') ||
      firstRowStr.includes('jk') ||
      firstRowStr.includes('kelas');

    let headerIndices = {
      nisn: 0,
      nis: 1,
      nama: 2,
      jk: 3,
      kelas: 4,
      agama: 5,
    };

    if (isHeader) {
      const headerRow = validRawRows[0].map((c) => String(c || '').toLowerCase().trim());
      headerRow.forEach((colName, idx) => {
        if (colName.includes('nisn')) headerIndices.nisn = idx;
        else if (colName.includes('nipd') || colName === 'nis' || colName.includes('induk')) headerIndices.nis = idx;
        else if (colName.includes('nama')) headerIndices.nama = idx;
        else if (colName.includes('jk') || colName.includes('kelamin') || colName.includes('l/p')) headerIndices.jk = idx;
        else if (colName.includes('kelas') || colName.includes('rombel')) headerIndices.kelas = idx;
        else if (colName.includes('agama')) headerIndices.agama = idx;
      });
    }

    const dataRows = isHeader ? validRawRows.slice(1) : validRawRows;

    const parsed: ParsedStudentRow[] = dataRows.map((r) => {
      const nisn = String(r[headerIndices.nisn] ?? '').trim().replace(/^['"]|['"]$/g, '');
      const nis = String(r[headerIndices.nis] ?? '').trim().replace(/^['"]|['"]$/g, '');
      const rawNama = String(r[headerIndices.nama] ?? '').trim().replace(/^['"]|['"]$/g, '');
      const rawJk = r[headerIndices.jk];
      const rawKelas = r[headerIndices.kelas];
      const rawAgama = r[headerIndices.agama];

      const nama = rawNama;
      const isValid = nama.length > 0;
      const jenisKelamin = normalizeGender(rawJk);
      
      // Determine class
      let assignedKelas = targetClass;
      if (canChooseAnyClass && autoDetectClassFromFile && rawKelas) {
        assignedKelas = normalizeKelas(rawKelas, targetClass);
      } else if (!canChooseAnyClass) {
        assignedKelas = currentUser.tanggungJawab;
      }

      const agama = normalizeAgama(rawAgama);

      return {
        nisn,
        nis,
        nama,
        jenisKelamin,
        kelas: assignedKelas,
        agama,
        isValid,
        errorNote: isValid ? undefined : 'Nama siswa tidak boleh kosong',
      };
    });

    setParsedRows(parsed);
  };

  // Handle file upload
  const handleFile = async (file: File) => {
    setIsProcessingFile(true);
    setParseError(null);
    setUploadedFileName(file.name);

    try {
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Read Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
        }
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
        processRawDataRows(rows);
      } else {
        // Read text / CSV / TSV
        const text = await file.text();
        const rows = parseCSV(text);
        processRawDataRows(rows);
      }
    } catch (err: any) {
      console.error(err);
      setParseError(err?.message || 'Gagal memproses file. Pastikan format file sesuai.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteChange = (text: string) => {
    setPastedText(text);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }
    const rows = parseCSV(text);
    processRawDataRows(rows);
  };

  const handleDownloadCsv = () => {
    const template = getSiswaCsvTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `template_siswa_sdn3_${targetClass.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcel = () => {
    exportSiswaExcelTemplate(targetClass);
  };

  const handleSaveImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada data siswa yang valid untuk diimpor.');
      return;
    }

    const newStudents: Siswa[] = validRows.map((r, idx) => ({
      id: `s-${Date.now()}-${idx}-${Math.floor(Math.random() * 10000)}`,
      nisn: r.nisn,
      nis: r.nis,
      nama: r.nama,
      jenisKelamin: r.jenisKelamin,
      kelas: r.kelas,
      agama: r.agama,
      status: 'Aktif',
      updatedAt: new Date().toISOString(),
    }));

    onImportSuccess(newStudents, importMode, targetClass);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <span>Upload Masal Data Siswa</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Excel / CSV
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Impor banyak data peserta didik sekaligus ke database SD Negeri Maospati 3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Target Class & Mode Configuration */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Class */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Kelas Siswa:
                </label>
                {canChooseAnyClass ? (
                  <select
                    value={targetClass}
                    onChange={(e) => {
                      setTargetClass(e.target.value);
                      // Update parsed rows class if not auto-detecting
                      if (!autoDetectClassFromFile) {
                        setParsedRows((prev) =>
                          prev.map((r) => ({ ...r, kelas: e.target.value }))
                        );
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {DAFTAR_KELAS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800 font-semibold flex items-center justify-between">
                    <span>{currentUser.tanggungJawab}</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-normal">
                      Kelas Binaan Anda
                    </span>
                  </div>
                )}
              </div>

              {/* Import Mode */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Metode Penambahan:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg border text-center transition font-medium text-[11px] ${
                      importMode === 'append'
                        ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Tambahkan (Append)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg border text-center transition font-medium text-[11px] ${
                      importMode === 'replace'
                        ? 'bg-rose-600 border-rose-600 text-white font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Ganti seluruh siswa yang saat ini ada pada kelas target"
                  >
                    Ganti / Timpa Kelas
                  </button>
                </div>
              </div>
            </div>

            {canChooseAnyClass && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/70">
                <input
                  type="checkbox"
                  id="auto-detect-class"
                  checked={autoDetectClassFromFile}
                  onChange={(e) => setAutoDetectClassFromFile(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="auto-detect-class" className="text-[11px] text-slate-600 cursor-pointer">
                  Deteksi kelas secara otomatis dari kolom file jika tersedia (misal: "Kelas 1", "Kelas 2", dst.)
                </label>
              </div>
            )}
          </div>

          {/* Template Download & Format Guide */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50/70 border border-blue-200 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-blue-900">
              <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-[11px] font-medium">
                Belum punya format tabel? Unduh template resmi siap isi:
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Format CSV</span>
              </button>
            </div>
          </div>

          {/* Tabs for Input: File vs Paste */}
          <div>
            <div className="flex border-b border-slate-200 mb-3">
              <button
                type="button"
                onClick={() => setActiveInputTab('file')}
                className={`flex items-center gap-1.5 py-2 px-4 font-semibold text-xs border-b-2 transition ${
                  activeInputTab === 'file'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah File (Excel / CSV)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInputTab('paste')}
                className={`flex items-center gap-1.5 py-2 px-4 font-semibold text-xs border-b-2 transition ${
                  activeInputTab === 'paste'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Salin & Tempel (Copy-Paste Tabel)</span>
              </button>
            </div>

            {/* Tab 1: File Drop Zone */}
            {activeInputTab === 'file' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                    : uploadedFileName
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt,.tsv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {isProcessingFile ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="font-semibold text-slate-700">Membaca dan memvalidasi file...</span>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-900 text-xs">{uploadedFileName}</span>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      File berhasil dimuat. Klik atau seret file lain untuk mengganti.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">
                        Tarik & lepas file Excel (.xlsx) atau CSV ke sini
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Atau <span className="text-blue-600 underline font-semibold">klik untuk memilih file</span> dari komputer
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                      Mendukung .xlsx, .xls, .csv, .tsv
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Tab 2: Copy-Paste Textarea */}
            {activeInputTab === 'paste' && (
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => handlePasteChange(e.target.value)}
                  placeholder={`Salin (copy) baris tabel dari Excel / Google Sheets, lalu tempel (paste) di sini...\nContoh:\n0151234001\t3101\tAhmad Dani Saputra\tL\t1A\tIslam\n0151234002\t3102\tBella Safira\tP\t1A\tIslam`}
                  className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 italic">
                  * Tips: Salin langsung kolom NISN, NIS, Nama, JK (L/P), Kelas, Agama dari Excel lalu tekan Ctrl+V di kotak ini.
                </p>
              </div>
            )}
          </div>

          {/* Parsing Errors Banner */}
          {parseError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview of Parsed Students */}
          {parsedRows.length > 0 && (
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs">Pratinjau Data Siswa:</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {validCount} Siswa Siap Diimpor
                  </span>
                  {invalidCount > 0 && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {invalidCount} Baris Tanpa Nama (Dilewati)
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-500">
                  Menampilkan {Math.min(parsedRows.length, 8)} dari {parsedRows.length} baris
                </span>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="py-2 px-3 text-center w-10">No</th>
                        <th className="py-2 px-3">NISN / NIS</th>
                        <th className="py-2 px-3">Nama Siswa</th>
                        <th className="py-2 px-3 text-center">L/P</th>
                        <th className="py-2 px-3">Kelas</th>
                        <th className="py-2 px-3">Agama</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedRows.slice(0, 10).map((r, i) => (
                        <tr
                          key={i}
                          className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/60 text-rose-900'}
                        >
                          <td className="py-1.5 px-3 text-center text-slate-500">{i + 1}</td>
                          <td className="py-1.5 px-3 font-mono text-slate-600">
                            {r.nisn || '-'}{' '}
                            <span className="text-slate-400">/ {r.nis || '-'}</span>
                          </td>
                          <td className="py-1.5 px-3 font-semibold">
                            {r.nama || <span className="text-rose-600 italic">Nama kosong</span>}
                          </td>
                          <td className="py-1.5 px-3 text-center font-bold">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] ${
                                r.jenisKelamin === 'L'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.jenisKelamin}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-slate-700 font-medium">{r.kelas}</td>
                          <td className="py-1.5 px-3 text-slate-600">{r.agama}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-white transition"
          >
            Batal
          </button>

          <button
            id="btn-konfirmasi-upload-masal"
            type="button"
            disabled={validCount === 0}
            onClick={handleSaveImport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 px-5 rounded-xl shadow-md shadow-blue-600/20 transition"
          >
            <Check className="w-4 h-4" />
            <span>
              {validCount > 0
                ? `Simpan & Impor (${validCount} Siswa)`
                : 'Pilih File / Tempel Data Terlebih Dahulu'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
