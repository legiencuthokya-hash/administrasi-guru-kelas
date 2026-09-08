import React, { useState, useEffect } from 'react';
import { SchoolSettings, User } from '../../types';
import { Printer, FileSpreadsheet, Sliders, CheckCircle2, Image, PenTool } from 'lucide-react';

interface PrintWrapperProps {
  title: string;
  subtitle?: string;
  columnCount: number;
  settings: SchoolSettings;
  teacherUser?: User;
  onDownloadExcel: () => void;
  children: React.ReactNode;
}

export const PrintWrapper: React.FC<PrintWrapperProps> = ({
  title,
  subtitle,
  columnCount,
  settings,
  teacherUser,
  onDownloadExcel,
  children,
}) => {
  // Orientation mode: 'auto' | 'manual'
  const [orientationMode, setOrientationMode] = useState<'auto' | 'manual'>('auto');
  const [manualOrientation, setManualOrientation] = useState<'portrait' | 'landscape'>('landscape');

  // Signature mode: 'auto' (image scan) | 'manual' (wet signature space)
  const [signatureMode, setSignatureMode] = useState<'auto' | 'manual'>('auto');

  // Effective orientation
  const effectiveOrientation =
    orientationMode === 'auto'
      ? columnCount > 10
        ? 'landscape'
        : 'portrait'
      : manualOrientation;

  // Today's Indonesian date format
  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    // Set dynamic style for print orientation
    const styleId = 'print-orientation-style';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `@page { size: A4 ${effectiveOrientation}; margin: 10mm; }`;
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control Panel (Hidden during print) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-600" />
              <span>{title}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pratinjau cetak resmi dan unduh format Excel dokumen kependidikan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onDownloadExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition"
              title="Unduh format spreadsheet .xlsx"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 transition"
              title="Cetak dokumen PDF atau Printer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Orientation Config */}
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <Sliders className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="font-semibold text-slate-700">Tata Letak:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOrientationMode('auto')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  orientationMode === 'auto'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Otomatis ({effectiveOrientation === 'landscape' ? 'Landscape' : 'Portrait'})
              </button>
              <button
                type="button"
                onClick={() => setOrientationMode('manual')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  orientationMode === 'manual'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Manual
              </button>
            </div>

            {orientationMode === 'manual' && (
              <select
                value={manualOrientation}
                onChange={(e) => setManualOrientation(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 ml-1"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            )}
          </div>

          {/* Signature Config */}
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <PenTool className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="font-semibold text-slate-700">Tanda Tangan:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSignatureMode('auto')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  signatureMode === 'auto'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
                title="Menampilkan scan gambar tanda tangan jika tersedia"
              >
                Otomatis (Scan Digital)
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('manual')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  signatureMode === 'manual'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
                title="Memberikan ruang kosong untuk tanda tangan basah langsung"
              >
                Manual (Basah)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Print Paper Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none">
        {/* Kop Surat Resmi */}
        <div className="border-b-2 border-black pb-3 mb-5 text-black">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Kabupaten (Left) */}
            <div className="w-16 h-16 flex items-center justify-center">
              {settings.logoKabupatenUrl ? (
                <img
                  src={settings.logoKabupatenUrl}
                  alt="Logo Kab"
                  className="max-h-16 max-w-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400 text-center font-serif leading-tight">
                  LOGO KAB
                </div>
              )}
            </div>

            {/* Kop Text */}
            <div className="text-center flex-1">
              <div className="text-xs font-serif uppercase tracking-widest leading-tight">
                PEMERINTAH KABUPATEN MAGETAN
              </div>
              <div className="text-xs font-serif uppercase tracking-widest leading-tight">
                DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA
              </div>
              <div className="text-sm sm:text-base font-bold font-serif uppercase tracking-tight leading-tight mt-0.5">
                {settings.namaSekolah || 'SD NEGERI MAOSPATI 3'}
              </div>
              <div className="text-[10px] font-sans text-slate-600 leading-tight mt-0.5">
                {settings.alamatSekolah} • NPSN: {settings.npsn}
              </div>
            </div>

            {/* Logo Sekolah (Right) */}
            <div className="w-16 h-16 flex items-center justify-center">
              {settings.logoSekolahUrl ? (
                <img
                  src={settings.logoSekolahUrl}
                  alt="Logo Sekolah"
                  className="max-h-16 max-w-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400 text-center font-serif leading-tight">
                  LOGO SEKOLAH
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-4 text-black">
          <h3 className="font-serif font-bold text-sm sm:text-base uppercase tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-medium text-slate-700 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Dynamic Table/Content */}
        <div className="mb-8">{children}</div>

        {/* Official Signature Section */}
        <div className="pt-4 page-break-inside-avoid text-black font-serif text-xs">
          <div className="flex justify-between items-start">
            {/* Left: Guru Kelas / Guru Pengajar */}
            <div className="w-64 text-center">
              <div>Mengetahui,</div>
              <div className="font-semibold">
                {teacherUser?.tanggungJawab ? `Guru ${teacherUser.tanggungJawab}` : 'Guru Pengajar'}
              </div>

              {/* Signature space or image */}
              <div className="h-20 flex items-center justify-center my-1">
                {signatureMode === 'auto' && teacherUser?.tandaTanganUrl ? (
                  <img
                    src={teacherUser.tandaTanganUrl}
                    alt="TTD Guru"
                    className="max-h-16 max-w-36 object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-[10px] text-slate-300 italic no-print">
                    (Ruang TTD Guru)
                  </div>
                )}
              </div>

              <div className="font-bold underline">
                {teacherUser?.nama || '...........................................'}
              </div>
              <div className="text-[11px]">
                NIP. {teacherUser?.nip || '.......................................'}
              </div>
            </div>

            {/* Right: Kepala Satuan Pendidikan */}
            <div className="w-64 text-center">
              <div>
                {settings.lokasiTandaTangan || 'Maospati'}, {dateStr}
              </div>
              <div className="font-semibold">Kepala Satuan Pendidikan</div>

              {/* Signature space or image */}
              <div className="h-20 flex items-center justify-center my-1">
                {signatureMode === 'auto' && settings.tandaTanganKepalaUrl ? (
                  <img
                    src={settings.tandaTanganKepalaUrl}
                    alt="TTD Kepala"
                    className="max-h-16 max-w-36 object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-[10px] text-slate-300 italic no-print">
                    (Ruang TTD Kepala)
                  </div>
                )}
              </div>

              <div className="font-bold underline">
                {settings.namaKepala || '...........................................'}
              </div>
              <div className="text-[11px]">
                NIP. {settings.nipKepala || '.......................................'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
