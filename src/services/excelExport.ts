import * as XLSX from 'xlsx';
import { Absensi, BimbinganSiswa, JurnalMengajar, Nilai, Siswa } from '../types';

export function downloadExcelFile(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// 1. Export Absen Bulanan to Excel
export function exportAbsenBulananToExcel(
  bulan: string, // YYYY-MM
  kelas: string,
  siswaList: Siswa[],
  absensiList: Absensi[],
  namaSekolah: string
) {
  const [yearStr, monthStr] = bulan.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthLabel = monthNames[month - 1] || bulan;

  // Header rows
  const rows: any[][] = [
    [namaSekolah.toUpperCase()],
    [`DAFTAR HADIR SISWA BULAN ${monthLabel.toUpperCase()} ${year}`],
    [`KELAS: ${kelas}`],
    [],
  ];

  // Table header
  const tableHeader = ['No', 'NISN', 'Nama Siswa'];
  for (let d = 1; d <= daysInMonth; d++) {
    tableHeader.push(`${d}`);
  }
  tableHeader.push('H', 'S', 'I', 'A', 'Total');
  rows.push(tableHeader);

  // Filter attendance for this month & class
  const monthlyRecords = absensiList.filter((a) => a.bulan === bulan && a.kelas === kelas);
  const dateMap: Record<number, Record<string, string>> = {};
  for (const rec of monthlyRecords) {
    const day = parseInt(rec.tanggal.split('-')[2], 10);
    dateMap[day] = rec.records || {};
  }

  // Rows for each student
  siswaList.forEach((siswa, idx) => {
    const row: any[] = [idx + 1, siswa.nisn || siswa.nis || '-', siswa.nama];
    let hCount = 0;
    let sCount = 0;
    let iCount = 0;
    let aCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month - 1, d);
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

      if (isWeekend) {
        row.push('Libur');
      } else {
        const val = dateMap[d]?.[siswa.id] || '-';
        row.push(val);
        if (val === 'H') hCount++;
        else if (val === 'S') sCount++;
        else if (val === 'I') iCount++;
        else if (val === 'A') aCount++;
      }
    }

    row.push(hCount, sCount, iCount, aCount, hCount + sCount + iCount + aCount);
    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Absen ${kelas}`);
  downloadExcelFile(wb, `Absen_Bulanan_${kelas.replace(/\s+/g, '_')}_${bulan}`);
}

// 2. Export Rekap Semester to Excel
export function exportRekapSemesterToExcel(
  semester: '1' | '2',
  tahunAjaran: string,
  kelas: string,
  siswaList: Siswa[],
  absensiList: Absensi[],
  namaSekolah: string
) {
  const rows: any[][] = [
    [namaSekolah.toUpperCase()],
    [`REKAPITULASI KEHADIRAN SISWA SEMESTER ${semester}`],
    [`TAHUN AJARAN ${tahunAjaran} - KELAS: ${kelas}`],
    [],
    ['No', 'NISN', 'Nama Siswa', 'Hadir (H)', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'Total Hari', 'Persentase Hadir (%)']
  ];

  const filteredAbsensi = absensiList.filter(
    (a) => a.semester === semester && a.kelas === kelas
  );

  siswaList.forEach((siswa, idx) => {
    let hCount = 0;
    let sCount = 0;
    let iCount = 0;
    let aCount = 0;

    filteredAbsensi.forEach((absen) => {
      const val = absen.records[siswa.id];
      if (val === 'H') hCount++;
      else if (val === 'S') sCount++;
      else if (val === 'I') iCount++;
      else if (val === 'A') aCount++;
    });

    const total = hCount + sCount + iCount + aCount;
    const pct = total > 0 ? ((hCount / total) * 100).toFixed(1) + '%' : '0%';

    rows.push([
      idx + 1,
      siswa.nisn || siswa.nis || '-',
      siswa.nama,
      hCount,
      sCount,
      iCount,
      aCount,
      total,
      pct
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Rekap Sem ${semester}`);
  downloadExcelFile(wb, `Rekap_Absensi_Semester_${semester}_${kelas.replace(/\s+/g, '_')}`);
}

// 3. Export Nilai to Excel
export function exportNilaiToExcel(
  kelas: string,
  mapel: string,
  semester: '1' | '2',
  tahunAjaran: string,
  siswaList: Siswa[],
  nilaiList: Nilai[],
  babList: { id: string; nama: string }[],
  namaSekolah: string
) {
  const rows: any[][] = [
    [namaSekolah.toUpperCase()],
    [`DAFTAR NILAI HARIAN SISWA`],
    [`KELAS: ${kelas} | MAPEL: ${mapel} | SEMESTER: ${semester} (${tahunAjaran})`],
    [],
  ];

  const tableHeader = ['No', 'NISN', 'Nama Siswa'];
  babList.forEach((bab) => tableHeader.push(bab.nama));
  tableHeader.push('Rata-rata Nilai');
  rows.push(tableHeader);

  const gradeMap: Record<string, Record<string, number>> = {};
  nilaiList
    .filter((n) => n.kelas === kelas && n.mapel === mapel && n.semester === semester)
    .forEach((n) => {
      gradeMap[n.siswaId] = n.babScores || {};
    });

  siswaList.forEach((siswa, idx) => {
    const scores = gradeMap[siswa.id] || {};
    const row: any[] = [idx + 1, siswa.nisn || siswa.nis || '-', siswa.nama];
    let totalScore = 0;
    let count = 0;

    babList.forEach((bab) => {
      const sc = scores[bab.id];
      if (sc !== undefined && sc !== null && sc !== ('' as any)) {
        row.push(sc);
        totalScore += Number(sc);
        count++;
      } else {
        row.push('-');
      }
    });

    const avg = count > 0 ? (totalScore / count).toFixed(1) : '-';
    row.push(avg);
    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Nilai ${mapel}`);
  downloadExcelFile(wb, `Nilai_${mapel.replace(/\s+/g, '_')}_${kelas.replace(/\s+/g, '_')}`);
}

// 4. Export Jurnal Mengajar to Excel
export function exportJurnalToExcel(
  bulan: string,
  jurnalList: JurnalMengajar[],
  namaSekolah: string,
  namaGuru?: string
) {
  const rows: any[][] = [
    [namaSekolah.toUpperCase()],
    [`JURNAL CATATAN MENGAJAR GURU`],
    [`BULAN: ${bulan || 'SEMUA BULAN'} ${namaGuru ? `| GURU: ${namaGuru}` : ''}`],
    [],
    ['No', 'Tanggal', 'Kelas', 'Mata Pelajaran', 'Guru Pengajar', 'Bab / Materi Pokok', 'Kegiatan Pembelajaran', 'Refleksi / Catatan']
  ];

  const sorted = [...jurnalList].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  sorted.forEach((jurnal, idx) => {
    rows.push([
      idx + 1,
      jurnal.tanggal,
      jurnal.kelas,
      jurnal.mapel,
      jurnal.guruNama,
      jurnal.babMateri,
      jurnal.kegiatan,
      jurnal.refleksi || '-'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Jurnal Mengajar');
  downloadExcelFile(wb, `Jurnal_Mengajar_${bulan || 'Semua'}`);
}

// 5. Export Bimbingan Siswa to Excel
export function exportBimbinganToExcel(
  semester: '1' | '2',
  tahunAjaran: string,
  bimbinganList: BimbinganSiswa[],
  namaSekolah: string
) {
  const rows: any[][] = [
    [namaSekolah.toUpperCase()],
    [`BUKU CATATAN BIMBINGAN DAN KONSELING SISWA`],
    [`SEMESTER ${semester} (${tahunAjaran})`],
    [],
    ['No', 'Tanggal', 'Nama Siswa', 'Kelas', 'Permasalahan / Kasus', 'Penanganan / Tindakan Bimbingan', 'Hasil Pembinaan', 'Status']
  ];

  const filtered = bimbinganList
    .filter((b) => b.semester === semester)
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  filtered.forEach((bimb, idx) => {
    rows.push([
      idx + 1,
      bimb.tanggal,
      bimb.siswaNama,
      bimb.kelas,
      bimb.permasalahan,
      bimb.penanganan,
      bimb.hasil,
      bimb.status
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Bimbingan Sem ${semester}`);
  downloadExcelFile(wb, `Bimbingan_Siswa_Semester_${semester}`);
}
