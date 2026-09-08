export type UserRole = 'admin' | 'guru';

export type TanggungJawab =
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

export const DAFTAR_KELAS = [
  'Kelas 1',
  'Kelas 2',
  'Kelas 3',
  'Kelas 4',
  'Kelas 5',
  'Kelas 6',
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
