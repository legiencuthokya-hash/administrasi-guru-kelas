export type UserRole = 'admin' | 'guru';

export type TemaWarnaId =
  | 'blue'
  | 'emerald'
  | 'indigo'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'teal'
  | 'slate';

export type TanggungJawab =
  | '1A'
  | '1B'
  | '2A'
  | '2B'
  | '3A'
  | '3B'
  | '4A'
  | '4B'
  | '5A'
  | '5B'
  | '6A'
  | '6B'
  | 'Kelas 1'
  | 'Kelas 2'
  | 'Kelas 3'
  | 'Kelas 4'
  | 'Kelas 5'
  | 'Kelas 6'
  | 'Pendidikan Agama Islam'
  | 'Pendidikan Agama Kristen'
  | 'Pendidikan Agama Katolik'
  | 'Pendidikan agama Hindu'
  | 'Pendidikan agama Budha'
  | 'PJOK'
  | 'Administrator';

export const DAFTAR_TANGGUNG_JAWAB: TanggungJawab[] = [
  '1A',
  '1B',
  '2A',
  '2B',
  '3A',
  '3B',
  '4A',
  '4B',
  '5A',
  '5B',
  '6A',
  '6B',
  'Pendidikan Agama Islam',
  'Pendidikan Agama Kristen',
  'Pendidikan Agama Katolik',
  'Pendidikan agama Hindu',
  'Pendidikan agama Budha',
  'PJOK',
];

export const DAFTAR_KELAS = [
  '1A',
  '1B',
  '2A',
  '2B',
  '3A',
  '3B',
  '4A',
  '4B',
  '5A',
  '5B',
  '6A',
  '6B',
];

export const DAFTAR_AGAMA = [
  'Islam',
  'Kristen',
  'Katolik',
  'Hindu',
  'Budha',
  'Konghucu',
];

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  nama: string;
  nip?: string;
  tanggungJawab: TanggungJawab;
  tandaTanganUrl?: string;
  temaWarna?: TemaWarnaId;
  updatedAt?: string;
}

export interface Siswa {
  id: string;
  nisn: string;
  nis: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  kelas: string;
  agama: string;
  status: 'Aktif' | 'Pindah' | 'Lulus';
  updatedAt?: string;
}

export type StatusKehadiran = 'H' | 'S' | 'I' | 'A';

export interface Absensi {
  id: string;
  tanggal: string; // YYYY-MM-DD
  bulan: string; // YYYY-MM
  semester: '1' | '2';
  tahunAjaran: string;
  kelas: string;
  guruId: string;
  mapel?: string;
  records: Record<string, StatusKehadiran>; // studentId -> status
  updatedAt?: string;
}

export interface NilaiBab {
  id: string; // bab1, bab2, etc.
  nama: string; // "Bab 1: ..."
}

export interface Nilai {
  id: string;
  siswaId: string;
  kelas: string;
  mapel: string;
  guruId: string;
  semester: '1' | '2';
  tahunAjaran: string;
  babScores: Record<string, number>; // babKey -> score (0-100)
  updatedAt?: string;
}

export interface JurnalMengajar {
  id: string;
  tanggal: string; // YYYY-MM-DD
  bulan: string; // YYYY-MM
  semester?: '1' | '2';
  tahunAjaran?: string;
  kelas: string;
  mapel: string;
  guruId: string;
  guruNama: string;
  babMateri: string;
  kegiatan: string;
  refleksi: string;
  updatedAt?: string;
}

export interface BimbinganSiswa {
  id: string;
  tanggal: string; // YYYY-MM-DD
  semester: '1' | '2';
  tahunAjaran: string;
  siswaId?: string;
  siswaNama: string;
  kelas: string;
  guruId: string;
  permasalahan: string;
  penanganan: string;
  hasil: string;
  status: 'Selesai' | 'Dalam Proses';
  updatedAt?: string;
}

export interface SchoolSettings {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  namaKepala: string;
  nipKepala: string;
  logoSekolahUrl: string;
  logoKabupatenUrl: string;
  tandaTanganKepalaUrl: string;
  lokasiTandaTangan: string; // e.g. "Maospati"
  tahunAjaranAktif: string;
  semesterAktif: '1' | '2';
  defaultTemaWarna?: TemaWarnaId;
  firebaseConfigCustom?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export type PrintOrientation = 'portrait' | 'landscape';
export type SignatureType = 'otomatis' | 'manual';

export type HariSekolah = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';

export const DAFTAR_HARI: HariSekolah[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export interface JadwalPeriodInfo {
  type: 'jp' | 'istirahat';
  jp?: number; // 1 to 10
  mulai: string;
  selesai: string;
  label: string;
  durasiMenit: number;
}

export const MASTER_TIME_SLOTS: JadwalPeriodInfo[] = [
  { type: 'jp', jp: 1, mulai: '07.10', selesai: '07.45', label: 'Jam Ke-1 (07.10 - 07.45)', durasiMenit: 35 },
  { type: 'jp', jp: 2, mulai: '07.45', selesai: '08.20', label: 'Jam Ke-2 (07.45 - 08.20)', durasiMenit: 35 },
  { type: 'jp', jp: 3, mulai: '08.20', selesai: '08.55', label: 'Jam Ke-3 (08.20 - 08.55)', durasiMenit: 35 },
  { type: 'istirahat', mulai: '08.55', selesai: '09.10', label: 'Istirahat I (08.55 - 09.10)', durasiMenit: 15 },
  { type: 'jp', jp: 4, mulai: '09.10', selesai: '09.45', label: 'Jam Ke-4 (09.10 - 09.45)', durasiMenit: 35 },
  { type: 'jp', jp: 5, mulai: '09.45', selesai: '10.20', label: 'Jam Ke-5 (09.45 - 10.20)', durasiMenit: 35 },
  { type: 'istirahat', mulai: '10.20', selesai: '10.35', label: 'Istirahat II (10.20 - 10.35)', durasiMenit: 15 },
  { type: 'jp', jp: 6, mulai: '10.35', selesai: '11.10', label: 'Jam Ke-6 (10.35 - 11.10)', durasiMenit: 35 },
  { type: 'jp', jp: 7, mulai: '11.10', selesai: '11.45', label: 'Jam Ke-7 (11.10 - 11.45)', durasiMenit: 35 },
  { type: 'istirahat', mulai: '11.45', selesai: '12.20', label: 'Istirahat III / Ishoma (11.45 - 12.20)', durasiMenit: 35 },
  { type: 'jp', jp: 8, mulai: '12.20', selesai: '12.55', label: 'Jam Ke-8 (12.20 - 12.55)', durasiMenit: 35 },
  { type: 'jp', jp: 9, mulai: '12.55', selesai: '13.30', label: 'Jam Ke-9 (12.55 - 13.30)', durasiMenit: 35 },
  { type: 'jp', jp: 10, mulai: '13.30', selesai: '14.05', label: 'Jam Ke-10 (13.30 - 14.05)', durasiMenit: 35 },
];

export interface JadwalSlot {
  id: string; // e.g. "1A-Senin-1"
  kelas: string;
  hari: HariSekolah;
  jp: number; // 1 to 10
  mapel: string;
  guruNama?: string;
  ruang?: string;
  catatan?: string;
  updatedAt?: string;
}

